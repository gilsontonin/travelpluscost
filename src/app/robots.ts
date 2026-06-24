import type { MetadataRoute } from "next";
import { abs, SITE_URL } from "@/lib/site";

// Allow the public, indexable surface; keep transactional/utility routes out of the index.
// One sitemap index (public/sitemap-<version>.xml, built by scripts/gen-sitemaps.mjs) referencing only
// versioned /sitemaps/<version>/ children (core pages, city hubs, hotel shards). Bumping the version in
// gen-sitemaps rotates the whole tree to fresh URLs at once — see that file for why (Google caches each
// sitemap URL and is slow to re-read). Keep this in sync with INDEX_FILE there.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/book", "/booking-complete", "/booking-confirmed", "/cancel", "/compare"],
    },
    sitemap: [abs("/sitemap-v3.xml")],
    host: SITE_URL,
  };
}
