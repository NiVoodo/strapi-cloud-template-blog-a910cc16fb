'use strict';

/**
 * Erweiterter Event-Controller mit Deep-Populate-Hilfen.
 * Endpunkte:
 *   GET /api/events/by-slug/:slug?status=published|draft&depth=4
 *   GET /api/events/upcoming?status=published|draft&from=2024-01-01&page=1&pageSize=50&featured=true
 */

const { factories } = require('@strapi/strapi');
const { buildSeoPayload } = require('../../../utils/seo');

/** Utils */
const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
/** Holt die Attribute unabhängig davon, ob das Modell sie unter `.attributes` oder `.schema.attributes` hält */
const getAttrs = (model) => (model?.attributes || model?.schema?.attributes || {});

/** Liefert ein "1-Level-Populate" Objekt (v5: kein `true` verwenden) */
const ONE_LEVEL = Object.freeze({});

/** Komponenten-Populate rekursiv erstellen */
function buildPopulateForComponent(strapi, compUid, options = {}) {
  const { maxDepth = 4, seen = new Set() } = options;

  if (!compUid || seen.has(compUid) || maxDepth <= 0) return ONE_LEVEL;
  seen.add(compUid);

  const comp = strapi.components?.[compUid];
  const attrs = getAttrs(comp);
  if (!comp || !isObject(attrs)) return ONE_LEVEL;

  const populate = {};

  for (const [name, attr] of Object.entries(attrs)) {
    if (!isObject(attr)) continue;

    switch (attr.type) {
      case 'media':
      case 'relation': {
        populate[name] = ONE_LEVEL;
        break;
      }

      case 'component': {
        const child = buildPopulateForComponent(strapi, attr.component, {
          maxDepth: maxDepth - 1,
          seen,
        });
        populate[name] = { populate: child };
        break;
      }

      case 'dynamiczone': {
        const comps = Array.isArray(attr.components) ? attr.components : [];
        const on = {};
        for (const cUid of comps) {
          const child = buildPopulateForComponent(strapi, cUid, {
            maxDepth: maxDepth - 1,
            seen,
          });
          on[cUid] = Object.keys(child).length ? { populate: child } : {};
        }
        if (Object.keys(on).length) {
          populate[name] = { on };
        }
        break;
      }

      default:
        break;
    }
  }

  return Object.keys(populate).length ? populate : ONE_LEVEL;
}

/** Content-Type-Populate erstellen (inkl. Dynamic-Zones) */
function buildPopulateForContentType(strapi, ctUid, options = {}) {
  const { maxDepth = 4 } = options;
  const ct = strapi.contentTypes?.[ctUid];
  const attrs = getAttrs(ct);
  if (!ct || !isObject(attrs)) return {};

  const populate = {};

  for (const [name, attr] of Object.entries(attrs)) {
    if (!isObject(attr)) continue;

    switch (attr.type) {
      case 'media':
      case 'relation':
        populate[name] = ONE_LEVEL;
        break;

      case 'component': {
        const child = buildPopulateForComponent(strapi, attr.component, {
          maxDepth: maxDepth - 1,
          seen: new Set(),
        });
        populate[name] = { populate: child };
        break;
      }

      case 'dynamiczone': {
        const comps = Array.isArray(attr.components) ? attr.components : [];
        const on = {};
        for (const cUid of comps) {
          const child = buildPopulateForComponent(strapi, cUid, {
            maxDepth: maxDepth - 1,
            seen: new Set(),
          });
          on[cUid] = Object.keys(child).length ? { populate: child } : {};
        }
        if (Object.keys(on).length) {
          populate[name] = { on };
        }
        break;
      }

      default:
        break;
    }
  }

  return populate;
}

function parseDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date?.getTime()) ? date.toISOString() : null;
}

module.exports = factories.createCoreController('api::event.event', ({ strapi }) => ({
  async bySlug(ctx) {
    const { slug } = ctx.params;
    if (!slug) return ctx.badRequest('Missing slug');

    const status = ctx.query.status === 'draft' ? 'draft' : 'published';

    const depthParam = Number(ctx.query.depth);
    const maxDepth = Number.isFinite(depthParam) && depthParam > 0 ? Math.min(depthParam, 8) : 4;

    const populate = buildPopulateForContentType(strapi, 'api::event.event', { maxDepth });

    if (process.env.NODE_ENV !== 'production') {
      try {
        strapi.log.debug(`[event.bySlug] populate => ${JSON.stringify(populate)}`);
      } catch {
        /* no-op */
      }
    }

    const event = await strapi.documents('api::event.event').findFirst({
      status,
      filters: { slug: { $eq: slug } },
      populate,
    });

    if (!event) return ctx.notFound('event not found');

    event.seoMeta = await buildSeoPayload({
      entity: event,
      type: 'event',
      strapi,
      fallbackImage: event.heroImage || null,
    });
    ctx.body = event;
  },

  async upcoming(ctx) {
    try {
      const status = ctx.query.status === 'draft' ? 'draft' : 'published';
      const page = Number(ctx.query.page) || 1;
      const pageSize = Number(ctx.query.pageSize) || 100;

      const fromOverride = parseDateOrNull(ctx.query.from);
      const nowIso = new Date().toISOString();
      const dateLowerBound = ctx.query.includePast === 'true' ? null : (fromOverride || nowIso);

      const filters = {
        slug: { $notNull: true },
      };
      if (dateLowerBound) {
        filters.startDate = { $gte: dateLowerBound };
      }

      if (ctx.query.featured === 'true') {
        filters.isFeatured = { $eq: true };
      }

      const sort = ctx.query.sort === 'desc'
        ? [{ startDate: 'desc' }]
        : [{ startDate: 'asc' }];

      const result = await strapi.documents('api::event.event').findMany({
        status,
        fields: [
          'slug',
          'title',
          'subtitle',
          'summary',
          'startDate',
          'endDate',
          'timezone',
          'locationType',
          'venueName',
          'onlineEventUrl',
          'registrationLink',
          'registrationDeadline',
          'organizer',
          'audience',
          'eventStatus',
          'capacity',
          'priceDetails',
          'isFeatured',
          'updatedAt',
        ],
        populate: {
          heroImage: ONE_LEVEL,
          gallery: ONE_LEVEL,
          address: { populate: ONE_LEVEL },
          cta: { populate: ONE_LEVEL },
          speakers: { populate: ONE_LEVEL },
        },
        filters,
        sort,
        page,
        pageSize,
      });

      const items = Array.isArray(result?.results) ? result.results : (result || []);

      const data = items.map((event) => ({
        slug: event.slug,
        title: event.title,
        subtitle: event.subtitle || null,
        summary: event.summary || null,
        startDate: event.startDate || null,
        endDate: event.endDate || null,
        timezone: event.timezone || null,
        locationType: event.locationType || 'on-site',
        venueName: event.venueName || null,
        address: event.address || null,
        onlineEventUrl: event.onlineEventUrl || null,
        registrationLink: event.registrationLink || null,
        registrationDeadline: event.registrationDeadline || null,
        organizer: event.organizer || null,
        audience: event.audience || null,
        eventStatus: event.eventStatus || 'scheduled',
        capacity: Number.isFinite(event.capacity) ? event.capacity : null,
        priceDetails: event.priceDetails || null,
        isFeatured: Boolean(event.isFeatured),
        updatedAt: event.updatedAt,
        heroImage: event.heroImage || null,
        gallery: event.gallery || [],
        speakers: Array.isArray(event.speakers) ? event.speakers : [],
        cta: event.cta || null,
      }));

      ctx.body = { data };
    } catch (err) {
      strapi.log.error('event.upcoming failed', err);
      ctx.status = 500;
      ctx.body = { error: 'event_upcoming_failed' };
    }
  },

}));
