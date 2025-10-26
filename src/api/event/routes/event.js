'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/events/by-slug/:slug',
      handler: 'event.bySlug',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
