'use strict';

/**
 * GET /api/footer/public   (ohne Auth)
 * Holt den SingleType "footer" inklusive navigation & ctaButton,
 * aber ohne komplizierte fields-Parameter.
 */
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/footer/public',
      handler: 'footer.public',
      config: { auth: false },
    },
  ],
};
