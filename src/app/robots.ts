import type { MetadataRoute } from "next";
import { abs, SITE_URL } from "@/lib/site";

// Allow the public, indexable surface; keep transactional/utility routes out of the index.
// The sitemap index (public/sitemap-hotels.xml, built by scripts/gen-sitemaps.mjs) references the
// core sitemap + every static hotel shard, so one entry covers the whole site. Fresh URL (replaced
// the legacy /sitemap-index.xml, which had a cached "Couldn't fetch" history in Search Console).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/book", "/booking-complete", "/booking-confirmed", "/cancel", "/compare"],
    },
    sitemap: [abs("/sitemap-hotels.xml"), abs("/sitemap.xml")],
    host: SITE_URL,
  };
}
