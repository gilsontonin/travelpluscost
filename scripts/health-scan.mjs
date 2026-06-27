// In-house site health scanner — a free, dependency-light "Semrush Site Audit" we own (Node 20 fetch,
// no credits, no deps). Reports the bug classes a script-heavy build regresses: broken pages/links/
// images, redirects, duplicate/missing/over-length titles & descriptions, canonical drift, multiple/
// missing H1, noindex leaks on money pages, invalid JSON-LD, and sitemap integrity. Exits non-zero on
// any ERROR so it can gate CI.
//
//   npm run health                      # REPRESENTATIVE: fast sample of every page type + link graph + images
//   npm run health -- --rotate          # ROTATION: deep-scan the NEXT sitemap shard (~5k URLs, ~9 min), logged
//   npm run health -- --shard hotels-3  # force a specific shard (doesn't advance the cursor)
//   npm run health -- --base http://localhost:3000
//
// Rotation state + per-shard logs live in scripts/health/ (gitignored). One shard/day cycles the whole
// site in ~16 days; the cursor never re-scans a shard until the cycle completes.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : d;
};
const BASE = arg("base", "https://travelpluscost.com").replace(/\/$/, "");
const CONCURRENCY = Number(arg("concurrency", 5)); // polite: 10 over a full shard trips Netlify bot-protection (false 403s)
const LIMIT = Number(arg("limit", 0)); // cap URLs in a shard scan (test runs)
const N_CITIES = Number(arg("cities", 50));
const N_PROPERTIES = Number(arg("properties", 40));
const MAX_LINKCHECK = Number(arg("links", 500));
const MAX_IMAGES = Number(arg("images", 100));
const ROTATE = process.argv.includes("--rotate");
const FORCE_SHARD = arg("shard", null);
// Browser-ish UA + retry-on-throttle: a bot UA hammering 5k URLs gets 403'd by Netlify's protection,
// which is throttling, not a broken page. Distinguish the two with backoff retries.
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) travelpluscost-health-scan";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  // Skip Cloudflare's injected infrastructure links (e.g. /cdn-cgi/l/email-protection from Email Address
  // Obfuscation). They're not our links and 404 without JS, so they're not a broken page of ours.
  if (href.includes("/cdn-cgi/")) return null;
  if (href.startsWith("http")) return href.startsWith(BASE) ? href : null;
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
const locs = (xml) => [...(xml || "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

async function fetchPage(url, method = "GET", attempt = 0) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method, redirect: "follow", headers: { "user-agent": UA } });
    // 403/429 from a high-rate bot scan = throttling, not a broken page → back off and retry; only a
    // persistent block after retries counts as an error.
    if ((res.status === 403 || res.status === 429) && attempt < 2) {
      await sleep(700 * (attempt + 1) + Math.random() * 500);
      return fetchPage(url, method, attempt + 1);
    }
    const ttfb = Date.now() - t0;
    const ct = res.headers.get("content-type") || "";
    // Read the body for HTML pages AND XML (sitemaps) — but not images/binaries (status only).
    const html = method === "GET" && (ct.includes("text/html") || ct.includes("xml")) ? await res.text() : "";
    return { url, status: res.status, finalUrl: res.url, redirected: res.redirected, ttfb, ct, html };
  } catch (e) {
    if (attempt < 2) { await sleep(700 * (attempt + 1) + Math.random() * 500); return fetchPage(url, method, attempt + 1); }
    return { url, status: 0, err: String(e?.message || e), ttfb: Date.now() - t0 };
  }
}

function analyze(r) {
  const issues = [];
  const path = new URL(r.url).pathname;
  const isIndexable = /^\/($|hotels|destinations|blog|about)/.test(path);
  const E = (code, msg) => issues.push({ sev: "ERROR", code, msg, path });
  const W = (code, msg) => issues.push({ sev: "WARN", code, msg, path });
  const N = (code, msg) => issues.push({ sev: "NOTICE", code, msg, path });

  if (r.status === 0) { E("unreachable", `unreachable: ${r.err}`); return { issues }; }
  if (r.status >= 500) { E("5xx", `HTTP ${r.status} (server error)`); return { issues }; }
  if (r.status >= 400) { E("4xx", `HTTP ${r.status}`); return { issues }; }
  if (r.redirected) W("redirect", `redirects → ${new URL(r.finalUrl).pathname}`);
  if (r.ttfb > 4000) W("slow", `slow TTFB ${r.ttfb}ms`);

  const html = r.html || "";
  if (!html) return { issues };
  const ms = metas(html);
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
  const desc = metaBy(ms, "name", "description");
  const robots = (metaBy(ms, "name", "robots") || "").toLowerCase();
  const canonTag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0];
  const canon = canonTag ? attrs(canonTag).href : null;
  const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
  const og = metaBy(ms, "property", "og:title");
  const jsonlds = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const links = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].map((m) => abs(m[1])).filter(Boolean);
  const imgs = [...html.matchAll(/<img\s+[^>]*src=["']([^"']+)["']/gi)].map((m) => abs(m[1])).filter(Boolean);

  if (!title) E("title-missing", "no <title>");
  else if (title.length > 65) W("title-long", `title ${title.length} chars`);
  if (!desc) W("desc-missing", "no meta description");
  else if (desc.length > 160) W("desc-long", `description ${desc.length} chars`);
  else if (desc.length < 70) N("desc-short", `description ${desc.length} chars`);
  if (h1s === 0) W("h1-missing", "no <h1>");
  else if (h1s > 1) W("h1-multi", `${h1s} <h1> tags`);
  if (isIndexable && !canon) W("canon-missing", "no canonical");
  if (isIndexable && /noindex/.test(robots)) E("noindex-leak", "indexable page is noindex");
  if (isIndexable && !og) N("og-missing", "no og:title");
  for (const j of jsonlds) { try { JSON.parse(j); } catch { E("jsonld-invalid", "invalid JSON-LD block"); } }

  return { issues, title, desc, canon, robots, links, imgs };
}

// Dup-title / dup-description across a set of analyzed pages.
function dupIssues(pages, key, label) {
  const map = new Map();
  for (const p of pages) { const v = p[key]; if (!v) continue; if (!map.has(v)) map.set(v, []); map.get(v).push(p.path || new URL(p.url).pathname); }
  return [...map.entries()].filter(([, ps]) => ps.length > 1)
    .map(([v, ps]) => ({ sev: "WARN", code: `dup-${key}`, msg: `${label} on ${ps.length} pages: "${String(v).slice(0, 48)}…"`, path: ps.slice(0, 3).join(", ") }));
}

// Group, score and print an issue list. Returns the error count.
function report(issues, statLine) {
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
  const score = Math.max(0, 100 - Math.min(60, nE * 4) - Math.min(30, nW * 0.5) - Math.min(10, nN * 0.2));
  console.log(`\n${C.b}── Health report ──${C.x}`);
  console.log(statLine);
  console.log(`${C.b}Score: ${score >= 90 ? C.green : score >= 75 ? C.yellow : C.red}${score.toFixed(0)}/100${C.x}   ${C.red}${nE} errors${C.x} · ${C.yellow}${nW} warnings${C.x} · ${C.dim}${nN} notices${C.x}\n`);
  for (const g of groups) {
    const col = g.sev === "ERROR" ? C.red : g.sev === "WARN" ? C.yellow : C.dim;
    console.log(`${col}${g.sev === "ERROR" ? "✗" : g.sev === "WARN" ? "▲" : "·"} ${g.code}${C.x} ${C.dim}×${g.count}${C.x}`);
    for (const ex of g.examples) console.log(`    ${ex}`);
    if (g.count > g.examples.length) console.log(`    ${C.dim}…and ${g.count - g.examples.length} more${C.x}`);
  }
  if (!groups.length) console.log(`${C.green}✓ No issues found.${C.x}`);
  return { nE, nW, nN, score };
}

console.log(`${C.b}${C.cyan}● Site health scan${C.x} — ${BASE}  ${C.dim}(${new Date().toISOString()})${C.x}`);

// ── ROTATION MODE: deep-scan one sitemap shard, log it, advance the cursor ───
if (ROTATE || FORCE_SHARD) {
  const dir = "scripts/health";
  const logDir = `${dir}/logs`;
  const stateFile = `${dir}/state.json`;
  mkdirSync(logDir, { recursive: true });
  const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : { cycle: 1, done: [], history: [] };

  const idx = await fetchPage(`${BASE}/sitemap-v3.xml`);
  const children = locs(idx.html).filter((u) => /\.xml$/.test(u));
  if (!children.length) { console.error(`${C.red}✗ Could not read sitemap index ${BASE}/sitemap-v3.xml${C.x}`); process.exit(1); }
  const nameOf = (u) => u.split("/").pop();

  let target = FORCE_SHARD ? children.find((c) => nameOf(c).startsWith(FORCE_SHARD)) : children.find((c) => !state.done.includes(nameOf(c)));
  if (!target && !FORCE_SHARD) { state.cycle++; state.done = []; target = children[0]; console.log(`${C.green}✓ Cycle complete — starting cycle ${state.cycle}.${C.x}`); }
  if (!target) { console.error(`${C.red}✗ No shard matches "${FORCE_SHARD}".${C.x}`); process.exit(1); }
  const shardName = nameOf(target);

  console.log(`${C.dim}Rotation · cycle ${state.cycle} · shard ${C.x}${C.b}${shardName}${C.x}${C.dim} · ${state.done.length}/${children.length} shards already done this cycle${C.x}\n`);
  const shard = await fetchPage(target);
  const urls = LIMIT ? locs(shard.html).slice(0, LIMIT) : locs(shard.html);
  console.log(`${C.dim}Scanning ${urls.length} URLs @ concurrency ${CONCURRENCY}…${C.x}`);
  const t0 = Date.now();
  // Stream: fetch → analyze → keep only the small result, drop the HTML body so it's GC'd. Holding all
  // ~5k full pages in memory OOMs the heap; the lean record is a few fields per page.
  const pages = await pool(urls, CONCURRENCY, async (u) => {
    const r = await fetchPage(u);
    const a = analyze(r);
    return { path: new URL(r.url).pathname, status: r.status, title: a.title ?? null, desc: a.desc ?? null, canon: a.canon ?? null, issues: a.issues };
  });
  const issues = [...pages.flatMap((p) => p.issues || []), ...dupIssues(pages, "title", "duplicate title"), ...dupIssues(pages, "desc", "duplicate description")];
  const { nE, nW } = report(issues, `Shard ${shardName}: ${urls.length} URLs in ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);

  // Log the findings (so we track what to fix) + advance the cursor (so we don't re-scan until the cycle ends).
  const date = new Date().toISOString().slice(0, 10);
  writeFileSync(`${logDir}/${date}-${shardName}.json`, JSON.stringify({ date, shard: shardName, cycle: state.cycle, urls: urls.length, errors: nE, warnings: nW, issues: issues.slice(0, 1000) }, null, 2));
  if (!FORCE_SHARD) state.done.push(shardName);
  state.lastRun = new Date().toISOString();
  state.history = [...(state.history || []), { date, shard: shardName, cycle: state.cycle, errors: nE, warnings: nW }].slice(-90);
  writeFileSync(stateFile, JSON.stringify(state, null, 2));

  const remain = children.length - state.done.length;
  console.log(`\n${C.dim}Logged → ${logDir}/${date}-${shardName}.json${C.x}`);
  console.log(`${C.cyan}Cycle ${state.cycle}: ${state.done.length}/${children.length} shards done · ${remain} remain${remain === 0 ? " (next run starts a fresh cycle)" : ""}.${C.x}`);
  process.exit(nE > 0 ? 1 : 0);
}

// ── REPRESENTATIVE MODE (default): every page TYPE + the link graph + images ─
function seeds() {
  const geo = JSON.parse(readFileSync("content/geo-index.json", "utf8"));
  const allCities = [];
  for (const s of Object.values(geo.states)) for (const c of s.cities) allCities.push({ slug: c.slug, count: c.count });
  const sorted = [...allCities].sort((a, b) => b.count - a.count);
  const big = sorted.slice(0, Math.floor(N_CITIES * 0.5));
  const thin = allCities.filter((c) => c.count <= 2).slice(0, Math.floor(N_CITIES * 0.3));
  const known = ["st-augustine", "coeur-dalene", "astoria-oregon", "land-o-lakes", "bala-cynwyd", "charleston", "savannah", "scottsdale", "honolulu"].map((slug) => ({ slug, count: 0 }));
  const cityPick = [...new Map([...big, ...thin, ...known].map((c) => [c.slug, c])).values()].slice(0, N_CITIES);
  const blogSlugs = [...readFileSync("src/lib/posts.ts", "utf8").matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  return {
    core: ["/", "/hotels", "/blog", "/about", "/privacy", "/terms", "/disclosure", "/search?destination=Oahu&adults=2"],
    cities: cityPick.map((c) => `/hotels/${c.slug}`),
    blog: ["/blog", ...blogSlugs.map((s) => `/blog/${s}`)],
  };
}

const S = seeds();
const phaseA = [...new Set([...S.core, ...S.cities, ...S.blog])].map((p) => BASE + p);
console.log(`\n${C.dim}Phase A — ${phaseA.length} pages (core, ${S.cities.length} city hubs, blog)…${C.x}`);
const recsA = await pool(phaseA, CONCURRENCY, (u) => fetchPage(u));
const allLinks = new Set(), allImgs = new Set(), pages = [];
for (const r of recsA) { const a = analyze(r); pages.push({ ...r, ...a }); (a.links || []).forEach((l) => allLinks.add(l)); (a.imgs || []).forEach((l) => allImgs.add(l)); }

const discovered = [...allLinks];
const propLinks = discovered.filter((l) => /\/hotels\/[^/]+\/[^/]+/.test(new URL(l).pathname));
const stateLinks = discovered.filter((l) => /\/destinations\//.test(new URL(l).pathname));
const propSample = propLinks.sort(() => Math.random() - 0.5).slice(0, N_PROPERTIES);
const phaseB = [...new Set([...propSample, ...stateLinks])];
console.log(`${C.dim}Phase B — ${phaseB.length} pages (${propSample.length} properties, ${stateLinks.length} state hubs)…${C.x}`);
const recsB = await pool(phaseB, CONCURRENCY, (u) => fetchPage(u));
for (const r of recsB) { const a = analyze(r); pages.push({ ...r, ...a }); (a.imgs || []).forEach((l) => allImgs.add(l)); }

const navLinks = [...allLinks].filter((l) => !/\/hotels\/[^/]+\/[^/]+/.test(new URL(l).pathname)).slice(0, MAX_LINKCHECK);
console.log(`${C.dim}Phase C — ${navLinks.length} internal nav links…${C.x}`);
const linkRes = await pool(navLinks, CONCURRENCY, (u) => fetchPage(u, "HEAD"));
const brokenLinks = linkRes.filter((r) => r && (r.status === 0 || r.status >= 400));

const imgCheck = [...allImgs].sort(() => Math.random() - 0.5).slice(0, MAX_IMAGES);
console.log(`${C.dim}Phase D — ${imgCheck.length} images…${C.x}`);
const imgRes = await pool(imgCheck, CONCURRENCY, (u) => fetchPage(u, "GET"));
const brokenImgs = imgRes.filter((r) => r && (r.status === 0 || r.status >= 400));

console.log(`${C.dim}Phase E — sitemap integrity…${C.x}`);
const sitemapIssues = [];
const smIndex = await fetchPage(`${BASE}/sitemap-v3.xml`);
if (smIndex.status >= 400 || smIndex.status === 0) sitemapIssues.push(`sitemap index → ${smIndex.status || smIndex.err}`);
else {
  const childRes = await pool(locs(smIndex.html), CONCURRENCY, (u) => fetchPage(u));
  for (const c of childRes) if (c.status >= 400 || c.status === 0) sitemapIssues.push(`child ${c.url} → ${c.status || c.err}`);
  const firstWithUrls = childRes.find((c) => /<loc>/.test(c.html || ""));
  if (firstWithUrls) {
    const sample = locs(firstWithUrls.html).sort(() => Math.random() - 0.5).slice(0, 20);
    const sres = await pool(sample, CONCURRENCY, (u) => fetchPage(u, "HEAD"));
    for (const b of sres.filter((r) => r.status >= 400 || r.status === 0)) sitemapIssues.push(`sitemap URL ${b.url} → ${b.status || b.err}`);
  }
}

const issues = [
  ...pages.flatMap((p) => p.issues || []),
  ...brokenLinks.map((r) => ({ sev: "ERROR", code: "broken-link", msg: `internal link → HTTP ${r.status || r.err}`, path: new URL(r.url).pathname })),
  ...brokenImgs.map((r) => ({ sev: "ERROR", code: "broken-image", msg: `image → HTTP ${r.status || r.err}`, path: new URL(r.url).pathname.slice(0, 60) })),
  ...sitemapIssues.map((m) => ({ sev: "ERROR", code: "sitemap", msg: m, path: "/sitemap-v3.xml" })),
  ...dupIssues(pages, "title", "duplicate title"),
  ...dupIssues(pages, "desc", "duplicate description"),
];
const { nE } = report(issues, `Crawled ${pages.length} pages · ${navLinks.length} links · ${imgCheck.length} images`);
console.log(`\n${C.dim}Sampled ${S.cities.length} city hubs + ${propSample.length} properties + all state hubs + all blog posts.${C.x}`);
process.exit(nE > 0 ? 1 : 0);
