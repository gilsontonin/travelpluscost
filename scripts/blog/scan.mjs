#!/usr/bin/env node
// blog:scan — STEP 1 of the blog workflow: "scan the top 3" (reverse-engineered from Jono's system).
//
// The SERP already has the answer. Before writing a word, pull the genuine top rankers and let them set
// the shape: the competitor cards (#1/#2/#3 · words · H2s · images · FAQs), an averaged TARGET SPEC, and
// the 9-point scan. Items 1-8 match the shape that already wins; item 9 (the gaps) is where you beat them.
//
// This is the fast STRUCTURAL pass. Pair it with `npm run blog:serp` (the deep term/entity/PAA/gap brief)
// — together they are the whole "scan the top 3". Counting mirrors serp-optimize.mjs clean() for parity.
//
// Usage:
//   npm run blog:scan -- "<keyword>" --urls "u1,u2,u3[,u4,u5]"
//   (pass TODAY's genuine top blog competitors — no Reddit/Wikipedia/YouTube/news/OTA-listing pages)

const argv = process.argv.slice(2);
const get = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
};
const keyword = argv.filter((a) => !a.startsWith("--") && argv[argv.indexOf(a) - 1] !== "--urls").join(" ").trim();
const urls = (get("--urls") || "").split(",").map((s) => s.trim()).filter(Boolean);

if (!keyword || !urls.length) {
  console.error('Usage: npm run blog:scan -- "<keyword>" --urls "u1,u2,u3"');
  console.error("Pass TODAY's genuine top blog rankers (skip Reddit/Wikipedia/YouTube/news/OTA listings).");
  process.exit(1);
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

// Mirror of serp-optimize.mjs clean(): strip chrome, then count words / H2-H3 subtopics / images / FAQs.
function clean(html) {
  const h = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<form[\s\S]*?<\/form>/gi, " ");
  const outline = [...h.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => ({ lvl: +m[1], text: m[2].replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim() }))
    .filter((o) => o.text && o.text.length < 130);
  const text = h.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const h2 = outline.filter((o) => o.lvl === 2 || o.lvl === 3).length; // subtopics the winners cover
  const imgCount = (h.match(/<img\b/gi) || []).length;
  const faqCount = outline.filter((o) => /\?\s*$/.test(o.text) || /\bfaq|frequently asked\b/i.test(o.text)).length;
  return { words, h2, imgCount, faqCount, headings: outline.map((o) => o.text) };
}

async function scan(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, redirect: "follow" });
    if (!res.ok) return { url, ok: false, reason: `HTTP ${res.status}` };
    return { url, ok: true, ...clean(await res.text()) };
  } catch (e) {
    return { url, ok: false, reason: String(e.message || e) };
  }
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const pad = (s, n) => String(s).padEnd(n);

const formatGuess = (kw, h1) => {
  if (/\bvs\b|versus|compare/i.test(kw)) return "comparison";
  if (/^(best|top)\b/i.test(kw) || /\b\d+\b/.test(kw) || /\b\d+\b/.test(h1 || "")) return "listicle";
  return "guide";
};

(async () => {
  console.error(`\nSTEP 1 · SCAN THE TOP 3 — "${keyword}"\nFetching ${urls.length} pages…`);
  const docs = [];
  for (const u of urls) {
    const d = await scan(u);
    docs.push(d);
    console.error(d.ok ? `  ✓ ${host(u)} (${d.words}w · ${d.h2} H2/H3 · ${d.imgCount} img · ${d.faqCount} FAQ)` : `  ✗ ${host(u)} — ${d.reason}`);
  }
  const okDocs = docs.filter((d) => d.ok);
  if (!okDocs.length) { console.error("\nNo pages fetched. Try different URLs (some sites block bots)."); process.exit(1); }

  // Top 3 by SERP position (the order you passed). A page < 40% of the median length is a thin outlier → ignored.
  const medW = median(okDocs.map((d) => d.words));
  const ranked = okDocs.map((d, i) => ({ ...d, rank: i + 1, thin: d.words < medW * 0.4 }));
  const top3 = ranked.filter((d) => !d.thin).slice(0, 3);
  const spec = {
    words: median(top3.map((d) => d.words)),
    h2: median(top3.map((d) => d.h2)),
    img: median(top3.map((d) => d.imgCount)),
    faq: median(top3.map((d) => d.faqCount)),
  };
  const band = [Math.min(...top3.map((d) => d.words)), Math.max(...top3.map((d) => d.words))];
  const fmt = formatGuess(keyword, top3[0]?.headings?.[0]);

  const L = [];
  L.push(`\n📊 THE SERP ALREADY HAS THE ANSWER\n`);
  ranked.forEach((d) => {
    const tag = d.thin ? "  · thin → ignored" : "";
    L.push(`  #${d.rank} · ${pad(host(d.url), 24)} ${pad(d.words + "w", 7)} · ${d.h2} H2/H3 · ${d.imgCount} img · ${d.faqCount} FAQ${tag}`);
  });
  L.push(`\n        ↓ averaged from the top 3`);
  L.push(`  ┌────────────── TARGET SPEC ──────────────┐`);
  L.push(`  │  ~${spec.words} words   (band ${band[0]}–${band[1]})`);
  L.push(`  │  H2/H3 × ${spec.h2}`);
  L.push(`  │  images × ${spec.img}   → native infographics (LCP)`);
  L.push(`  │  FAQs × ${spec.faq}`);
  L.push(`  └─────────────────────────────────────────┘`);

  L.push(`\n✅ THE FULL SCAN — 9 things it pulls`);
  L.push(`  1. Intent + winning format ............ ${fmt}`);
  L.push(`  2. SERP features triggered ............ → check live SERP (snippet · video · PAA · local pack)`);
  L.push(`  3. Length range (~20% of top 3) ....... ${band[0]}–${band[1]} words (target ~${spec.words})`);
  L.push(`  4. H2/H3 outline ...................... ~${spec.h2} subtopics — see blog:serp competitor headings`);
  L.push(`  5. Terms + entities ................... → npm run blog:serp (the words all 3 share)`);
  L.push(`  6. Questions answered ................. → blog:serp PAA/questions section → FAQ`);
  L.push(`  7. Media (images · tables) ........... images × ${spec.img} (we use infographics)`);
  L.push(`  8. Title + meta patterns ............. ${fmt === "listicle" ? `"{N} ${titleCase(keyword)} (2026)"` : `"${titleCase(keyword)} (2026)"`}`);
  L.push(`  ★ 9. THE GAPS — what's thin or missing  → beat, don't just match:`);
  L.push(`       • the booking path none of them have (our hotel cards + a real offer)`);
  L.push(`       • PAA they answer poorly → own the snippet`);
  L.push(`       • cross-link the rest of the cluster`);
  L.push(`       • freshness/honesty (stale/closed picks, fake scarcity)`);
  L.push(`\n  Items 1-8 match the shape that already wins. Item 9 is where you beat them.`);
  L.push(`\n→ NEXT: npm run blog:serp -- "${keyword}" --draft <slug> --urls "${urls.join(",")}"  (deep term/PAA/gap brief, must hit ≥90)\n`);

  console.log(L.join("\n"));
})();

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
