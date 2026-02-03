"use strict";

/**
 * Lifecycle hooks for Page content-type
 * Triggers Next.js revalidation when pages are created, updated, or deleted
 *
 * IMPORTANT: Uses delayed fire-and-forget to avoid DB deadlock
 * (Strapi must finish its transaction before Next.js queries /api/pages/public)
 */

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "";
const REVALIDATION_DELAY_MS = 2000; // Wait 2s for Strapi transaction to complete

function getNextjsUrl() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.STRAPI_CLOUD === "true" ||
    !!process.env.DATABASE_URL;

  if (isProduction) {
    return process.env.NEXTJS_URL_PROD || "https://next-tauringstudio.vercel.app";
  }
  return process.env.NEXTJS_URL_LOCAL || "http://localhost:3000";
}

// Fire-and-forget with delay - doesn't block Strapi
function scheduleRevalidation(event, slug) {
  const baseUrl = getNextjsUrl();
  const url = `${baseUrl}/api/revalidate`;
  const isLocal = baseUrl.includes("localhost");
  const envLabel = isLocal ? "LOCAL" : "PROD";

  if (!REVALIDATE_SECRET) {
    console.warn(`⚠️ REVALIDATE_SECRET not set - skipping revalidation`);
    return;
  }

  console.log(`🔄 [${envLabel}] [${event}] Scheduling revalidation in ${REVALIDATION_DELAY_MS}ms`);

  // Delay to let Strapi finish its DB transaction
  setTimeout(async () => {
    console.log(`🚀 [${envLabel}] [${event}] Sending revalidation request to ${url}`);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${REVALIDATE_SECRET}`,
        },
        body: JSON.stringify({
          event,
          slug,
          path: slug ? `/${slug}` : undefined,
          revalidateAll: false,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ [${envLabel}] [${event}] Revalidation successful`);
        if (result.knownSlugs?.slugs) {
          console.log(`   → ${result.knownSlugs.slugs.length} slugs in whitelist`);
        }
      } else {
        console.warn(`⚠️ [${envLabel}] [${event}] Revalidation failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ [${envLabel}] [${event}] Revalidation error:`, error.message);
    }
  }, REVALIDATION_DELAY_MS);
}

module.exports = {
  afterCreate(event) {
    const { result } = event;
    scheduleRevalidation("page.create", result?.slug);
  },

  afterUpdate(event) {
    const { result } = event;
    scheduleRevalidation("page.update", result?.slug);
  },

  afterDelete(event) {
    const { result } = event;
    scheduleRevalidation("page.delete", result?.slug);
  },
};
