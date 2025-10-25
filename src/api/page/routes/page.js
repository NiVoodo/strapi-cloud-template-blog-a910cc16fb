'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/pages/by-slug/:slug',
      handler: 'page.bySlug',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/pages/:id/generate-seo',
      handler: 'page.generateSeo',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
