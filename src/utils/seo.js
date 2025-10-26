'use strict';

const GLOBAL_CACHE_TTL = Number(process.env.SEO_GLOBAL_CACHE_TTL || 1000 * 60 * 5);

const BASE_PATHS = {
  page: process.env.SEO_PAGE_BASE_PATH || '/',
  article: process.env.SEO_ARTICLE_BASE_PATH || process.env.SEO_NEWS_BASE_PATH || '/news',
  news: process.env.SEO_NEWS_BASE_PATH || process.env.SEO_ARTICLE_BASE_PATH || '/news',
  event: process.env.SEO_EVENT_BASE_PATH || '/events',
};

const SEO_TYPE_MAP = {
  page: { content: 'webpage', schema: 'WebPage' },
  article: { content: 'article', schema: 'Article' },
  news: { content: 'news', schema: 'NewsArticle' },
  event: { content: 'event', schema: 'Event' },
};

const globalCache = {
  timestamp: 0,
  payload: null,
};

const ensureProtocol = (value = '') => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^https?:\/(?!\/)/i.test(trimmed)) {
    return trimmed.replace(/^(https?):\/(?!\/)/i, '$1://');
  }
  if (/^https?:[^/]/i.test(trimmed)) {
    return trimmed.replace(/^(https?):/i, '$1://');
  }
  if (/^\/\//.test(trimmed)) {
    return `https:${trimmed}`;
  }
  return trimmed;
};

const sanitizeBaseUrl = (value = '') => ensureProtocol(value).replace(/\/+$/, '');

const parseJsonField = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
};

const ensureAbsoluteUrl = (value, siteUrl) => {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (!siteUrl) return value;
  const suffix = value.startsWith('/') ? value : `/${value}`;
  return `${siteUrl}${suffix}`;
};

const getOrigin = (value) => {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
};

const getBackendUrl = (strapi) => {
  const configured = strapi?.config?.get('server.url');
  const envUrl =
    process.env.STRAPI_HOST_URL ||
    process.env.STRAPI_BACKEND_URL ||
    process.env.STRAPI_URL ||
    '';
  return sanitizeBaseUrl(configured || envUrl || 'http://localhost:1337');
};

const getSiteUrl = (strapi) => {
  const candidate =
    process.env.PUBLIC_SITE_URL ||
    process.env.FRONTEND_URL ||
    process.env.SITE_URL ||
    '';
  if (candidate) return sanitizeBaseUrl(candidate);

  const fallback = getBackendUrl(strapi);
  return process.env.NODE_ENV === 'production' ? '' : fallback;
};

const normalizePath = (basePath = '/', slug = '', type = '') => {
  const base = (typeof basePath === 'string' && basePath.length ? basePath : '/')
    .trim()
    .replace(/\/+$/, '');
  const slugPart = (slug || '').toString().trim();

  if (type === 'page' && (!slugPart || ['home', 'index', 'start', 'startseite'].includes(slugPart))) {
    return '/';
  }

  if (!slugPart) {
    return base || '/';
  }

  const normalizedSlug = slugPart.startsWith('/') ? slugPart : `/${slugPart}`;
  const full = `${base === '/' ? '' : base}${normalizedSlug}`.replace(/\/{2,}/g, '/');
  return full || '/';
};

const toKeywordArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => (entry || '').toString().trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const unique = (arr = []) => {
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    if (!item || seen.has(item.toLowerCase())) continue;
    seen.add(item.toLowerCase());
    result.push(item);
  }
  return result;
};

const compact = (obj = {}) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    if (
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0)
    ) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});

const normalizeMedia = (file, strapi) => {
  if (!file) return null;
  const backendUrl = getBackendUrl(strapi);
  const url = file.url || file.formats?.large?.url || file.formats?.medium?.url;
  if (!url) return null;
  const absoluteUrl = url.startsWith('http') ? url : `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  return compact({
    id: file.id,
    url: absoluteUrl,
    alternativeText: file.alternativeText || file.caption || null,
    width: file.width || null,
    height: file.height || null,
    mime: file.mime || null,
    size: file.size || null,
    format: file.ext || null,
    hash: file.hash || null,
    name: file.name || null,
  });
};

const normalizeSocialEntries = (entries = [], fallback, canonical, strapi, siteUrl) =>
  entries.map((entry) => {
    const image = normalizeMedia(entry.image || fallback, strapi);
    const targetUrl = entry.url || canonical;
    return compact({
      network: entry.socialNetwork,
      title: entry.title || null,
      description: entry.description || null,
      url: ensureAbsoluteUrl(targetUrl, siteUrl),
      image,
      imageAlt: entry.imageAlt || image?.alternativeText || null,
    });
  });

const buildWebPageSchema = ({ title, description, canonicalUrl, image, siteName }) =>
  compact({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonicalUrl || undefined,
    image: image?.url ? [image.url] : undefined,
    isPartOf: siteName
      ? {
          '@type': 'WebSite',
          name: siteName,
          url: getOrigin(canonicalUrl),
        }
      : undefined,
  });

const buildNewsSchema = ({ title, description, canonicalUrl, image, entity, siteName, favicon }) =>
  compact({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    url: canonicalUrl || undefined,
    image: image?.url ? [image.url] : undefined,
    datePublished: entity?.publicationDate || entity?.createdAt || undefined,
    dateModified: entity?.updatedAt || undefined,
    author: siteName
      ? {
          '@type': 'Organization',
          name: siteName,
        }
      : undefined,
    publisher: siteName
      ? compact({
          '@type': 'Organization',
          name: siteName,
          logo: favicon?.url
            ? {
                '@type': 'ImageObject',
                url: favicon.url,
              }
            : undefined,
        })
      : undefined,
    mainEntityOfPage: canonicalUrl
      ? {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        }
      : undefined,
  });

const buildEventSchema = ({ title, description, canonicalUrl, image, entity, siteName }) =>
  compact({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    description,
    url: canonicalUrl || undefined,
    image: image?.url ? [image.url] : undefined,
    startDate: entity?.startDate || undefined,
    endDate: entity?.endDate || undefined,
    eventStatus: entity?.eventStatus ? `https://schema.org/${entity.eventStatus}` : undefined,
    eventAttendanceMode:
      entity?.locationType === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : entity?.locationType === 'hybrid'
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    location:
      entity?.address && entity.address.street
        ? {
            '@type': 'Place',
            name: entity.venueName || entity.address.label || undefined,
            address: compact({
              '@type': 'PostalAddress',
              streetAddress: entity.address.street || undefined,
              postalCode: entity.address.zip || undefined,
              addressLocality: entity.address.city || undefined,
              addressRegion: entity.address.state || undefined,
              addressCountry: entity.address.country || undefined,
            }),
          }
        : undefined,
    organizer: siteName
      ? {
          '@type': 'Organization',
          name: siteName,
        }
      : undefined,
    offers: entity?.priceDetails
      ? {
          '@type': 'Offer',
          price: entity.priceDetails,
          priceCurrency: 'EUR',
          url: canonicalUrl || undefined,
          availability:
            entity.eventStatus === 'sold-out'
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
        }
      : undefined,
  });

const buildDefaultSchema = (type, payload) => {
  switch (type) {
    case 'news':
    case 'article':
      return buildNewsSchema(payload);
    case 'event':
      return buildEventSchema(payload);
    default:
      return buildWebPageSchema(payload);
  }
};

const fetchGlobalDefaults = async (strapi) => {
  const now = Date.now();
  if (globalCache.payload && now - globalCache.timestamp < GLOBAL_CACHE_TTL) {
    return globalCache.payload;
  }

  try {
    const result = await strapi.documents('api::global.global').findFirst({
      populate: {
        favicon: {},
        defaultSeo: {
          populate: {
            shareImage: {},
            metaSocial: {
              populate: {
                image: {},
              },
            },
            aiAssistant: {},
          },
        },
      },
    });

    globalCache.payload = result || {};
    globalCache.timestamp = now;
    return globalCache.payload;
  } catch (error) {
    strapi.log?.error?.('Failed to load global SEO defaults', error);
    return {};
  }
};

const buildSeoPayload = async ({
  entity,
  type = 'page',
  strapi,
  slugField = 'slug',
  basePath,
  fallbackImage = null,
} = {}) => {
  if (!strapi) {
    throw new Error('strapi instance is required to build SEO payload');
  }

  const globalSettings = await fetchGlobalDefaults(strapi);
  const globalSeo = globalSettings?.defaultSeo || {};
  const entitySeo = entity?.seo || {};

  const siteUrl = getSiteUrl(strapi);
  const fallbackPath = basePath || BASE_PATHS[type] || '/';

  const slugValue = entity?.[slugField];
  const canonicalFromSeo = ensureAbsoluteUrl(
    entitySeo.canonicalUrl || globalSeo.canonicalUrl || null,
    siteUrl
  );
  const path = canonicalFromSeo
    ? null
    : normalizePath(fallbackPath, slugValue, type);
  const canonicalUrl = canonicalFromSeo || (siteUrl && path ? `${siteUrl}${path === '/' ? '' : path}` : null);

  const metaTitle =
    entitySeo.metaTitle ||
    entity?.title ||
    globalSeo.metaTitle ||
    globalSettings?.siteName ||
    'Unbenannte Seite';

  const metaDescription =
    entitySeo.metaDescription ||
    entity?.summary ||
    entity?.subtitle ||
    globalSeo.metaDescription ||
    globalSettings?.siteDescription ||
    '';

  const shareImage =
    entitySeo.shareImage ||
    globalSeo.shareImage ||
    fallbackImage ||
    null;

  const shareImageNormalized = normalizeMedia(shareImage, strapi);
  const faviconNormalized = normalizeMedia(globalSettings?.favicon, strapi);

  const entityAi = entitySeo.aiAssistant || {};
  const globalAi = globalSeo.aiAssistant || {};

  const metaKeywordsRaw = entitySeo.metaKeywords || globalSeo.metaKeywords || '';
  const keywordSet = unique([
    ...toKeywordArray(metaKeywordsRaw),
    ...toKeywordArray(entitySeo.focusKeyword),
    ...toKeywordArray(parseJsonField(entityAi.generatedKeywords) || entityAi.generatedKeywords),
    ...toKeywordArray(parseJsonField(entityAi.secondaryKeywords) || entityAi.secondaryKeywords),
    ...toKeywordArray(parseJsonField(globalAi.generatedKeywords) || globalAi.generatedKeywords),
    ...toKeywordArray(parseJsonField(globalAi.secondaryKeywords) || globalAi.secondaryKeywords),
  ]);

  const contentDefaults = SEO_TYPE_MAP[type] || SEO_TYPE_MAP.page;

  const ogTitle = entitySeo.ogTitle || metaTitle;
  const ogDescription = entitySeo.ogDescription || metaDescription;
  const ogType =
    entitySeo.ogType ||
    globalSeo.ogType ||
    (type === 'event' ? 'event' : type === 'news' ? 'article' : 'website');

  const ogLocale = entitySeo.ogLocale || globalSeo.ogLocale || 'de_DE';

  const publicationDate =
    entitySeo.ogPublishedTime ||
    entity?.publicationDate ||
    entity?.startDate ||
    entity?.createdAt ||
    null;

  const updatedDate =
    entitySeo.ogModifiedTime ||
    entity?.updatedAt ||
    entity?.publishedAt ||
    null;

  const socialEntries = (entitySeo.metaSocial?.length
    ? entitySeo.metaSocial
    : globalSeo.metaSocial) || [];

  const structuredDataFromEntity = parseJsonField(entitySeo.structuredData);
  const structuredDataFromGlobal = parseJsonField(globalSeo.structuredData);

  const schemaPayload =
    structuredDataFromEntity ||
    structuredDataFromGlobal ||
    buildDefaultSchema(type, {
      title: metaTitle,
      description: metaDescription,
      canonicalUrl,
      image: shareImageNormalized,
      entity,
      siteName: globalSettings?.siteName,
      favicon: faviconNormalized,
    });

  const extraMeta =
    parseJsonField(entitySeo.extraMeta) ||
    parseJsonField(globalSeo.extraMeta) ||
    null;

  const aiAssistantPayload = entitySeo.aiAssistant || globalSeo.aiAssistant || null;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywordsRaw || null,
    keywordList: keywordSet,
    focusKeyword: entitySeo.focusKeyword || globalSeo.focusKeyword || null,
    canonicalUrl,
    robots: entitySeo.metaRobots || globalSeo.metaRobots || 'index,follow',
    viewport: entitySeo.metaViewport || globalSeo.metaViewport || 'width=device-width, initial-scale=1',
    language: entitySeo.metaLanguage || globalSeo.metaLanguage || 'de-DE',
    contentType: entitySeo.contentType || globalSeo.contentType || contentDefaults.content,
    schemaType: entitySeo.schemaType || globalSeo.schemaType || contentDefaults.schema,
    sitemap: compact({
      priority: entitySeo.sitemapPriority ?? globalSeo.sitemapPriority ?? null,
      changeFrequency: entitySeo.sitemapChangeFreq || globalSeo.sitemapChangeFreq || null,
    }),
    shareImage: shareImageNormalized,
    openGraph: compact({
      title: ogTitle,
      description: ogDescription,
      type: ogType,
      locale: ogLocale,
      url: ensureAbsoluteUrl(entitySeo.ogUrl || canonicalUrl, siteUrl),
      siteName: globalSettings?.siteName || null,
      publishedTime: publicationDate,
      modifiedTime: updatedDate,
      image: shareImageNormalized,
    }),
    twitter: compact({
      card: entitySeo.twitterCard || globalSeo.twitterCard || 'summary_large_image',
      creator: entitySeo.twitterCreator || globalSeo.twitterCreator || null,
      title: ogTitle,
      description: ogDescription,
      image: shareImageNormalized,
    }),
    social: normalizeSocialEntries(socialEntries, shareImage, canonicalUrl, strapi, siteUrl),
    structuredData: schemaPayload || null,
    aiAssistant: aiAssistantPayload,
    extraMeta,
  };
};

module.exports = {
  buildSeoPayload,
  fetchGlobalDefaults,
  BASE_PATHS,
  SEO_TYPE_MAP,
  getSiteUrl,
  normalizePath,
  sanitizeBaseUrl,
  ensureAbsoluteUrl,
};
