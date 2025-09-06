'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/pages/by-slug/:slug',
      handler: 'page.bySlug',
      config: {
        auth: false,            // <— erlaubt öffentlichen Zugriff
        policies: [],
        middlewares: [],
      },
    },
  ],
};