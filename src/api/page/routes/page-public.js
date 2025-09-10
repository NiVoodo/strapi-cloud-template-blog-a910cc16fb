'use strict';

/**
 * Publice, schmale Routen:
 *  - /api/pages/public           → Liste { slug, updatedAt }
 *  - /api/pages/by-slug/:slug    → deine bestehende Detailroute (falls du sie hier bündeln willst)
 */
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/pages/public',
      handler: 'page.publicList',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Falls deine by-slug-Route bereits in einer anderen Datei liegt, kannst du diesen Block weglassen:
    // {
    //   method: 'GET',
    //   path: '/pages/by-slug/:slug',
    //   handler: 'page.bySlug',
    //   config: { auth: false, policies: [], middlewares: [] },
    // },
  ],
};
