'use strict';

/**
 * Dynamischer Deep-Populate-Controller für Strapi v5 (CommonJS).
 * Endpunkte:
 *   GET /api/articles/by-slug/:slug?status=published|draft&depth=4
 *   GET /api/articles/public?status=published|draft&page=1&pageSize=100
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

module.exports = factories.createCoreController('api::article.article', ({ strapi }) => ({

  // ==== UNVERÄNDERT: /api/articles/by-slug/:slug ====
  async bySlug(ctx) {
    const { slug } = ctx.params;
    if (!slug) return ctx.badRequest('Missing slug');

    const status = ctx.query.status === 'draft' ? 'draft' : 'published';

    const depthParam = Number(ctx.query.depth);
    const maxDepth = Number.isFinite(depthParam) && depthParam > 0 ? Math.min(depthParam, 8) : 4;

    const populate = buildPopulateForContentType(strapi, 'api::article.article', { maxDepth });

    if (process.env.NODE_ENV !== 'production') {
      try {
        strapi.log.debug(`[article.bySlug] populate => ${JSON.stringify(populate)}`);
      } catch { /* no-op */ }
    }

    const page = await strapi.documents('api::article.article').findFirst({
      status,
      filters: { slug: { $eq: slug } },
      populate,
    });

    if (!page) return ctx.notFound('article not found');

    page.seoMeta = await buildSeoPayload({
      entity: page,
      type: 'news',
      strapi,
      fallbackImage: page.blogimage || null,
    });
    ctx.body = page;
  },

  // ==== PUBLIC LIST: /api/articles/public ====
  async publicList(ctx) {
    try {
      const status = ctx.query.status === 'draft' ? 'draft' : 'published';
      const page = Number(ctx.query.page) || 1;
      const pageSize = Number(ctx.query.pageSize) || 100;

      const result = await strapi.documents('api::article.article').findMany({
        status,
        // Wir liefern slug, Titel, Datum & Magazin-Metadaten (plus Bilder)
        fields: [
          'slug',
          'title',
          'subtitle',
          'summary',
          'publicationDate',
          'readingMinutes',
          'isFeatured',
          'externalLink',
          'updatedAt',
        ],
        populate: {
          blogimage: {
            // v5: leeres Objekt = 1-Level-Populate (id, url, formats, ...)
            // Optional: mit fields einschränken
            // fields: ['url', 'alternativeText', 'width', 'height', 'formats', 'name'],
          },
          gallery: ONE_LEVEL,
        },
        filters: {
          slug: { $notNull: true },
          publicationDate: { $notNull: true },
        },
        sort: [
          { publicationDate: 'desc' },
          { updatedAt: 'desc' },
        ],
        page,
        pageSize,
      });

      const items = Array.isArray(result?.results) ? result.results : (result || []);

      // Rohfelder + populierte Medien schlank nach außen geben
      const data = items.map((e) => ({
        slug: e.slug,
        title: e.title,
        subtitle: e.subtitle || null,
        summary: e.summary || null,
        publicationDate: e.publicationDate || null,
        readingMinutes: e.readingMinutes || null,
        isFeatured: Boolean(e.isFeatured),
        externalLink: e.externalLink || null,
        updatedAt: e.updatedAt,
        blogimage: e.blogimage || null,
        gallery: e.gallery || [],
      }));

      ctx.body = { data };
    } catch (err) {
      strapi.log.error('article.publicList failed', err);
      ctx.status = 500;
      ctx.body = { error: 'article_public_list_failed' };
    }
  },

}));
