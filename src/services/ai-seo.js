'use strict';

const {
  BASE_PATHS,
  SEO_TYPE_MAP,
  getSiteUrl,
  normalizePath,
  ensureAbsoluteUrl,
} = require('../utils/seo');

const MODEL_CONFIG = {
  'api::page.page': { type: 'page', label: 'Seite' },
  'api::article.article': { type: 'article', label: 'Blogartikel' },
  'api::event.event': { type: 'event', label: 'Event' },
};

const ROBOTS_VALUES = new Set(['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow']);
const SITEMAP_FREQ_VALUES = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);
const CONTENT_TYPES = new Set(['website', 'webpage', 'article', 'news', 'event', 'product', 'faq', 'custom']);
const SCHEMA_TYPES = new Set([
  'WebPage',
  'Article',
  'NewsArticle',
  'BlogPosting',
  'Event',
  'Product',
  'FAQPage',
  'HowTo',
  'VideoObject',
  'Custom',
]);
const OG_TYPES = new Set(['website', 'article', 'event', 'profile', 'product', 'book']);
const TWITTER_CARDS = new Set(['summary', 'summary_large_image', 'player', 'app']);
const SOCIAL_TARGETS = ['facebook', 'linkedin', 'twitter'];
const TONE_VALUES = new Set([
  'informational',
  'conversational',
  'professional',
  'playful',
  'urgent',
  'authoritative',
  'friendly',
  'luxury',
  'technical',
]);

const TEXT_KEYS = new Set([
  'title',
  'heading',
  'subheading',
  'subtitle',
  'summary',
  'description',
  'body',
  'content',
  'text',
  'richtext',
  'quote',
  'copy',
  'paragraph',
  'intro',
  'details',
  'label',
  'cta',
  'question',
  'answer',
  'highlight',
]);
const IGNORED_KEYS = new Set([
  'id',
  'documentId',
  '__component',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'createdBy',
  'updatedBy',
  'localizations',
  'seo',
  'cover',
  'gallery',
  'heroImage',
  'image',
  'images',
  'media',
  'files',
]);

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

const toNumber = (value, fallback) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const MAX_TEXT_LENGTH = toNumber(process.env.OPENAI_SEO_CONTENT_LIMIT, 4000);
const MAX_TEXT_SNIPPETS = toNumber(process.env.OPENAI_SEO_SNIPPET_COUNT, 60);
const PROVIDER = process.env.OPENAI_SEO_PROVIDER || 'openai';
const ENDPOINT = process.env.OPENAI_SEO_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_SEO_MODEL || 'gpt-4o-mini';
const ENABLED_FLAG = String(process.env.OPENAI_SEO_ENABLED || 'true').toLowerCase() !== 'false';
const DEFAULT_TONE = (process.env.OPENAI_SEO_TONE || 'informational').toLowerCase();
const DEFAULT_AUDIENCE = process.env.OPENAI_SEO_AUDIENCE || 'deutsche Website-Besucher:innen';
const REQUEST_TIMEOUT = toNumber(process.env.OPENAI_SEO_TIMEOUT, 20000);
const DEFAULT_TEMPERATURE = clamp(toNumber(process.env.OPENAI_SEO_TEMPERATURE, 0.4), 0, 2);

const pendingDocuments = new Set();

const normalizeAbsoluteUrl = (value, siteUrl) => {
  const candidate = ensureAbsoluteUrl(value, siteUrl);
  if (candidate && ABSOLUTE_URL_PATTERN.test(candidate)) {
    return candidate;
  }
  return null;
};

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

const truncate = (value, max) => {
  if (!value) return value ?? null;
  const str = value.toString().trim();
  if (!str) return null;
  if (str.length <= max) return str;
  return `${str.slice(0, max - 3).trimEnd()}...`;
};

const uniqueStrings = (input = []) => {
  const seen = new Set();
  const result = [];
  for (const item of input) {
    if (!item) continue;
    const normalized = item.toString().trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
};

const toKeywordArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => entry?.toString?.().trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const safeJsonParse = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const stringifyForPrompt = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
};

const parseAiJson = (content) => {
  if (!content) return null;
  let payload = content.trim();
  const fence = payload.match(/```json([\s\S]+?)```/i);
  if (fence) {
    payload = fence[1];
  } else {
    const genericFence = payload.match(/```([\s\S]+?)```/);
    if (genericFence) {
      payload = genericFence[1];
    }
  }
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

const collectReadableText = (data) => {
  if (!data) return '';
  const visited = new WeakSet();
  const snippets = [];

  const pushSnippet = (text) => {
    if (!text || snippets.length >= MAX_TEXT_SNIPPETS) return;
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized || normalized.length < 3) return;
    if (normalized.length > 1200 && !/\s/.test(normalized.slice(0, 80))) return;
    snippets.push(normalized);
  };

  const walk = (value, keyHint) => {
    if (snippets.join('\n').length >= MAX_TEXT_LENGTH) return;
    if (value === null || value === undefined) return;

    if (typeof value === 'string') {
      if (TEXT_KEYS.has(keyHint) || keyHint === undefined || value.length <= 320) {
        pushSnippet(value);
      }
      return;
    }

    if (typeof value !== 'object') return;
    if (visited.has(value)) return;
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((entry) => walk(entry, keyHint));
      return;
    }

    for (const [key, nested] of Object.entries(value)) {
      if (IGNORED_KEYS.has(key)) continue;
      if (typeof nested === 'string' && TEXT_KEYS.has(key)) {
        pushSnippet(nested);
        continue;
      }
      walk(nested, key);
    }
  };

  walk(data);
  return snippets.join('\n').slice(0, MAX_TEXT_LENGTH);
};

const getPublicationDate = (entry = {}, type = 'page') => {
  if (type === 'event') return entry.startDate || entry.publishedAt || entry.updatedAt || entry.createdAt || null;
  if (type === 'article') {
    return entry.publicationDate || entry.publishedAt || entry.updatedAt || entry.createdAt || null;
  }
  return entry.publishedAt || entry.updatedAt || entry.createdAt || null;
};

const pickTone = (entryTone) => {
  const normalized = (entryTone || DEFAULT_TONE || 'informational').toLowerCase();
  return TONE_VALUES.has(normalized) ? normalized : 'informational';
};

const ensureEnum = (value, allowed, fallback) => {
  if (!value || typeof value !== 'string') return fallback;
  return allowed.has(value) ? value : fallback;
};

const normalizeSecondaryKeywords = (value) => uniqueStrings(toKeywordArray(value));

const mergeMetaSocial = (existing = [], updates = []) => {
  const map = new Map();
  existing.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const key = entry.socialNetwork || `existing-${map.size}`;
    map.set(key, { ...entry });
  });
  updates.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const key = entry.socialNetwork;
    if (!key) return;
    const previous = map.get(key) || {};
    map.set(key, {
      ...previous,
      ...entry,
      image: previous.image || null,
      imageAlt: previous.imageAlt || null,
    });
  });
  return Array.from(map.values());
};

const buildMetaSocialEntries = (input, context, fallbackTitle, fallbackDescription) => {
  if (!input) input = [];
  const entries = [];

  const pushEntry = (network, payload) => {
    if (!SOCIAL_TARGETS.includes(network)) return;
    const resolvedUrl = normalizeAbsoluteUrl(
      payload?.url || context.canonicalUrl || context.siteUrl,
      context.siteUrl,
    );
    entries.push({
      socialNetwork: network,
      title: truncate(payload?.title || fallbackTitle, 70),
      description: truncate(payload?.description || fallbackDescription, 200),
      url: resolvedUrl,
    });
  };

  if (Array.isArray(input)) {
    input.forEach((row) => {
      if (!row || typeof row !== 'object') return;
      const network = row.socialNetwork || row.network;
      pushEntry(network, row);
    });
  } else if (typeof input === 'object') {
    Object.entries(input).forEach(([network, row]) => pushEntry(network, row));
  }

  if (!entries.length) {
    SOCIAL_TARGETS.forEach((network) =>
      pushEntry(network, {
        socialNetwork: network,
      }),
    );
  }

  return entries;
};

const formatKeywords = (keywords) => {
  const list = uniqueStrings(toKeywordArray(keywords));
  if (!list.length) return null;
  return list.join(', ').slice(0, 255);
};

const extractConfidence = (value) => {
  if (!Number.isFinite(Number(value))) return 0.85;
  return clamp(Number(value), 0, 1);
};

const getStatusFromEvent = (event) => {
  return (
    event?.params?.data?.status ||
    event?.params?.status ||
    event?.result?.status ||
    (event?.result?.publishedAt ? 'published' : 'draft')
  );
};

const isPublishingEvent = (event) => {
  const isPublished = Boolean(event?.result?.publishedAt);
  if (!isPublished) return false;
  const wasPublished = Boolean(event?.state?.publishedAt);
  if (!wasPublished) return true;
  if (Object.prototype.hasOwnProperty.call(event?.params?.data || {}, 'publishedAt')) {
    return Boolean(event.params.data.publishedAt);
  }
  if (event?.params?.data?.status === 'published') return true;
  return false;
};

const buildPrompt = (context) => {
  const instructions = [
    `Erstelle komplette deutschsprachige SEO-Metadaten für einen ${context.label} (${context.type}).`,
    'Verwende einen klaren, suchmaschinenoptimierten Schreibstil.',
    'Orientiere dich am gegebenen Inhalt und erfinde nichts, was dort nicht erwähnt ist.',
    'Achte auf Längenlimits (70 Zeichen Title, 165 Zeichen Description).',
    'Nutze Keywords sinnvoll, ohne Keyword-Stuffing.',
    'Erzeuge JSON, das exakt der beschriebenen Struktur entspricht, ohne zusätzlichen Text.',
    'Erzeuge keine Bild- oder Media-Referenzen.',
  ];

  const schema = {
    metaTitle: 'string (<=70 Zeichen)',
    metaDescription: 'string (<=165 Zeichen)',
    metaKeywords: ['keyword1', 'keyword2'],
    focusKeyword: 'string',
    metaRobots: 'index,follow | index,nofollow | noindex,follow | noindex,nofollow',
    metaLanguage: 'BCP-47 Locale z.B. de-DE',
    metaViewport: 'string',
    sitemapPriority: '0 - 1',
    sitemapChangeFreq: 'always|hourly|daily|weekly|monthly|yearly|never',
    contentType: 'website|webpage|article|news|event|product|faq|custom',
    schemaType: 'WebPage|Article|NewsArticle|BlogPosting|Event|Product|FAQPage|HowTo|VideoObject|Custom',
    structuredData: { '@context': 'https://schema.org', '@type': '...' },
    shareImageAlt: 'string',
    ogTitle: 'string',
    ogDescription: 'string',
    ogType: 'website|article|event|profile|product|book',
    ogLocale: 'de_DE',
    twitterCard: 'summary|summary_large_image|player|app',
    twitterCreator: '@handle oder leer',
    metaSocial: [
      { socialNetwork: 'facebook|linkedin|twitter', title: 'string', description: 'string', url: 'absolute URL' },
    ],
    extraMeta: { 'name-oder-property': 'wert' },
    primaryKeyword: 'string',
    secondaryKeywords: ['keyword'],
    callToAction: 'string',
    toneOfVoice: 'informational|conversational|professional|playful|urgent|authoritative|friendly|luxury|technical',
    confidence: '0 - 1',
  };

  return `${instructions.join(
    ' ',
  )}\n\nJSON-Struktur:\n${stringifyForPrompt(schema)}\n\nSeitendaten:\n${stringifyForPrompt(context.payload)}`;
};

const callOpenAi = async ({ prompt, apiKey, temperature }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens: 600,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Du bist ein erfahrener deutschsprachiger SEO-Experte. Liefere ausschließlich JSON ohne Kommentartext.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${response.statusText} - ${body}`);
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content;
    return parseAiJson(message);
  } finally {
    clearTimeout(timeout);
  }
};

const createSeoPayload = ({ aiResult, context, existingSeo }) => {
  const defaults = SEO_TYPE_MAP[context.type] || SEO_TYPE_MAP.page;
  const ai = aiResult?.seo || aiResult || {};
  const aiInsights = aiResult?.ai || {};
  const metaTitle = truncate(ai.metaTitle || context.title || existingSeo?.metaTitle || '', 70);
  const metaDescription = truncate(
    ai.metaDescription || context.summary || existingSeo?.metaDescription || '',
    165,
  );
  const focusKeyword = ai.focusKeyword || ai.primaryKeyword || existingSeo?.focusKeyword || context.title;
  const metaKeywords = formatKeywords(ai.metaKeywords || ai.secondaryKeywords || ai.primaryKeyword);
  const secondaryKeywords = normalizeSecondaryKeywords(ai.secondaryKeywords || aiInsights.secondaryKeywords);
  const metaRobots = ensureEnum(ai.metaRobots, ROBOTS_VALUES, existingSeo?.metaRobots || 'index,follow');
  const metaLanguage = ai.metaLanguage || existingSeo?.metaLanguage || 'de-DE';
  const metaViewport = ai.metaViewport || existingSeo?.metaViewport || 'width=device-width, initial-scale=1';
  const sitemapPriorityRaw = ai.sitemapPriority ?? ai.sitemap?.priority;
  const sitemapPriority = Number.isFinite(Number(sitemapPriorityRaw))
    ? clamp(Number(sitemapPriorityRaw), 0, 1)
    : existingSeo?.sitemapPriority ?? null;
    const sitemapChangeFreq = ensureEnum(
      ai.sitemapChangeFreq || ai.sitemap?.changeFrequency,
      SITEMAP_FREQ_VALUES,
      existingSeo?.sitemapChangeFreq || null,
    );
    const contentType = ensureEnum(ai.contentType, CONTENT_TYPES, existingSeo?.contentType || defaults.content);
    const schemaType = ensureEnum(ai.schemaType, SCHEMA_TYPES, existingSeo?.schemaType || defaults.schema);
    const canonicalCandidate = ai.canonicalUrl || existingSeo?.canonicalUrl || context.canonicalUrl;
    const canonicalUrl =
      normalizeAbsoluteUrl(canonicalCandidate, context.siteUrl) ||
      normalizeAbsoluteUrl(context.canonicalUrl, context.siteUrl) ||
      null;
    const ogTitle = truncate(ai.ogTitle || metaTitle, 70);
    const ogDescription = truncate(ai.ogDescription || metaDescription, 200);
    const ogType = ensureEnum(
      ai.ogType,
      OG_TYPES,
      context.type === 'event' ? 'event' : context.type === 'article' ? 'article' : 'website',
    );
    const ogLocale = ai.ogLocale || metaLanguage.replace('-', '_') || 'de_DE';
    const ogUrlCandidate = ai.ogUrl || canonicalUrl || existingSeo?.ogUrl;
    const ogUrl = normalizeAbsoluteUrl(ogUrlCandidate, context.siteUrl) || canonicalUrl || null;
    const twitterCard = ensureEnum(ai.twitterCard, TWITTER_CARDS, existingSeo?.twitterCard || 'summary_large_image');
    const twitterCreator = truncate(ai.twitterCreator || aiInsights.twitterCreator || '', 80);
    const structuredData = safeJsonParse(ai.structuredData) || safeJsonParse(existingSeo?.structuredData) || null;
    const extraMeta = safeJsonParse(ai.extraMeta) || safeJsonParse(existingSeo?.extraMeta) || null;
    const socialContext = {
      ...context,
      canonicalUrl: canonicalUrl || context.canonicalUrl || null,
    };

    const metaSocialEntries = buildMetaSocialEntries(
      ai.metaSocial,
      socialContext,
      ogTitle || metaTitle,
      ogDescription || metaDescription,
    );
  const mergedMetaSocial = mergeMetaSocial(existingSeo?.metaSocial, metaSocialEntries);

  const aiAssistant = {
    ...(existingSeo?.aiAssistant || {}),
    prompt: context.prompt,
    targetAudience: context.audience,
    toneOfVoice: ensureEnum(ai.toneOfVoice || aiInsights.toneOfVoice, TONE_VALUES, pickTone(context.tone)),
    primaryKeyword: focusKeyword,
    secondaryKeywords,
    callToAction: ai.callToAction || aiInsights.callToAction || null,
    generatedTitle: metaTitle,
    generatedDescription: metaDescription,
    generatedKeywords: secondaryKeywords.length ? secondaryKeywords : toKeywordArray(metaKeywords),
    provider: PROVIDER,
    model: MODEL,
    confidenceScore: extractConfidence(ai.confidence || aiInsights.confidenceScore),
    lastGeneratedAt: new Date().toISOString(),
  };

  return {
    ...existingSeo,
    metaTitle,
    metaDescription,
    metaKeywords,
    focusKeyword,
    canonicalUrl,
    metaRobots,
    metaViewport,
    metaLanguage,
    sitemapPriority,
    sitemapChangeFreq,
    contentType,
    schemaType,
    structuredData,
    shareImageAlt: truncate(ai.shareImageAlt || existingSeo?.shareImageAlt, 120),
    ogTitle,
    ogDescription,
    ogType,
    ogLocale,
    ogUrl,
    ogPublishedTime: context.publicationDate || existingSeo?.ogPublishedTime || null,
    ogModifiedTime: context.updatedAt || new Date().toISOString(),
    twitterCard,
    twitterCreator,
    metaSocial: mergedMetaSocial,
    aiAssistant,
    extraMeta,
  };
};

const buildContextPayload = ({ entry, type, label, siteUrl }) => {
  const basePath = BASE_PATHS[type] || '/';
  const slug = entry.slug || entry.id || '';
  const canonicalPath = normalizePath(basePath, slug, type);
  const canonicalUrl = siteUrl ? `${siteUrl}${canonicalPath}` : null;
  const publicationDate = getPublicationDate(entry, type);
  const updatedAt = entry.updatedAt || entry.publishedAt || new Date().toISOString();
  const summary = entry.summary || entry.subtitle || entry.description || entry.excerpt || '';
  const content = collectReadableText(entry);
  const payload = {
    type,
    label,
    title: entry.title || '',
    subtitle: entry.subtitle || '',
    summary,
    slug,
    canonicalUrl,
    publicationDate,
    updatedAt,
    audience: entry.audience || DEFAULT_AUDIENCE,
    tone: pickTone(entry?.seo?.aiAssistant?.toneOfVoice || entry.toneOfVoice || DEFAULT_TONE),
    content,
  };

  return {
    payload,
    canonicalUrl,
    publicationDate,
    updatedAt,
    audience: payload.audience,
    tone: payload.tone,
    title: entry.title,
    summary,
    type,
    label,
    siteUrl,
  };
};

const getDocumentKey = (modelUid, documentId, status) => `${modelUid}:${documentId}:${status}`;

const createAiSeoService = ({ strapi }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const enabled = ENABLED_FLAG && Boolean(apiKey);
  const siteUrl = getSiteUrl(strapi);

  const handleLifecycle = async (event) => {
    if (!enabled) return;
    if (!isPublishingEvent(event)) return;

    const modelUid = event?.model?.uid || event?.model || event?.info?.uid;
    if (!MODEL_CONFIG[modelUid]) return;

    const status = getStatusFromEvent(event);
    const documentId = event?.result?.documentId || event?.result?.id || event?.params?.where?.documentId;
    if (!documentId) return;

    const key = getDocumentKey(modelUid, documentId, status);
    if (pendingDocuments.has(key)) return;
    pendingDocuments.add(key);

    try {
      const entry = await strapi.documents(modelUid).findOne({
        documentId,
        status,
      });
      if (!entry) return;

      const context = buildContextPayload({
        entry,
        type: MODEL_CONFIG[modelUid].type,
        label: MODEL_CONFIG[modelUid].label,
        siteUrl,
      });
      const prompt = buildPrompt(context);
      context.prompt = prompt;

      const aiResult = await callOpenAi({
        prompt,
        apiKey,
        temperature: DEFAULT_TEMPERATURE,
      });
      if (!aiResult) {
        strapi.log.warn(`AI SEO: No result returned for ${modelUid} ${documentId}`);
        return;
      }

      const updatedSeo = createSeoPayload({
        aiResult,
        context,
        existingSeo: entry.seo || {},
      });

      await strapi.documents(modelUid).update({
        documentId,
        status,
        data: {
          seo: updatedSeo,
        },
      });

      strapi.log.info(
        `AI SEO: Updated SEO for ${modelUid}#${documentId} (${status}) via ${PROVIDER}/${MODEL}`,
      );
    } catch (error) {
      strapi.log.error(`AI SEO generation failed: ${error.message}`);
    } finally {
      pendingDocuments.delete(key);
    }
  };

  return {
    isEnabled: () => enabled,
    handleLifecycle,
    targetModels: Object.keys(MODEL_CONFIG),
  };
};

module.exports = {
  createAiSeoService,
};
