'use strict';

/**
 * GET /api/layout/public   (ohne Auth)
 * Liefert das globale Layout inkl. Topbar & Sidebars.
 */
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/layout/public',
      handler: 'layout.public',
      config: { auth: false },
    },
  ],
};
