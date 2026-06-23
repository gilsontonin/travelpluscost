import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { abs } from "@/lib/site";
import { REGIONS } from "@/lib/regions";
import { slugify } from "@/lib/hotelUrl";

// Core routes + city hub pages + every blog post. The 274k-hotel long tail lives in static shard
// files (public/sitemaps/hotels-*.xml, built by scripts/gen-sitemaps.mjs); /sitemap-index.xml ties
// this core sitemap and those shards together for a single GSC submission.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: abs("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: abs("/search"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: abs("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  // Curated city hub pages — destination landing pages ("hotels in <city>").
  const cityHubs: MetadataRoute.Sitemap = [
    ...new Set(REGIONS.flatMap((r) => r.cities.map((c) => slugify(c)))),
  ].map((slug) => ({ url: abs(`/hotels/${slug}`), lastModified: now, changeFrequency: "weekly", priority: 0.8 }));

  const posts: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: abs(`/blog/${p.slug}`),
    lastModified: new Date((p.updated ?? p.date) + "T00:00:00"),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...cityHubs, ...posts];
}
