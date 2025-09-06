// src/api/page/controllers/page.js
'use strict';

/**
 * Dynamischer Deep-Populate-Controller für Strapi v5 (CommonJS).
 * Endpunkt: GET /api/pages/by-slug/:slug?status=published|draft&depth=4
 */

const { factories } = require('@strapi/strapi');

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
    ctx.body = page;
  },
}));
