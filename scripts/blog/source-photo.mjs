#!/usr/bin/env node
// source-photo.mjs — find a real, attributed cover photo for a post. Searches Unsplash (and Pexels as
// a fallback), prints landscape candidates with a READY-TO-PASTE `cover` object for src/lib/posts.ts.
// Reads UNSPLASH_ACCESS_KEY / PEXELS_API_KEY from .env.local.
//   npm run blog:photo -- "waikiki beach honolulu skyline"
//   npm run blog:photo -- "las vegas strip at night" --n 8
//
// You still INSPECT the candidate (open the url) before using it — Unsplash/Pexels mislabel constantly.
const args = process.argv.slice(2);
const nIdx = args.indexOf("--n");
const n = nIdx > -1 ? Number(args[nIdx + 1]) || 6 : 6;
const query = args.filter((a, i) => !a.startsWith("--") && i !== (nIdx > -1 ? nIdx + 1 : -1)).join(" ").trim();
if (!query) { console.error('usage: source-photo.mjs "<search query>" [--n 6]'); process.exit(1); }

const U = process.env.UNSPLASH_ACCESS_KEY;
const P = process.env.PEXELS_API_KEY;
const coverUrl = (raw) => `${raw.split("?")[0]}?fm=webp&fit=crop&w=1200&h=675&q=80`;

async function unsplash() {
  if (!U) return [];
  const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${n}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${U}` } });
  if (!r.ok) { console.error(`Unsplash ${r.status}`); return []; }
  const j = await r.json();
  return (j.results || []).map((p) => ({
    src: coverUrl(p.urls.raw),
    alt: (p.alt_description || p.description || query).slice(0, 110),
    credit: { name: p.user.name, url: `https://unsplash.com/@${p.user.username}` },
    preview: p.urls.small,
    source: "unsplash",
  }));
}

async function pexels() {
  if (!P) return [];
  const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${n}&orientation=landscape`,
    { headers: { Authorization: P } });
  if (!r.ok) { console.error(`Pexels ${r.status}`); return []; }
  const j = await r.json();
  return (j.photos || []).map((p) => ({
    src: `${p.src.landscape.split("?")[0]}?auto=compress&fm=webp&w=1200&h=675`,
    alt: (p.alt || query).slice(0, 110),
    credit: { name: p.photographer, url: p.photographer_url },
    preview: p.src.medium,
    source: "pexels",
  }));
}

let cands = await unsplash();
if (!cands.length) cands = await pexels();
if (!cands.length) { console.error("No candidates (check UNSPLASH_ACCESS_KEY / PEXELS_API_KEY, run via npm run blog:photo)."); process.exit(1); }

console.log(`\n📷 ${cands.length} candidates for "${query}" — INSPECT the preview before using:\n`);
cands.forEach((c, i) => {
  console.log(`[${i + 1}] ${c.source} · by ${c.credit.name}`);
  console.log(`    preview: ${c.preview}`);
  console.log(`    cover: {`);
  console.log(`      src: ${JSON.stringify(c.src)},`);
  console.log(`      alt: ${JSON.stringify(c.alt)},`);
  console.log(`      credit: { name: ${JSON.stringify(c.credit.name)}, url: ${JSON.stringify(c.credit.url)} },`);
  console.log(`    },\n`);
});
