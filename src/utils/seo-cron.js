'use strict';

const { generateSeoForEntity } = require('./ai-seo');

const DEFAULT_RULE = '*/5 * * * *';
const DEFAULT_BATCH = 3;
const CONTENT_TYPES = [
  {
    uid: 'api::page.page',
    type: 'page',
    populate: {
      blocks: { on: {} },
    },
    fallbackImage: () => null,
  },
  {
    uid: 'api::article.article',
    type: 'news',
    populate: {
      blocks: { on: {} },
      blogimage: {},
      gallery: {},
    },
    fallbackImage: (entry) => entry.blogimage || null,
  },
  {
    uid: 'api::event.event',
    type: 'event',
    populate: {
      blocks: { on: {} },
      heroImage: {},
      gallery: {},
    },
    fallbackImage: (entry) => entry.heroImage || null,
  },
];

const missingSeoFilter = {
  $or: [
    { seo: { $null: true } },
    { seo: { metaTitle: { $null: true } } },
    { seo: { metaDescription: { $null: true } } },
  ],
};

const toArray = (result) => {
  if (!result) return [];
  if (Array.isArray(result.results)) return result.results;
  return Array.isArray(result) ? result : [];
};

async function fetchEntriesNeedingSeo(strapi, { uid, limit, populate }) {
  const response = await strapi.documents(uid).findMany({
    filters: missingSeoFilter,
    page: 1,
    pageSize: limit,
    populate,
  });
  return toArray(response);
}

async function processEntry(strapi, entry, config) {
  if (!entry?.documentId) {
    strapi.log.warn(`[seo-cron] Skipping ${config.uid} entry without documentId`);
    return;
  }

  const fallbackImage =
    typeof config.fallbackImage === 'function' ? config.fallbackImage(entry) : null;

  const { seoComponent } = await generateSeoForEntity({
    entity: entry,
    type: config.type,
    strapi,
    fallbackImage,
  });

  await strapi.documents(config.uid).update({
    documentId: entry.documentId,
    data: { seo: seoComponent },
    status: 'published',
  });

  strapi.log.info(
    `[seo-cron] Updated SEO for ${config.uid} documentId=${entry.documentId} (slug=${entry.slug || 'n/a'})`
  );
}

async function runSeoBackfill(strapi) {
  if ((process.env.SEO_CRON_ENABLED || 'true').toLowerCase() === 'false') {
    return;
  }

  const batchSize = Math.max(Number(process.env.SEO_CRON_BATCH) || DEFAULT_BATCH, 1);

  for (const config of CONTENT_TYPES) {
    try {
      const entries = await fetchEntriesNeedingSeo(strapi, {
        uid: config.uid,
        limit: batchSize,
        populate: config.populate,
      });

      if (!entries.length) continue;

      for (const entry of entries) {
        try {
          await processEntry(strapi, entry, config);
        } catch (error) {
          strapi.log.error(
            `[seo-cron] Failed for ${config.uid} documentId=${entry.documentId || 'unknown'}: ${
              error.message
            }`
          );
        }
      }
    } catch (error) {
      strapi.log.error(`[seo-cron] Query failed for ${config.uid}: ${error.message}`);
    }
  }
}

const getCronRule = () => process.env.SEO_CRON_RULE || DEFAULT_RULE;

module.exports = {
  runSeoBackfill,
  getCronRule,
};
