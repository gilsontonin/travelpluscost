// Pre-generate the hotel sitemaps as STATIC files at build time. The directory has ~274k rows;
// generating these per-request from Supabase took ~40s (deep-OFFSET pagination) and Google's sitemap
// fetcher timed out → "Sitemap could not be read". Static files are served by the CDN instantly.
//
//   export $(grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SECRET_KEY|NEXT_PUBLIC_SITE_URL)=' .env.local | xargs)
//   node scripts/gen-sitemaps.mjs
//
// Wired as `prebuild`, so Netlify regenerates these on every deploy. Output:
//   public/sitemaps/hotels-{k}.xml   urlset shards (<= SHARD_SIZE URLs each)
//   public/sitemap-index.xml         sitemapindex: core /sitemap.xml + every hotel shard
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://travelpluscost.com").replace(/\/$/, "");
// Google's hard cap is 50k URLs / 50MB per file, but in practice big shards (~5MB) timed out
// Google's sitemap fetcher → "Couldn't fetch" in GSC (only the small final shard succeeded).
// ~10k URLs ≈ 1MB raw / ~180KB gzipped → fetches in well under a second. See docs/HANDOFF.md.
const SHARD_SIZE = 10000;
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
    let q = sb.from("hotels").select("id,name,city").eq("country", "us").eq("kind", "hotel").order("id", { ascending: true }).limit(1000);
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

// Master index: the core (pages + city hubs + blog) sitemap, then every hotel shard.
const entries = [
  `<sitemap><loc>${SITE}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>`,
  ...shardFiles.map((f) => `<sitemap><loc>${SITE}/sitemaps/${f}</loc><lastmod>${today}</lastmod></sitemap>`),
];
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</sitemapindex>\n`;
await writeFile("public/sitemap-index.xml", indexXml);
console.log(`[gen-sitemaps] wrote public/sitemap-index.xml (${entries.length} sitemaps)`);
