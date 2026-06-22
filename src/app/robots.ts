import type { MetadataRoute } from "next";
import { abs, SITE_URL } from "@/lib/site";

// Allow crawling of the public, indexable surface; keep transactional/utility routes out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/book", "/booking-complete", "/booking-confirmed", "/cancel", "/compare"],
    },
    sitemap: abs("/sitemap.xml"),
    host: SITE_URL,
  };
}
