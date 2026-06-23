import type { MetadataRoute } from "next";
import { abs, SITE_URL, SITEMAP_SHARD } from "@/lib/site";
import { directoryCount } from "@/lib/directory";

// Allow crawling of the public, indexable surface; keep transactional/utility routes out of the index.
// Advertises the core/blog sitemap + every hotel shard so the full directory is discoverable.
export default async function robots(): Promise<MetadataRoute.Robots> {
  let shards = 6; // fallback if the count query is unavailable at build
  try {
    shards = Math.max(1, Math.ceil((await directoryCount("us")) / SITEMAP_SHARD));
  } catch {
    /* keep fallback */
  }
  const sitemaps = [
    abs("/sitemap.xml"),
    ...Array.from({ length: shards }, (_, i) => abs(`/hotel-sitemap/sitemap/${i}.xml`)),
  ];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/book", "/booking-complete", "/booking-confirmed", "/cancel", "/compare"],
    },
    sitemap: sitemaps,
    host: SITE_URL,
  };
}
