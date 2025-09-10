'use strict';

/**
 * GET /api/header/public   (ohne Auth)
 * Holt den SingleType "header" inklusive navigation & ctaButton,
 * aber ohne komplizierte fields-Parameter.
 */
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/header/public',
      handler: 'header.public',
      config: { auth: false },
    },
  ],
};
