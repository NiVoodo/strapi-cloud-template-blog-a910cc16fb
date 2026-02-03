"use strict";

/**
 * Lifecycle hooks for Page content-type
 * Triggers Vercel redeploy when pages are published or unpublished
 * This regenerates known-slugs.json and sitemap at build time
 */

const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK || "";

// Debounce: only trigger one deploy per 30 seconds
let lastDeployTime = 0;
const DEPLOY_DEBOUNCE_MS = 30000;

function triggerVercelDeploy(event, slug) {
  if (!VERCEL_DEPLOY_HOOK) {
    console.warn("⚠️ VERCEL_DEPLOY_HOOK not set - skipping deploy trigger");
    return;
  }

  const now = Date.now();
  if (now - lastDeployTime < DEPLOY_DEBOUNCE_MS) {
    console.log(`⏳ [${event}] Deploy debounced (last deploy ${Math.round((now - lastDeployTime) / 1000)}s ago)`);
    return;
  }

  lastDeployTime = now;

  console.log(`🚀 [${event}] Triggering Vercel redeploy for slug: ${slug || "(none)"}`);

  // Fire-and-forget - don't block Strapi
  fetch(VERCEL_DEPLOY_HOOK, { method: "POST" })
    .then((res) => {
      if (res.ok) {
        console.log(`✅ [${event}] Vercel deploy triggered successfully`);
      } else {
        console.warn(`⚠️ [${event}] Vercel deploy trigger failed: ${res.status}`);
      }
    })
    .catch((err) => {
      console.error(`❌ [${event}] Vercel deploy trigger error:`, err.message);
    });
}

module.exports = {
  afterCreate(event) {
    const { result } = event;
    // Only trigger if published (not draft)
    if (result?.publishedAt) {
      triggerVercelDeploy("page.publish", result?.slug);
    }
  },

  afterUpdate(event) {
    const { result, params } = event;

    // Check if this is a publish/unpublish action (not just a save)
    // Strapi sets publishedAt when publishing and removes it when unpublishing
    const wasPublished = params?.data?.publishedAt !== undefined;

    if (wasPublished) {
      const action = result?.publishedAt ? "page.publish" : "page.unpublish";
      triggerVercelDeploy(action, result?.slug);
    }
    // Draft saves (no publishedAt change) are ignored
  },

  afterDelete(event) {
    const { result } = event;
    // Only trigger if the deleted page was published
    if (result?.publishedAt) {
      triggerVercelDeploy("page.delete", result?.slug);
    }
  },
};
