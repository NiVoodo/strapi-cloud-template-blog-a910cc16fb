'use strict';

/**
 * Dynamischer Deep-Populate-Controller für Strapi v5 (CommonJS).
 * Bestehender Endpunkt bleibt unverändert:
 *   GET /api/pages/by-slug/:slug?status=published|draft&depth=4
 *
 * NEU:
 *   GET /api/pages/public?status=published|draft&page=1&pageSize=100
 *     -> { data: [{ slug, updatedAt } ...] }
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
        // v5: 1-Level-Populate mit leerem Objekt statt boolean
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
          // Immer ein gültiges Populate-Objekt liefern (leer = 1 Level / nur Primitives)
          on[cUid] = Object.keys(child).length ? { populate: child } : {};
        }
        if (Object.keys(on).length) {
          populate[name] = { on };
        }
        break;
      }

      default:
        // primitive Felder werden nicht populatet
        break;
    }
  }

  // Wenn auf dieser Ebene nichts zu populaten ist, leeres Objekt zurück (kein boolean!)
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

module.exports = factories.createCoreController('api::page.page', ({ strapi }) => ({

  // ==== UNVERÄNDERT: deine bestehende bySlug-Action ====
  async bySlug(ctx) {
    const { slug } = ctx.params;
    if (!slug) return ctx.badRequest('Missing slug');

    // v5: status (published|draft)
    const status = ctx.query.status === 'draft' ? 'draft' : 'published';

    // optionale Tiefe ?depth=
    const depthParam = Number(ctx.query.depth);
    const maxDepth = Number.isFinite(depthParam) && depthParam > 0 ? Math.min(depthParam, 8) : 4;

    // Populate dynamisch für den Page-CT bauen (inkl. DZ 'blocks')
    const populate = buildPopulateForContentType(strapi, 'api::page.page', { maxDepth });

    if (process.env.NODE_ENV !== 'production') {
      try {
        strapi.log.debug(`[page.bySlug] populate => ${JSON.stringify(populate)}`);
      } catch { /* no-op */ }
    }

    const page = await strapi.documents('api::page.page').findFirst({
      status,
      filters: { slug: { $eq: slug } },
      populate, // v5: darf nur '*' | string[] | Populate-Objekt enthalten (kein boolean)
    });

    if (!page) return ctx.notFound('Page not found');

    page.seoMeta = await buildSeoPayload({
      entity: page,
      type: 'page',
      strapi,
    });
    ctx.body = page;
  },

  // ==== NEU: leichte Liste für Sitemap etc. ====
  async publicList(ctx) {
    try {
      const status = ctx.query.status === 'draft' ? 'draft' : 'published';
      const page = Number(ctx.query.page) || 1;
      const pageSize = Number(ctx.query.pageSize) || 100;

      // Nur die Felder, die wir brauchen
      const result = await strapi.documents('api::page.page').findMany({
        status,
        fields: ['slug', 'updatedAt'],
        filters: { slug: { $notNull: true } },
        sort: { updatedAt: 'desc' },
        page,
        pageSize,
      });

      // documents().findMany liefert { results, pagination } in v5
      const items = Array.isArray(result?.results) ? result.results : result || [];

      const data = items.map((e) => ({
        slug: e.slug,
        updatedAt: e.updatedAt,
      }));

      ctx.body = { data };
    } catch (err) {
      strapi.log.error('page.publicList failed', err);
      ctx.status = 500;
      ctx.body = { error: 'page_public_list_failed' };
    }
  },

}));
