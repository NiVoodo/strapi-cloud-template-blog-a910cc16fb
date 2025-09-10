'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

/**
 * Single-Type "header"
 * Macht GET /api/header öffentlich (ohne Auth).
 * Weitere Actions (update etc.) bleiben standardmäßig geschützt.
 */
module.exports = createCoreRouter('api::header.header', {
  config: {
    find: {
      auth: false,
      // optional:
      // policies: [],
      // middlewares: [],
    },
  },
});
