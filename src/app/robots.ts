import type { MetadataRoute } from "next";
import { abs, SITE_URL } from "@/lib/site";

// Allow the public, indexable surface; keep transactional/utility routes out of the index.
// One sitemap index (public/sitemap-<version>.xml, built by scripts/gen-sitemaps.mjs) referencing only
// versioned /sitemaps/<version>/ children (core pages, city hubs, hotel shards). Bumping the version in
// gen-sitemaps rotates the whole tree to fresh URLs at once — see that file for why (Google caches each
// sitemap URL and is slow to re-read). Keep this in sync with INDEX_FILE there.

// Junk-tier SEO/scraper crawlers: they re-crawl all ~65k pages for zero benefit (we don't use Moz/Ahrefs/
// Majestic) and were a real slice of the bandwidth bill. Full disallow. We deliberately KEEP the open "*"
// rule for the crawlers we want: Googlebot + Bingbot (indexing), SemrushBot (our own audits), and the AI
// assistants GPTBot/ClaudeBot/PerplexityBot (the audience /llms.txt targets). NOTE: robots.txt only stops
// *polite* bots; edge-blocking the rude ones is a later Cloudflare job.
const JUNK_BOTS = ["AhrefsBot", "MJ12bot", "DotBot", "BLEXBot", "Bytespider", "DataForSeoBot", "PetalBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // "/*_rsc=" stops Googlebot crawling the App Router's RSC prefetch payloads (the ?_rsc=<hash>
        // duplicate of every <Link> target). GSC crawl stats showed those = 57% of all crawl requests
        // (~113k/day) while Discovery sat at 13% — i.e. most of the crawl budget was being spent on RSC
        // copies instead of finding our 65k hotel pages. Browsers ignore robots.txt, so real-user
        // prefetch is unaffected; only bot crawl budget is freed.
        disallow: ["/api/", "/owner", "/account", "/auth/", "/book", "/booking-complete", "/booking-confirmed", "/cancel", "/compare", "/*_rsc="],
      },
      ...JUNK_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: [abs("/sitemap-v3.xml")],
    host: SITE_URL,
  };
}
