'use strict';

const DOCUMENT_ID_REGEX = /^[a-z0-9]{8,}$/i;

const isDocumentId = (value) => DOCUMENT_ID_REGEX.test(value || '');

const isNumericId = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  const num = Number(value);
  return Number.isInteger(num) && String(value).trim() === String(num);
};

const buildPopulate = (populate) => populate || { blocks: { on: {} } };

const attachDocumentId = async (entry, service, strapi) => {
  if (!entry || entry.documentId) return entry;
  if (!entry.slug) return entry;
  try {
    const doc = await service.findFirst({
      filters: { slug: { $eq: entry.slug } },
      fields: ['documentId'],
    });
    if (doc?.documentId) {
      return { ...entry, documentId: doc.documentId };
    }
  } catch (error) {
    strapi?.log?.debug?.(`document-resolver attachDocumentId failed: ${error.message}`);
  }
  return entry;
};

async function findDocumentByAnyIdentifier({ strapi, uid, identifier, populate }) {
  if (!identifier) return null;
  const service = strapi.documents(uid);
  const populateConfig = buildPopulate(populate);

  if (isDocumentId(identifier)) {
    const byDocId = await service.findOne({
      documentId: identifier,
      populate: populateConfig,
    });
    if (byDocId) return byDocId;
  }

  if (isNumericId(identifier)) {
    const numericId = Number(identifier);
    try {
      const viaEntity = await strapi.entityService.findOne(uid, numericId, {
        populate: populateConfig,
      });
      if (viaEntity) {
        return attachDocumentId(viaEntity, service, strapi);
      }
    } catch (error) {
      strapi.log?.debug?.(`document-resolver entityService lookup failed: ${error.message}`);
    }
  }

  const bySlug = await service.findFirst({
    filters: { slug: { $eq: identifier } },
    populate: populateConfig,
  });
  if (bySlug) return bySlug;

  return null;
}

module.exports = {
  findDocumentByAnyIdentifier,
};
