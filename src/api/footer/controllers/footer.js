'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::footer.footer', ({ strapi }) => ({

  /**
   * GET /api/footer/public?status=published|draft
   * Liefert den Footer SingleType inkl. aller Komponenten + qrCode-Media.
   */
  async public(ctx) {
    try {
      const status = ctx.query.status === 'draft' ? 'draft' : 'published';

      // v5: SingleType per documents().findFirst + Populate-Objekt
      const entry = await strapi.documents('api::footer.footer').findFirst({
        status,
        populate: {
          // Komponenten (einfaches 1-Level Populate)
          address: {},
          openingHours: {},   // deine shared.rich-text Komponente mit "body"
          contacts: {},
          buttons: {},
          legalLinks: {},
          socialLinks: {},

          // Media explizit populaten (1-Level reicht hier)
          qrCode: {},
        },
      });

      if (!entry) {
        ctx.body = { data: null };
        return;
      }

      // Optional: Media etwas verschlanken
      const qr = entry.qrCode
        ? {
            id: entry.qrCode.id,
            name: entry.qrCode.name,
            url: entry.qrCode.url,
            alternativeText: entry.qrCode.alternativeText ?? null,
            width: entry.qrCode.width ?? null,
            height: entry.qrCode.height ?? null,
            formats: entry.qrCode.formats ?? null,
          }
        : null;

      // Alles andere 1:1 durchreichen (Komponenten sind bereits eingebettet)
      const attributes = {
        address: entry.address ?? null,
        openingHours: entry.openingHours ?? null, // { body: "<p>…</p>" } oder null
        contacts: Array.isArray(entry.contacts) ? entry.contacts : [],
        ctaTitle: entry.ctaTitle ?? null,
        ctaSubtitle: entry.ctaSubtitle ?? null,
        buttons: Array.isArray(entry.buttons) ? entry.buttons : [],
        qrCode: qr,
        qrLink: entry.qrLink ?? null,
        legalTitle: entry.legalTitle ?? "Legal Terms",
        legalLinks: Array.isArray(entry.legalLinks) ? entry.legalLinks : [],
        socialLinks: Array.isArray(entry.socialLinks) ? entry.socialLinks : [],
        note: entry.note ?? null,
      };

      ctx.body = { data: { id: entry.id, attributes } };
    } catch (err) {
      strapi.log.error('footer.public failed', err);
      ctx.status = 500;
      ctx.body = { error: 'footer_public_failed' };
    }
  },

}));
