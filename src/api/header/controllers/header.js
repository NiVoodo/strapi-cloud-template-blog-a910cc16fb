'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::header.header', ({ strapi }) => ({
  /**
   * Öffentlicher, vereinfachter Reader – liefert logo (Media), logoWidth,
   * navigation & ctaButton. Ohne komplizierte Querystrings.
   * GET /api/header/public
   */
  async public(ctx) {
    try {
      const MAX_NAV_DEPTH = 3;

      const mapNavItems = (items, depth = 1) => {
        if (!Array.isArray(items) || depth > MAX_NAV_DEPTH) {
          return [];
        }

        return items
          .filter(Boolean)
          .map((item) => {
            const nextDepth = depth + 1;
            const children = item.children ? mapNavItems(item.children, nextDepth) : [];

            return {
              id: item.id ?? null,
              label: item.label ?? '',
              href: item.href ?? null,
              isExternal: typeof item.isExternal === 'boolean' ? item.isExternal : false,
              children,
            };
          });
      };

      // SingleType laden inkl. Relationen/Media
      const entry = await strapi.entityService.findMany('api::header.header', {
        populate: {
          navigation: {
            populate: {
              children: {
                populate: {
                  children: true,
                },
              },
            },
          },
          ctaButton: true,
          logo: true, // <-- Bild mitliefern
        },
        // publicationState: 'live', // optional bei Draft&Publish
      });

      // Defensive: falls leer
      if (!entry) {
        ctx.body = { data: null };
        return;
      }

      // Media-Objekt in ein schlankes Shape mappen (nur Relevantes)
      const logo = entry.logo
        ? {
            id: entry.logo.id,
            name: entry.logo.name,
            url: entry.logo.url,
            alternativeText: entry.logo.alternativeText ?? null,
            width: entry.logo.width ?? null,
            height: entry.logo.height ?? null,
            formats: entry.logo.formats ?? null
          }
        : null;

      const data = {
        id: entry.id,
        attributes: {
          logo,                           // <- Bilddaten
          logoWidth: entry.logoWidth ?? null, // <- Wunschbreite in px
          navigation: mapNavItems(entry.navigation),
          ctaButton: entry.ctaButton ?? null
        }
      };

      ctx.body = { data };
    } catch (err) {
      strapi.log.error('header.public failed', err);
      ctx.status = 500;
      ctx.body = { error: 'header_public_failed' };
    }
  },
}));
