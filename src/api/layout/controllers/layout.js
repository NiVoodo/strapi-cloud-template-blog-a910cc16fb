'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::layout.layout', ({ strapi }) => ({
  /**
   * Oeffentlicher Endpunkt, der das globale Layout mit allen Sidebars/Topbar liefert.
   * GET /api/layout/public
   */
  async public(ctx) {
    try {
      const entry = await strapi.entityService.findMany('api::layout.layout', {
        populate: {
          topbar: { populate: '*' },
          leftSidebar: { populate: '*' },
          rightSidebar: { populate: '*' },
        },
      });

      if (!entry) {
        ctx.body = { data: null };
        return;
      }

      ctx.body = {
        data: {
          id: entry.id,
          attributes: {
            topbar: entry.topbar ?? [],
            leftSidebar: entry.leftSidebar ?? [],
            rightSidebar: entry.rightSidebar ?? [],
          },
        },
      };
    } catch (err) {
      strapi.log.error('layout.public failed', err);
      ctx.status = 500;
      ctx.body = { error: 'layout_public_failed' };
    }
  },
}));
