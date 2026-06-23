import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { abs } from "@/lib/site";

// Core static routes + every blog post. Two big derived lists ship as static shards built by
// scripts/gen-sitemaps.mjs from the directory: the ~66k real-hotel pages (public/sitemaps/hotels-*.xml)
// and every city hub with ≥3 hotels (public/sitemaps/cities.xml). /sitemap-hotels.xml ties this core
// sitemap and those shards together for a single GSC submission.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: abs("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: abs("/search"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: abs("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: abs("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: abs("/disclosure"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: abs(`/blog/${p.slug}`),
    lastModified: new Date((p.updated ?? p.date) + "T00:00:00"),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...posts];
}
