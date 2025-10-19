'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/events/upcoming',
      handler: 'event.upcoming',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
