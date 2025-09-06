'use strict';

/**
 * about header.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::header.header');
