import type { MetadataRoute } from "next";
import { abs, SITE_URL } from "@/lib/site";

// Allow the public, indexable surface; keep transactional/utility routes out of the index.
// The sitemap index (public/sitemap-index.xml, built by scripts/gen-sitemaps.mjs) references the
// core sitemap + every static hotel shard, so one entry covers the whole site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/book", "/booking-complete", "/booking-confirmed", "/cancel", "/compare"],
    },
    sitemap: [abs("/sitemap-index.xml"), abs("/sitemap.xml")],
    host: SITE_URL,
  };
}
