'use strict';

const { runSeoBackfill, getCronRule } = require('../src/utils/seo-cron');

module.exports = {
  'ai-seo-backfill': {
    task: async ({ strapi }) => {
      try {
        await runSeoBackfill(strapi);
      } catch (error) {
        strapi.log.error(`[cron] ai-seo-backfill failed: ${error.message}`);
      }
    },
    options: {
      rule: getCronRule(),
      tz: process.env.SEO_CRON_TZ || 'Europe/Berlin',
    },
  },
};
