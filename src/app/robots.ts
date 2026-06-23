import type { MetadataRoute } from "next";
import { abs, SITE_URL } from "@/lib/site";

// Allow the public, indexable surface; keep transactional/utility routes out of the index.
// The sitemap index (public/sitemap-main.xml, built by scripts/gen-sitemaps.mjs) references the core
// sitemap + the city-hub shard + every hotel shard, so one entry covers the whole site. Fresh URL
// (the prior /sitemap-hotels.xml stayed stuck on a stale cached read in Search Console).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/book", "/booking-complete", "/booking-confirmed", "/cancel", "/compare"],
    },
    sitemap: [abs("/sitemap-main.xml"), abs("/sitemap.xml")],
    host: SITE_URL,
  };
}
