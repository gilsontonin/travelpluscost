// De-hyphenate compound words in blog-post BODY prose (owner voice: spell-checker
// hyphens read as AI). DEFAULT = despace every letter-letter hyphenated word;
// KEEP a small denylist (proper nouns + genuinely-broken-when-split); JOIN a few
// prefix compounds (close up instead of space); MANUAL ones are left for hand-fix.
// Also helps the SEO scorer (its tokenizer keeps hyphens: "lava-tube" ≠ lava/tube).
//
//   node scripts/dehyphenate.mjs --scan          # report EVERY body word + planned action
//   node scripts/dehyphenate.mjs <slug>          # one post, dry-run
//   node scripts/dehyphenate.mjs <slug> --apply  # one post, write
//   node scripts/dehyphenate.mjs --all --apply   # every post, write (BODY only)
//
// SAFE: only the body: field is touched (never icon/slug/meta). The match guard
// excludes any candidate bordered by a word char, "/", "-", or "'", so slugs,
// URLs, image params, ToC anchors, and contractions can't be hit.

import fs from "fs";
const FILE = "src/lib/posts.ts";

// leave hyphen as-is (proper nouns + reads-wrong-when-split + conventional):
const KEEP = new Set(`byodo-in kailua-kona drive-in drive-ins
check-in check-out checked-in add-on add-ons drop-off drop-offs pick-up pick-ups
break-in break-ins build-up cover-up mix-up tune-up u-turn one-on-one face-to-face
t-shirt t-shirts x-ray x-rays wi-fi e-bike e-bikes co-op cul-de-sac so-called
non-negotiable non-negotiables run-down stand-in walk-in walk-ins by-the-glass
hawai-i look-don t-swim t-touch t-shirts ritz-carlton two-step indo-pacific
g-c-e-a d-g-b-e bar-b-q bar-b-que non-hawaiian a-bay hele-on byu-hawaii
star-advertiser star-bulletin how-to mom-and-pop build-your-own adults-only all-inclusive
one-bedroom two-bedroom three-bedroom four-bedroom family-friendly kid-friendly`.split(/\s+/));

// close up (remove hyphen, no space) — prefix compounds:
const JOIN = new Set(`multi-generational multi-day multi-night multi-mile multi-stop
mid-morning mid-afternoon mid-day mid-range mid-week mid-size mid-island
inter-island non-resident non-residents non-swimmer non-swimmers non-stop non-locals
pre-dawn pre-trip pre-paid post-trip post-fire re-entry re-enactment re-enactments
re-enter re-open re-opened semi-private co-ed`.split(/\s+/));

// left untouched + reported for hand-rephrase (despacing reads weird):
const MANUAL = new Set(`location-wise weather-wise budget-wise time-wise size-wise
near-free michelin-ambitious`.split(/\s+/));

// guardL also excludes "#" so ToC / in-body anchor fragments (](#a-slugified-heading))
// are never despaced — the renderer's heading ids are hyphen-joined, so a spaced href
// would no longer match. (Regression fixed 2026-06-13: a prior run broke 1,480 anchors.)
const guardL = "(?<![A-Za-z0-9/_'’#-])";
const guardR = "(?![A-Za-z0-9'’-])";
const RE = new RegExp(`${guardL}([A-Za-z]+(?:-[A-Za-z]+)+)${guardR}`, "g");

const src0 = fs.readFileSync(FILE, "utf8");
function postRegions(src) {
  const out = []; const re = /\n {2,}slug: "([^"]+)"/g; let m, starts = [];
  while ((m = re.exec(src))) starts.push([m.index, m[1]]);
  for (let k = 0; k < starts.length; k++)
    out.push({ slug: starts[k][1], i: starts[k][0], j: k + 1 < starts.length ? starts[k + 1][0] : src.length });
  return out;
}
function bodyRange(region) {
  const s = region.indexOf("body: `"); if (s < 0) return null;
  const start = s + 7, end = region.lastIndexOf("`");
  return end > start ? [start, end] : null;
}
function action(word) {
  const k = word.toLowerCase();
  if (KEEP.has(k) || MANUAL.has(k)) return "keep";
  const segs = word.split("-");
  // any ALL-CAPS segment (≥2) = acronym / notation / phonetic syllable → keep
  if (segs.some((s) => s.length >= 2 && /[A-Z]/.test(s) && s === s.toUpperCase())) return "keep";
  // two-part Title-Case pair = proper noun (Kailua-Kona, Ritz-Carlton, Dec-Apr) → keep
  if (segs.length === 2 && segs.every((s) => /^[A-Z][a-z]+$/.test(s))) return "keep";
  if (JOIN.has(k)) return "join";
  return "space";
}
function transform(body, hits, manualHits) {
  // protect link targets / urls / directives so the guard can't be fooled
  return body.replace(RE, (m, w, off, str) => {
    // never touch a directive line (::infographic <key> / ::tour / ::directions) — the
    // key is machine-read and hyphen-joined; despacing it breaks the render. Some legacy
    // bodies INDENT the directive, so skip leading whitespace before the :: test. (2026-06-13)
    let p = str.lastIndexOf("\n", off) + 1;
    while (str[p] === " " || str[p] === "\t") p++;
    if (str.startsWith("::", p)) return m;
    // also catch a key that follows ::infographic mid-line (one legacy body escapes \n) :
    if (str.slice(Math.max(0, off - 14), off) === "::infographic ") return m;
    // skip if inside a markdown link URL (preceded by "](" up to here) — cheap check
    const a = action(w);
    if (a === "keep") { if (MANUAL.has(w.toLowerCase()) && manualHits) manualHits[w.toLowerCase()] = (manualHits[w.toLowerCase()] || 0) + 1; return m; }
    if (hits) hits[w.toLowerCase()] = (hits[w.toLowerCase()] || 0) + 1;
    return a === "join" ? w.replace(/-/g, "") : w.replace(/-/g, " ");
  });
}

const arg = process.argv[2];
const apply = process.argv.includes("--apply");

if (arg === "--scan") {
  const act = { space: {}, join: {}, keep: {}, manual: {} };
  for (const r of postRegions(src0)) {
    const region = src0.slice(r.i, r.j); const br = bodyRange(region); if (!br) continue;
    let b = region.slice(br[0], br[1]).replace(/\]\([^)]*\)/g, " ").replace(/https?:\/\/\S+/g, " ").replace(/::\w+[^\n]*/g, " ");
    for (const m of b.match(RE) || []) {
      const k = m.toLowerCase(); const a = MANUAL.has(k) ? "manual" : action(m);
      act[a][k] = (act[a][k] || 0) + 1;
    }
  }
  const show = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([w, c]) => `${w}×${c}`);
  const sp = show(act.space);
  console.log(`SPACE (despace → "x y"): ${Object.values(act.space).reduce((a, b) => a + b, 0)} occ, ${sp.length} words`);
  console.log(sp.join("  "));
  console.log(`\nJOIN (close up → "xy"): ${show(act.join).join("  ") || "none"}`);
  console.log(`\nKEEP (left hyphenated): ${show(act.keep).join("  ") || "none"}`);
  console.log(`\nMANUAL (hand-rephrase): ${show(act.manual).join("  ") || "none"}`);
  process.exit(0);
}

const targets = arg === "--all" ? postRegions(src0).map((r) => r.slug) : [arg];
let src = src0, total = 0;
for (const slug of targets) {
  const r = postRegions(src).find((x) => x.slug === slug);
  if (!r) { console.error(`slug not found: ${slug}`); continue; }
  const region = src.slice(r.i, r.j); const br = bodyRange(region);
  if (!br) { console.error(`no body: ${slug}`); continue; }
  const body = region.slice(br[0], br[1]); const hits = {}, manualHits = {};
  const nb = transform(body, hits, manualHits);
  const n = Object.values(hits).reduce((a, b) => a + b, 0);
  total += n;
  const man = Object.keys(manualHits);
  if (n || man.length) console.log(`${apply ? "apply" : "dry"}  ${slug.padEnd(40)} ${String(n).padStart(3)} occ${man.length ? "   MANUAL: " + man.join(",") : ""}`);
  if (apply && nb !== body) src = src.slice(0, r.i) + region.slice(0, br[0]) + nb + region.slice(br[1]) + src.slice(r.j);
}
if (apply) { fs.writeFileSync(FILE, src); console.log(`\nwrote ${FILE} — ${total} occ`); }
else console.log(`\n${total} occ would change (dry-run)`);
