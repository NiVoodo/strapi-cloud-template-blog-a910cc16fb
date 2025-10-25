'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles/by-slug/:slug',
      handler: 'article.bySlug',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/generate-seo',
      handler: 'article.generateSeo',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
