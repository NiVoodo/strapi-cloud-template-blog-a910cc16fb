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
  ],
};
