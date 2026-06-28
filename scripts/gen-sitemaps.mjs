// Pre-generate the hotel sitemaps as STATIC files at build time. The directory has ~274k rows;
// generating these per-request from Supabase took ~40s (deep-OFFSET pagination) and Google's sitemap
// fetcher timed out → "Sitemap could not be read". Static files are served by the CDN instantly.
//
//   export $(grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SECRET_KEY|NEXT_PUBLIC_SITE_URL)=' .env.local | xargs)
//   node scripts/gen-sitemaps.mjs
//
// Run by netlify.toml (npm run sitemaps && npm run build) on every deploy. Everything sits under one
// version token (SITEMAP_VERSION) so the whole tree can be rotated to fresh URLs at once. Output:
//   public/sitemaps/<v>/pages.xml      core: static pages + browse index + state hubs + blog
//   public/sitemaps/<v>/cities.xml     city hubs (≥ MIN_HUB_HOTELS)
//   public/sitemaps/<v>/hotels-{k}.xml hotel shards (≤ SHARD_SIZE URLs each)
//   public/sitemap-<v>.xml             sitemapindex — the ONE URL to submit in GSC
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://travelpluscost.com").replace(/\/$/, "");
// Google's hard cap is 50k URLs / 50MB per file, but big shards (~5MB) timed out Google's sitemap
// fetcher → "Couldn't fetch" in GSC. 5k URLs ≈ 500KB raw / ~90KB gzipped → fetches near-instantly,
// zero timeout risk. (66k hotels ⇒ ~14 shards.) See docs/HANDOFF.md.
const SHARD_SIZE = 5000;
// City hubs (/hotels/<city>): list a hub once the city has at least this many real hotels.
// Owner directive (2026-06): MAX COVERAGE — every US city with ≥1 hotel gets a listed hub (no pruning,
// thin cities included). Each hub carries unique city FAQs + same-state/sibling links + a full hotel
// index, so a 1-hotel hub still adds context over the bare property page. ≥1 ⇒ ~6.7k hubs.
const MIN_HUB_HOTELS = 1;
// Versioned sitemap tree. Google caches each sitemap URL — the index AND every child — and is slow to
// re-read, so changing content under an existing URL can serve stale for days. Bumping SITEMAP_VERSION
// rotates the WHOLE tree at once: the index filename (/sitemap-v3.xml) and every child path
// (/sitemaps/v3/*) become brand-new URLs Google has never read → guaranteed fresh fetch. Old URLs are
// wiped each build so they 404 and Google drops them. Bump v3 → v4 whenever you need a clean re-read.
const SITEMAP_VERSION = "v3";
const SITEMAP_DIR = `sitemaps/${SITEMAP_VERSION}`;
const OUT_DIR = `public/${SITEMAP_DIR}`;
const INDEX_FILE = `sitemap-${SITEMAP_VERSION}.xml`; // → /sitemap-v3.xml — this is the one to submit in GSC

// State code → name (for the /destinations/<state> hub URLs in the core-pages child). Mirrors
// src/lib/states.ts; this build script can't import the TS module.
const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky",
  LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  PR: "Puerto Rico", VI: "U.S. Virgin Islands", GU: "Guam",
};
const stateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

if (!SB_URL || !SB_SECRET) {
  console.warn("[gen-sitemaps] Missing Supabase env — skipping hotel sitemaps (build continues).");
  process.exit(0);
}

const sb = createClient(SB_URL, SB_SECRET, { auth: { persistSession: false } });

// Mirror src/lib/hotelUrl.ts so the static URLs match the live routes exactly.
function slugify(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
function hotelHref(h) {
  const city = slugify(h.city) || "hotel";
  const name = slugify(h.name) || "stay";
  return `/hotels/${city}/${name}-${h.id}`;
}

// Keyset pagination (WHERE id > cursor) — O(1) per page, unlike OFFSET which scans deeper every shard.
async function fetchAll() {
  const rows = [];
  let cursor = null;
  for (;;) {
    // kind='hotel' only — never list rentals (apartments/vacation homes/condos/B&Bs…). They have no
    // availability and were SEO junk (208k of 274k rows). Belt-and-suspenders even though the cleanup
    // deleted them: a future re-ingest can't leak them back into the sitemap.
    let q = sb.from("hotels").select("id,name,city,state,lat,lng,review_count").eq("country", "us").eq("kind", "hotel").order("id", { ascending: true }).limit(1000);
    if (cursor) q = q.gt("id", cursor);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    if (!data.length) break;
    rows.push(...data);
    cursor = data[data.length - 1].id;
    if (rows.length % 25000 < 1000) console.log(`[gen-sitemaps] fetched ${rows.length}…`);
    if (data.length < 1000) break;
  }
  return rows;
}

const t0 = Date.now();
console.log("[gen-sitemaps] fetching directory…");
const rows = await fetchAll();
console.log(`[gen-sitemaps] ${rows.length} hotels in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// Collapse TRUE duplicates — the same property ingested under two supplier ids (same name + city +
// state AND ~the same coordinates). These rendered identical titles ("duplicate title tag" in the
// crawl) and split link equity. Keep the better-reviewed id. Different-location same-name hotels are
// distinct properties (different coords) and are NOT merged.
const dedupeKey = (h) => {
  const lat = h.lat != null ? Math.round(h.lat * 100) / 100 : "?";
  const lng = h.lng != null ? Math.round(h.lng * 100) / 100 : "?";
  return `${slugify(h.name)}|${slugify(h.city)}|${(h.state || "").toLowerCase()}|${lat}|${lng}`;
};
const _best = new Map();
for (const h of rows) {
  const k = dedupeKey(h);
  const cur = _best.get(k);
  if (!cur || (h.review_count ?? 0) > (cur.review_count ?? 0)) _best.set(k, h);
}
const deduped = [..._best.values()];
console.log(`[gen-sitemaps] collapsed ${rows.length - deduped.length} duplicate listings → ${deduped.length} unique`);

// Wipe the whole sitemaps/ tree (old version dirs included) so stale child URLs 404 and Google drops them.
if (existsSync("public/sitemaps")) await rm("public/sitemaps", { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const shardCount = Math.max(1, Math.ceil(deduped.length / SHARD_SIZE));
const shardFiles = [];
for (let k = 0; k < shardCount; k++) {
  const slice = deduped.slice(k * SHARD_SIZE, (k + 1) * SHARD_SIZE);
  const body = slice.map((h) => `<url><loc>${SITE}${hotelHref(h)}</loc></url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  const file = `hotels-${k}.xml`;
  await writeFile(`${OUT_DIR}/${file}`, xml);
  shardFiles.push(file);
}
console.log(`[gen-sitemaps] wrote ${shardCount} shard file(s) to ${OUT_DIR}/`);

// City hubs (/hotels/<city>): one entry per city with ≥ MIN_HUB_HOTELS real hotels. Group by the
// SAME slug the route uses, so the URL here resolves to a real, non-thin hub page.
const cityCounts = new Map();
for (const h of deduped) {
  const slug = slugify(h.city);
  if (slug) cityCounts.set(slug, (cityCounts.get(slug) || 0) + 1);
}
const citySlugs = [...cityCounts.entries()]
  .filter(([, n]) => n >= MIN_HUB_HOTELS)
  .map(([s]) => s)
  .sort();
const cityBody = citySlugs.map((s) => `<url><loc>${SITE}/hotels/${s}</loc></url>`).join("\n");
const cityXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cityBody}\n</urlset>\n`;
await writeFile(`${OUT_DIR}/cities.xml`, cityXml);
console.log(`[gen-sitemaps] wrote ${OUT_DIR}/cities.xml (${citySlugs.length} city hubs, ≥${MIN_HUB_HOTELS} hotels)`);

// ── Geo aggregation (states → cities) — feeds the core-pages child below AND content/geo-index.json.
// Each city slug is filed under its PRIMARY state (most hotels), since /hotels/<slug> isn't state-scoped.
const cityAgg = new Map(); // slug -> { name, byState: Map<code,count> }
const stateHotels = new Map(); // code -> total hotels in state
for (const h of deduped) {
  const code = (h.state || "").toUpperCase();
  if (code) stateHotels.set(code, (stateHotels.get(code) || 0) + 1);
  const slug = slugify(h.city);
  if (!slug || !code) continue;
  let rec = cityAgg.get(slug);
  if (!rec) { rec = { name: h.city, byState: new Map() }; cityAgg.set(slug, rec); }
  rec.byState.set(code, (rec.byState.get(code) || 0) + 1);
}
const statesObj = {};
for (const [code, count] of stateHotels) statesObj[code] = { hotels: count, cities: [] };
for (const [slug, rec] of cityAgg) {
  let primary = null, max = -1, total = 0;
  for (const [code, n] of rec.byState) { total += n; if (n > max) { max = n; primary = code; } }
  if (primary) (statesObj[primary] ??= { hotels: 0, cities: [] }).cities.push({ slug, name: rec.name, count: total });
}
let geoCities = 0;
for (const code of Object.keys(statesObj)) {
  statesObj[code].cities.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  geoCities += statesObj[code].cities.length;
}

// Core-pages child (pages.xml): static routes + browse index + every state hub + blog posts. Versioned
// like the shards so the index references ZERO non-/v3 URLs — nothing Google has cached can leak in.
let blogSlugs = [];
try {
  blogSlugs = [...readFileSync("src/lib/posts.ts", "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
} catch { /* posts file optional */ }
const pagePaths = [
  "/", "/search", "/blog", "/privacy", "/terms", "/disclosure", "/hotels",
  ...Object.keys(statesObj)
    .filter((c) => statesObj[c].hotels > 0 && STATE_NAMES[c])
    .map((c) => `/destinations/${stateSlug(STATE_NAMES[c])}`),
  ...blogSlugs.map((s) => `/blog/${s}`),
];
const pagesBody = pagePaths.map((p) => `<url><loc>${SITE}${p}</loc></url>`).join("\n");
const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pagesBody}\n</urlset>\n`;
await writeFile(`${OUT_DIR}/pages.xml`, pagesXml);
console.log(`[gen-sitemaps] wrote ${OUT_DIR}/pages.xml (${pagePaths.length} core URLs)`);

// Master index — every child is a fresh /${SITEMAP_DIR}/ URL (pages, cities, hotel shards). No
// reference to /sitemap.xml or any non-versioned path, so nothing Google has cached can leak in.
const entries = [
  `<sitemap><loc>${SITE}/${SITEMAP_DIR}/pages.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `<sitemap><loc>${SITE}/${SITEMAP_DIR}/cities.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  ...shardFiles.map((f) => `<sitemap><loc>${SITE}/${SITEMAP_DIR}/${f}</loc><lastmod>${today}</lastmod></sitemap>`),
];
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</sitemapindex>\n`;
await writeFile(`public/${INDEX_FILE}`, indexXml);
console.log(`[gen-sitemaps] wrote public/${INDEX_FILE} (${entries.length} child sitemaps, all /${SITEMAP_DIR}/)`);

// Static robots.txt — generated HERE so its Sitemap line always matches the current SITEMAP_VERSION, and
// served as a flat file from public/ (NOT a dynamic Next route) so it can never cold-start / 5xx during a
// deploy. robots.txt unreachability can pause Google's crawl, so it must be bulletproof at request time.
const ROBOTS_JUNK_BOTS = ["AhrefsBot", "MJ12bot", "DotBot", "BLEXBot", "Bytespider", "DataForSeoBot", "PetalBot"];
const ROBOTS_DISALLOW = ["/api/", "/owner", "/account", "/auth/", "/book", "/booking-complete", "/booking-confirmed", "/cancel", "/compare", "/*_rsc="];
const robotsTxt =
  `User-Agent: *\nAllow: /\n` +
  ROBOTS_DISALLOW.map((p) => `Disallow: ${p}\n`).join("") +
  `\n` +
  ROBOTS_JUNK_BOTS.map((b) => `User-Agent: ${b}\nDisallow: /\n\n`).join("") +
  `Host: ${SITE}\nSitemap: ${SITE}/${INDEX_FILE}\n`;
await writeFile("public/robots.txt", robotsTxt);
console.log(`[gen-sitemaps] wrote public/robots.txt (static — Sitemap → /${INDEX_FILE})`);

// content/geo-index.json — powers the /hotels browse index, state hubs and city-hub cross-links
// (aggregated above). Committed (not gitignored) so dev/build always has it.
const geo = {
  generated: today,
  totals: { hotels: rows.length, cities: geoCities, states: Object.keys(statesObj).length },
  states: statesObj,
};
await writeFile("content/geo-index.json", JSON.stringify(geo));
console.log(`[gen-sitemaps] wrote content/geo-index.json (${geo.totals.states} states, ${geo.totals.cities} cities)`);
