'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

/**
 * Single-Type "layout"
 * Standard GET /api/layout ist öffentlich.
 */
module.exports = createCoreRouter('api::layout.layout', {
  config: {
    find: {
      auth: false,
    },
  },
});
