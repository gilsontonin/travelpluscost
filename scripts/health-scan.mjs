// In-house site health scanner — a free, dependency-light "Semrush Site Audit" we own.
// Crawls a representative sample of the live site (every page TYPE) + the sitemap and reports the bug
// classes that a script-heavy build regresses: broken links/pages, redirects, duplicate/missing/long
// titles & descriptions, canonical drift, multiple/missing H1, noindex leaks on money pages, invalid
// JSON-LD, broken images, and sitemap integrity. No credits, no deps (Node 20+ global fetch).
//
//   npm run health                       # scan production
//   npm run health -- --base http://localhost:3000
//   npm run health -- --cities 80 --properties 60   # widen the sample
//
// Exit code is non-zero if any ERROR-level issue is found, so it can gate CI.

import { readFileSync } from "node:fs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const BASE = (arg("base", "https://travelpluscost.com")).replace(/\/$/, "");
const CONCURRENCY = Number(arg("concurrency", 8));
const N_CITIES = Number(arg("cities", 50));
const N_PROPERTIES = Number(arg("properties", 40));
const MAX_LINKCHECK = Number(arg("links", 500));
const MAX_IMAGES = Number(arg("images", 100));
const UA = "travelpluscost-health-scan/1.0";

// ── tiny helpers ────────────────────────────────────────────────────────────
const C = { red: "\x1b[31m", yellow: "\x1b[33m", green: "\x1b[32m", dim: "\x1b[2m", b: "\x1b[1m", x: "\x1b[0m", cyan: "\x1b[36m" };
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        try { out[k] = await fn(items[k], k); } catch (e) { out[k] = { err: String(e?.message || e) }; }
      }
    }),
  );
  return out;
}
const decodeEntities = (s) =>
  String(s).replace(/&amp;/g, "&").replace(/&#x2f;/gi, "/").replace(/&#38;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const abs = (href) => {
  if (!href) return null;
  href = decodeEntities(href);
  if (href.startsWith("http")) return href.startsWith(BASE) ? href : null; // external → skip
  if (href.startsWith("/")) return BASE + href.split("#")[0];
  return null;
};
const attrs = (tag) => {
  const o = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*["']([^"']*)["']/g)) o[m[1].toLowerCase()] = m[2];
  return o;
};
const metas = (html) => [...html.matchAll(/<meta\s+[^>]*>/gi)].map((m) => attrs(m[0]));
const metaBy = (ms, key, val) => ms.find((a) => (a.name || a.property) === val)?.content ?? null;

async function fetchPage(url, method = "GET") {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method, redirect: "follow", headers: { "user-agent": UA } });
    const ttfb = Date.now() - t0;
    const ct = res.headers.get("content-type") || "";
    const html = method === "GET" && ct.includes("text/html") ? await res.text() : "";
    return { url, status: res.status, finalUrl: res.url, redirected: res.redirected, ttfb, ct, html };
  } catch (e) {
    return { url, status: 0, err: String(e?.message || e), ttfb: Date.now() - t0 };
  }
}

function analyze(r) {
  const issues = [];
  const isIndexable = /^\/($|hotels|destinations|blog|about)/.test(new URL(r.finalUrl || r.url).pathname.replace(BASE, "")) ;
  const path = new URL(r.url).pathname;
  const E = (code, msg) => issues.push({ sev: "ERROR", code, msg, path });
  const W = (code, msg) => issues.push({ sev: "WARN", code, msg, path });
  const N = (code, msg) => issues.push({ sev: "NOTICE", code, msg, path });

  if (r.status === 0) { E("unreachable", `unreachable: ${r.err}`); return { issues }; }
  if (r.status >= 500) { E("5xx", `HTTP ${r.status} (server error)`); return { issues }; }
  if (r.status >= 400) { E("4xx", `HTTP ${r.status}`); return { issues }; }
  if (r.redirected) W("redirect", `redirects → ${new URL(r.finalUrl).pathname}`);
  if (r.ttfb > 3000) W("slow", `slow TTFB ${r.ttfb}ms`);

  const html = r.html || "";
  if (!html) return { issues, title: null };
  const ms = metas(html);
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
  const desc = metaBy(ms, "name", "description");
  const robots = (metaBy(ms, "name", "robots") || "").toLowerCase();
  const canon = (html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]) ? attrs(html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)[0]).href : null;
  const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
  const og = metaBy(ms, "property", "og:title");
  const jsonlds = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const links = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].map((m) => abs(m[1])).filter(Boolean);
  const imgs = [...html.matchAll(/<img\s+[^>]*src=["']([^"']+)["']/gi)].map((m) => abs(m[1])).filter(Boolean);

  // Title / description
  if (!title) E("title-missing", "no <title>");
  else if (title.length > 65) W("title-long", `title ${title.length} chars`);
  if (!desc) W("desc-missing", "no meta description");
  else if (desc.length > 160) W("desc-long", `description ${desc.length} chars`);
  else if (desc.length < 70) N("desc-short", `description ${desc.length} chars`);
  // H1
  if (h1s === 0) W("h1-missing", "no <h1>");
  else if (h1s > 1) W("h1-multi", `${h1s} <h1> tags`);
  // Canonical
  if (isIndexable && !canon) W("canon-missing", "no canonical");
  // noindex leak on a money page
  if (isIndexable && /noindex/.test(robots)) E("noindex-leak", "indexable page is noindex");
  // OG
  if (isIndexable && !og) N("og-missing", "no og:title");
  // JSON-LD validity
  for (const j of jsonlds) { try { JSON.parse(j); } catch { E("jsonld-invalid", "invalid JSON-LD block"); } }

  return { issues, title, desc, canon, robots, links, imgs };
}

// ── seeds (read local files, crawl live) ────────────────────────────────────
function seeds() {
  const geo = JSON.parse(readFileSync("content/geo-index.json", "utf8"));
  const allCities = [];
  const states = [];
  for (const [code, s] of Object.entries(geo.states)) {
    states.push(code);
    for (const c of s.cities) allCities.push({ slug: c.slug, count: c.count });
  }
  const stateSlugs = [...new Set(Object.keys(geo.states))]; // codes; slug map below
  const stateLinks = [];
  // derive /destinations/<slug> by reading the hotels index later isn't needed — crawl them via /hotels.
  const sorted = [...allCities].sort((a, b) => b.count - a.count);
  const big = sorted.slice(0, Math.floor(N_CITIES * 0.5));
  const thin = allCities.filter((c) => c.count <= 2).slice(0, Math.floor(N_CITIES * 0.3));
  const known = ["st-augustine", "coeur-dalene", "astoria-oregon", "land-o-lakes", "bala-cynwyd", "crawfordville", "charleston", "savannah", "scottsdale", "honolulu"]
    .map((slug) => ({ slug, count: 0 }));
  const cityPick = [...new Map([...big, ...thin, ...known].map((c) => [c.slug, c])).values()].slice(0, N_CITIES);

  const blogSlugs = [...readFileSync("src/lib/posts.ts", "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

  const core = ["/", "/hotels", "/blog", "/about", "/privacy", "/terms", "/disclosure", "/search?destination=Oahu&adults=2"];
  return {
    core,
    cities: cityPick.map((c) => `/hotels/${c.slug}`),
    blog: ["/blog", ...blogSlugs.map((s) => `/blog/${s}`)],
    stateCodes: stateSlugs,
  };
}

// ── run ─────────────────────────────────────────────────────────────────────
console.log(`${C.b}${C.cyan}● Site health scan${C.x} — ${BASE}  ${C.dim}(${new Date().toISOString()})${C.x}\n`);
const S = seeds();

// Phase A: crawl core + city hubs + blog. State hubs are discovered from the city-hub breadcrumbs/links.
const phaseA = [...new Set([...S.core, ...S.cities, ...S.blog])].map((p) => BASE + p);
console.log(`${C.dim}Phase A — crawling ${phaseA.length} pages (core, ${S.cities.length} city hubs, blog)…${C.x}`);
const recsA = await pool(phaseA, CONCURRENCY, (u) => fetchPage(u));

const allLinks = new Set();
const allImgs = new Set();
const pages = [];
for (const r of recsA) {
  const a = analyze(r);
  pages.push({ ...r, ...a });
  (a.links || []).forEach((l) => allLinks.add(l));
  (a.imgs || []).forEach((l) => allImgs.add(l));
}

// Phase B: sample property + state-hub + destination links discovered in Phase A.
const discovered = [...allLinks];
const propLinks = discovered.filter((l) => /\/hotels\/[^/]+\/[^/]+/.test(new URL(l).pathname));
const stateLinks = discovered.filter((l) => /\/destinations\//.test(new URL(l).pathname));
const propSample = propLinks.sort(() => Math.random() - 0.5).slice(0, N_PROPERTIES);
const phaseB = [...new Set([...propSample, ...stateLinks])];
console.log(`${C.dim}Phase B — crawling ${phaseB.length} pages (${propSample.length} properties, ${stateLinks.length} state hubs)…${C.x}`);
const recsB = await pool(phaseB, CONCURRENCY, (u) => fetchPage(u));
for (const r of recsB) {
  const a = analyze(r);
  pages.push({ ...r, ...a });
  (a.imgs || []).forEach((l) => allImgs.add(l));
}

// Phase C: broken-link check on the navigational graph (hubs/states/blog/core — not the huge property tail).
const navLinks = [...allLinks].filter((l) => !/\/hotels\/[^/]+\/[^/]+/.test(new URL(l).pathname));
const linkCheck = navLinks.slice(0, MAX_LINKCHECK);
console.log(`${C.dim}Phase C — checking ${linkCheck.length} unique internal nav links…${C.x}`);
const linkRes = await pool(linkCheck, CONCURRENCY, (u) => fetchPage(u, "HEAD"));
const brokenLinks = linkRes.filter((r) => r && (r.status === 0 || r.status >= 400));

// Phase D: image health (sample).
const imgCheck = [...allImgs].sort(() => Math.random() - 0.5).slice(0, MAX_IMAGES);
console.log(`${C.dim}Phase D — checking ${imgCheck.length} images…${C.x}`);
// GET, not HEAD: Next's /_next/image optimizer 400s on HEAD. Body isn't read (non-html), so it's status-only.
const imgRes = await pool(imgCheck, CONCURRENCY, (u) => fetchPage(u, "GET"));
const brokenImgs = imgRes.filter((r) => r && (r.status === 0 || r.status >= 400));

// Phase E: sitemap integrity.
console.log(`${C.dim}Phase E — sitemap integrity…${C.x}`);
const smIndex = await fetchPage(`${BASE}/sitemap-v3.xml`);
const sitemapIssues = [];
if (smIndex.status >= 400 || smIndex.status === 0) sitemapIssues.push(`sitemap index /sitemap-v3.xml → ${smIndex.status || smIndex.err}`);
else {
  const children = [...(smIndex.html || "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const childRes = await pool(children, CONCURRENCY, (u) => fetchPage(u));
  for (const c of childRes) if (c.status >= 400 || c.status === 0) sitemapIssues.push(`child ${c.url} → ${c.status || c.err}`);
  // sample some URLs from the first child for 200
  const firstWithUrls = childRes.find((c) => /<loc>/.test(c.html || ""));
  if (firstWithUrls) {
    const sample = [...firstWithUrls.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort(() => Math.random() - 0.5).slice(0, 20);
    const sres = await pool(sample, CONCURRENCY, (u) => fetchPage(u, "HEAD"));
    const bad = sres.filter((r) => r.status >= 400 || r.status === 0);
    for (const b of bad) sitemapIssues.push(`sitemap URL ${b.url} → ${b.status || b.err}`);
  }
}

// ── cross-page duplicate analysis ───────────────────────────────────────────
const dupCheck = (key, label, sev) => {
  const map = new Map();
  for (const p of pages) { const v = p[key]; if (!v) continue; (map.get(v) || map.set(v, []).get(v)).push(p.path || new URL(p.url).pathname); }
  const dups = [...map.entries()].filter(([, ps]) => ps.length > 1);
  return dups.map(([v, ps]) => ({ sev, code: `dup-${key}`, msg: `${label} shared by ${ps.length} pages: "${String(v).slice(0, 50)}…"`, path: ps.slice(0, 3).join(", ") }));
};

// ── aggregate + report ──────────────────────────────────────────────────────
const issues = [
  ...pages.flatMap((p) => p.issues || []),
  ...brokenLinks.map((r) => ({ sev: "ERROR", code: "broken-link", msg: `internal link → HTTP ${r.status || r.err}`, path: new URL(r.url).pathname })),
  ...brokenImgs.map((r) => ({ sev: "ERROR", code: "broken-image", msg: `image → HTTP ${r.status || r.err}`, path: new URL(r.url).pathname.slice(0, 60) })),
  ...sitemapIssues.map((m) => ({ sev: "ERROR", code: "sitemap", msg: m, path: "/sitemap-v3.xml" })),
  ...dupCheck("title", "duplicate title", "WARN"),
  ...dupCheck("desc", "duplicate description", "WARN"),
];

const byCode = new Map();
for (const it of issues) {
  const k = `${it.sev}:${it.code}`;
  if (!byCode.has(k)) byCode.set(k, { ...it, count: 0, examples: [] });
  const e = byCode.get(k);
  e.count++;
  if (e.examples.length < 4) e.examples.push(`${it.path} ${C.dim}— ${it.msg}${C.x}`);
}
const order = { ERROR: 0, WARN: 1, NOTICE: 2 };
const groups = [...byCode.values()].sort((a, b) => order[a.sev] - order[b.sev] || b.count - a.count);
const nE = issues.filter((i) => i.sev === "ERROR").length;
const nW = issues.filter((i) => i.sev === "WARN").length;
const nN = issues.filter((i) => i.sev === "NOTICE").length;
const crawled = pages.length;
const score = Math.max(0, 100 - Math.min(60, nE * 4) - Math.min(30, nW * 0.5) - Math.min(10, nN * 0.2));

console.log(`\n${C.b}── Health report ──${C.x}`);
console.log(`Crawled ${crawled} pages · ${linkCheck.length} links · ${imgCheck.length} images`);
console.log(`${C.b}Score: ${score >= 90 ? C.green : score >= 75 ? C.yellow : C.red}${score.toFixed(0)}/100${C.x}   ` +
  `${C.red}${nE} errors${C.x} · ${C.yellow}${nW} warnings${C.x} · ${C.dim}${nN} notices${C.x}\n`);

for (const g of groups) {
  const col = g.sev === "ERROR" ? C.red : g.sev === "WARN" ? C.yellow : C.dim;
  console.log(`${col}${g.sev === "ERROR" ? "✗" : g.sev === "WARN" ? "▲" : "·"} ${g.code}${C.x} ${C.dim}×${g.count}${C.x}`);
  for (const ex of g.examples) console.log(`    ${ex}`);
  if (g.count > g.examples.length) console.log(`    ${C.dim}…and ${g.count - g.examples.length} more${C.x}`);
}
if (!groups.length) console.log(`${C.green}✓ No issues found.${C.x}`);

console.log(`\n${C.dim}Sampled ${S.cities.length} city hubs + ${propSample.length} properties + all state hubs + all blog posts.${C.x}`);
process.exit(nE > 0 ? 1 : 0);
