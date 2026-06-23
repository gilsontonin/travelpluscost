// Pre-generate the hotel sitemaps as STATIC files at build time. The directory has ~274k rows;
// generating these per-request from Supabase took ~40s (deep-OFFSET pagination) and Google's sitemap
// fetcher timed out → "Sitemap could not be read". Static files are served by the CDN instantly.
//
//   export $(grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SECRET_KEY|NEXT_PUBLIC_SITE_URL)=' .env.local | xargs)
//   node scripts/gen-sitemaps.mjs
//
// Wired as `prebuild`, so Netlify regenerates these on every deploy. Output:
//   public/sitemaps/hotels-{k}.xml   urlset shards (<= SHARD_SIZE URLs each)
//   public/sitemap-hotels.xml        sitemapindex (current): core /sitemap.xml + every hotel shard
//   public/sitemap-index.xml         legacy copy of the same index (back-compat)
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://travelpluscost.com").replace(/\/$/, "");
// Google's hard cap is 50k URLs / 50MB per file, but big shards (~5MB) timed out Google's sitemap
// fetcher → "Couldn't fetch" in GSC. 5k URLs ≈ 500KB raw / ~90KB gzipped → fetches near-instantly,
// zero timeout risk. (66k hotels ⇒ ~14 shards.) See docs/HANDOFF.md.
const SHARD_SIZE = 5000;
// City hubs (/hotels/<city>): only list a hub once the city has at least this many real hotels.
// Thinner cities still render on demand, but a 1–2 hotel hub is near-duplicate of the hotel page
// itself — keeping those out of the sitemap avoids a doorway-page footprint. ≥3 ⇒ ~3.7k hubs.
const MIN_HUB_HOTELS = 3;
const OUT_DIR = "public/sitemaps";

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
    let q = sb.from("hotels").select("id,name,city,state").eq("country", "us").eq("kind", "hotel").order("id", { ascending: true }).limit(1000);
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

if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const shardCount = Math.max(1, Math.ceil(rows.length / SHARD_SIZE));
const shardFiles = [];
for (let k = 0; k < shardCount; k++) {
  const slice = rows.slice(k * SHARD_SIZE, (k + 1) * SHARD_SIZE);
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
for (const h of rows) {
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

// Master index: core (static pages + blog) sitemap, the city-hubs shard, then every hotel shard.
const entries = [
  `<sitemap><loc>${SITE}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  `<sitemap><loc>${SITE}/sitemaps/cities.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  ...shardFiles.map((f) => `<sitemap><loc>${SITE}/sitemaps/${f}</loc><lastmod>${today}</lastmod></sitemap>`),
];
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</sitemapindex>\n`;
// sitemap-hotels.xml is the CURRENT index (the one robots.txt advertises + you submit to GSC). It's a
// fresh URL Google never saw the old 274k-junk version at, so it has no cached "Couldn't fetch" history.
// sitemap-index.xml is the legacy name, still written (identical) so any old reference stays live & clean.
for (const name of ["sitemap-hotels.xml", "sitemap-index.xml"]) {
  await writeFile(`public/${name}`, indexXml);
}
console.log(`[gen-sitemaps] wrote public/sitemap-hotels.xml (+ legacy sitemap-index.xml), ${entries.length} sitemaps each`);

// ── Geo index (content/geo-index.json) ───────────────────────────────────────
// Powers the /hotels browse index, the state hubs (/destinations/<state>) and the same-state
// cross-links on city hubs. Built here because the whole directory is already in memory. Each city
// slug is assigned to its PRIMARY state (the one with the most hotels), since the city-hub URL
// (/hotels/<slug>) isn't state-scoped. Committed (not gitignored) so dev/build always has it.
const cityAgg = new Map(); // slug -> { name, byState: Map<code,count> }
const stateHotels = new Map(); // code -> total hotels in state
for (const h of rows) {
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
const geo = {
  generated: today,
  totals: { hotels: rows.length, cities: geoCities, states: Object.keys(statesObj).length },
  states: statesObj,
};
await writeFile("content/geo-index.json", JSON.stringify(geo));
console.log(`[gen-sitemaps] wrote content/geo-index.json (${geo.totals.states} states, ${geo.totals.cities} cities)`);
