'use strict';

const fetch = globalThis.fetch;

const DEFAULT_MODEL = process.env.OPENAI_SEO_MODEL || 'gpt-4o-mini';
const OPENAI_BASE_URL = process.env.OPENAI_SEO_BASE_URL || 'https://api.openai.com/v1';
const DEFAULT_TEMPERATURE = process.env.OPENAI_SEO_TEMPERATURE
  ? Number(process.env.OPENAI_SEO_TEMPERATURE)
  : 0.25;
const TARGET_AUDIENCE = process.env.OPENAI_SEO_AUDIENCE || 'B2B Entscheider:innen in der DACH-Region';
const TONE_OF_VOICE = process.env.OPENAI_SEO_TONE || 'professional';
const MAX_SOURCE_CHARS = 6000;

const TYPE_META = {
  page: {
    label: 'Landingpage',
    contentType: 'webpage',
    schemaType: 'WebPage',
    sitemapPriority: 0.8,
    sitemapChangeFreq: 'weekly',
  },
  article: {
    label: 'Artikel',
    contentType: 'article',
    schemaType: 'Article',
    sitemapPriority: 0.6,
    sitemapChangeFreq: 'daily',
  },
  news: {
    label: 'News-Beitrag',
    contentType: 'news',
    schemaType: 'NewsArticle',
    sitemapPriority: 0.7,
    sitemapChangeFreq: 'daily',
  },
  event: {
    label: 'Event',
    contentType: 'event',
    schemaType: 'Event',
    sitemapPriority: 0.7,
    sitemapChangeFreq: 'weekly',
  },
};

const RESPONSE_SCHEMA = {
  name: 'seo_payload',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['metaTitle', 'metaDescription', 'keywords', 'callToAction'],
    properties: {
      metaTitle: { type: 'string' },
      metaDescription: { type: 'string' },
      ogTitle: { type: 'string' },
      ogDescription: { type: 'string' },
      keywords: {
        type: 'array',
        minItems: 3,
        maxItems: 8,
        items: { type: 'string' },
      },
      callToAction: { type: 'string' },
      structuredData: { type: 'object' },
      confidence: { type: 'number' },
      toneOfVoice: { type: 'string' },
      targetAudience: { type: 'string' },
    },
  },
};

const clampText = (text = '', limit = MAX_SOURCE_CHARS) => {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

const collectStringValues = (value, bucket = []) => {
  if (!value) return bucket;
  if (typeof value === 'string') {
    const cleaned = value.trim();
    if (cleaned) bucket.push(cleaned);
    return bucket;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStringValues(item, bucket));
    return bucket;
  }
  if (typeof value === 'object') {
    Object.values(value).forEach((entry) => collectStringValues(entry, bucket));
  }
  return bucket;
};

const buildSourceText = (entity = {}) => {
  const snippets = [];
  ['title', 'subtitle', 'summary', 'description', 'content', 'body', 'intro'].forEach((field) => {
    if (entity[field]) snippets.push(`${field.toUpperCase()}: ${entity[field]}`);
  });

  if (Array.isArray(entity.blocks)) {
    entity.blocks.forEach((block) => {
      const blockText = collectStringValues(block).join(' • ');
      if (blockText) {
        snippets.push(block.__component ? `${block.__component}: ${blockText}` : blockText);
      }
    });
  }

  return clampText(snippets.join('\n').replace(/\s+/g, ' '));
};

const buildPrompt = ({ entity, typeMeta, siteName }) => {
  const source = buildSourceText(entity);
  return [
    `Erstelle vollständig optimierte OnPage-SEO-Metadaten für eine ${typeMeta.label}.`,
    'Sprache: Deutsch (duzen vermeiden, neutral-professionell).',
    'Anforderungen:',
    '- Meta Title 50-60 Zeichen, fokussiert auf Hauptkeyword.',
    '- Meta Description 140-160 Zeichen, mit Nutzenversprechen + CTA.',
    '- OG Title/Description dürfen leicht variieren, aber konsistent bleiben.',
    '- Liefere 3-8 fokussierte Keywords (snake_case vermeiden).',
    '- CTA kurz (max. 12 Wörter) und handlungsorientiert.',
    '- StructuredData falls sinnvoll als valides Schema.org JSON-LD.',
    '',
    siteName ? `Markenname/Site: ${siteName}.` : '',
    `Slug/Referenz: ${entity.slug || entity.id || entity.documentId || 'unbekannt'}.`,
    'Quelleninhalt (gekürzt):',
    source || 'Keine zusätzlichen Inhalte vorhanden.',
  ]
    .filter(Boolean)
    .join('\n');
};

const callOpenAi = async ({ prompt, model, temperature, apiKey }) => {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY ist nicht gesetzt.');
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      response_format: {
        type: 'json_schema',
        json_schema: RESPONSE_SCHEMA,
      },
      messages: [
        {
          role: 'system',
          content:
            'Du bist ein preisgekrönter deutscher SEO-Experte. Du lieferst konzise, moderne Metadaten ohne Floskeln. Immer validen JSON zurückgeben.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const errMessage = payload?.error?.message || response.statusText;
    throw new Error(`OpenAI Fehler (${response.status}): ${errMessage}`);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI lieferte keine Antwort.');

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`OpenAI JSON konnte nicht geparsed werden: ${error.message}`);
  }
};

const toKeywordList = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((kw) => kw.trim()).filter(Boolean);
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((kw) => kw.trim())
      .filter(Boolean);
  }
  return [];
};

const ensureStructuredData = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
};

const generateSeoForEntity = async ({ entity, type = 'page', strapi }) => {
  const typeMeta = TYPE_META[type] || TYPE_META.page;
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_SEO_MODEL || DEFAULT_MODEL;
  const temperature = Number.isFinite(DEFAULT_TEMPERATURE) ? DEFAULT_TEMPERATURE : 0.25;
  const siteName = await getSiteName(strapi);

  const prompt = buildPrompt({ entity, typeMeta, siteName });
  const aiResult = await callOpenAi({ prompt, model, temperature, apiKey });

  const keywords = toKeywordList(aiResult.keywords).slice(0, 8);
  const secondaryKeywords = keywords.slice(1);

  const seoComponent = {
    metaTitle: aiResult.metaTitle?.trim(),
    metaDescription: aiResult.metaDescription?.trim(),
    ogTitle: (aiResult.ogTitle || aiResult.metaTitle || '').trim(),
    ogDescription: (aiResult.ogDescription || aiResult.metaDescription || '').trim(),
    metaKeywords: keywords.join(', '),
    focusKeyword: keywords[0] || null,
    metaRobots: 'index,follow',
    metaViewport: 'width=device-width, initial-scale=1',
    metaLanguage: 'de-DE',
    contentType: typeMeta.contentType,
    schemaType: typeMeta.schemaType,
    sitemapPriority: typeMeta.sitemapPriority,
    sitemapChangeFreq: typeMeta.sitemapChangeFreq,
    structuredData: ensureStructuredData(aiResult.structuredData),
    twitterCard: 'summary_large_image',
    twitterCreator: null,
    shareImage: null,
    shareImageAlt: null,
    ogType: typeMeta.contentType === 'event' ? 'event' : typeMeta.contentType === 'news' ? 'article' : 'website',
    ogLocale: 'de_DE',
    ogUrl: null,
    ogPublishedTime: entity.publicationDate || entity.startDate || entity.createdAt || null,
    ogModifiedTime: entity.updatedAt || entity.publishedAt || null,
    metaSocial: [],
    extraMeta: null,
    aiAssistant: {
      prompt,
      targetAudience: aiResult.targetAudience || TARGET_AUDIENCE,
      toneOfVoice: aiResult.toneOfVoice || TONE_OF_VOICE,
      primaryKeyword: keywords[0] || null,
      secondaryKeywords,
      callToAction: aiResult.callToAction || null,
      generatedTitle: aiResult.metaTitle || null,
      generatedDescription: aiResult.metaDescription || null,
      generatedKeywords: keywords,
      provider: 'openai',
      model,
      confidenceScore: Number.isFinite(aiResult.confidence) ? aiResult.confidence : 0.82,
      lastGeneratedAt: new Date().toISOString(),
    },
  };

  return {
    seoComponent,
    aiResult,
    prompt,
    model,
  };
};

const globalSettingsCache = {
  timestamp: 0,
  value: null,
};

const getSiteName = async (strapi) => {
  const ttl = 1000 * 60 * 5;
  const now = Date.now();
  if (globalSettingsCache.value && now - globalSettingsCache.timestamp < ttl) {
    return globalSettingsCache.value;
  }

  try {
    const globalSettings = await strapi.documents('api::global.global').findFirst({
      fields: ['siteName'],
    });
    const siteName = globalSettings?.siteName || null;
    globalSettingsCache.value = siteName;
    globalSettingsCache.timestamp = now;
    return siteName;
  } catch (error) {
    strapi.log?.warn?.('Konnte SiteName nicht laden: ' + error.message);
    return null;
  }
};

module.exports = {
  generateSeoForEntity,
};
