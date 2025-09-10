'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

/**
 * Core-Routen aktiv + find public
 */
module.exports = createCoreRouter('api::footer.footer', {
  config: {
    find: { auth: false },
    // findOne kannst du bei SingleType ignorieren
  },
});
