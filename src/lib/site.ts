// Canonical site identity. One source of truth for URL/name so canonical tags, OG, sitemap,
// robots and JSON-LD all agree. Override the URL per-env with NEXT_PUBLIC_SITE_URL.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://travelpluscost.com";
export const SITE_NAME = "travelpluscost";
export const SITE_TAGLINE = "one honest price";
export const SITE_DESCRIPTION =
  "Hotels at cost, plus one small flat fee — the same price for everyone, never based on your data.";

// Max URLs per sitemap shard (Google's hard limit is 50,000). Drives the hotel sitemap sharding
// and the shard list robots.txt advertises.
export const SITEMAP_SHARD = 50000;

export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
