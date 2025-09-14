'use strict';

/**
 * Publice, schmale Routen:
 *  - /api/articles/public           → Liste { slug, updatedAt }
 *  - /api/articles/by-slug/:slug    → deine bestehende Detailroute (falls du sie hier bündeln willst)
 */
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/public',
      handler: 'article.publicList',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
