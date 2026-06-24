#!/usr/bin/env node
// Draft-time length gate for the write-blog-post workflow.
//
// Prints total word count + a per-H2 breakdown for a post body in content/blog.ts,
// and checks it against a SERP-derived BAND (target..ceiling), not a one-sided floor.
//
// THE BAND (auto-loaded from scripts/serp-brief-<slug>.md, written by serp-optimize):
//   TARGET  = the brief's "Suggested target" (median competitor ×1.15).
//   CEILING = max(TARGET×1.3, longest-genuine-competitor×1.1). You may match the #1
//             competitor's COVERAGE, but going past it is padding (TheBible: "never
//             longer than you need to match #1"). Over the ceiling → MERGE/CUT, not deepen.
//
// This replaced a one-directional bug: the tool used to default TARGET=1500 (the brief's
// real number never reached it) and only ever flagged sections as TOO SHORT — so a post
// 2-3x over target read "✅ Length looks good" while "deepen the thin sections" pushed it
// even longer. Now it flags BOTH ends and, once at/over target, tells you to cut, not fatten.
//
// Usage:
//   node scripts/post-stats.mjs                 # newest post — auto-loads its brief
//   node scripts/post-stats.mjs <slug>          # auto-loads serp-brief-<slug>.md
//   node scripts/post-stats.mjs <slug> --target 3200   # manual override (ceiling = ×1.3)
//
// LENGTH IS SERP-DRIVEN, NOT A FIXED FLOOR. Word count is not a ranking factor — coverage
// is. A thin keyword whose top results are 1,200 words should be ~1,200; padding past the
// longest genuine competitor is an AI-tell. With no brief and no --target, it falls back to
// a 1500 floor with NO ceiling guard (legacy behaviour) — pass --target to restore the band.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = join(ROOT, "src", "lib", "posts.ts");
const SCRIPTS = join(ROOT, "scripts", "blog");

const args = process.argv.slice(2);
const tIdx = args.indexOf("--target");
const SECTION_FLOOR = 250;
const slugArg = args.find((a, i) => !a.startsWith("--") && i !== (tIdx >= 0 ? tIdx + 1 : -1));

// Pull the SERP-derived length target + the longest GENUINE competitor from the
// serp-optimize brief, so the REAL top-3 number reaches this gate. The recurring
// overshoot bug was that the brief's target never got here: this tool measured
// against a meaningless 1500 fallback, so every 2x-over-target post read "✅" and
// the only active advice ("deepen thin sections") pushed the post even longer.
function loadBrief(slug, allowNewest) {
  let file = join(SCRIPTS, `serp-brief-${slug}.md`);
  try { statSync(file); } catch {
    // The brief is keyed by the KEYWORD slug, not always the post slug. When we're on
    // the newest post (the draft-time case), fall back to the most recently written
    // brief (the workflow runs serp-optimize then post-stats on the same post). Never
    // guess for an explicitly-named old slug — a stale brief would give a wrong target.
    if (!allowNewest) return null;
    const briefs = readdirSync(SCRIPTS)
      .filter((f) => /^serp-brief-.*\.md$/.test(f))
      .map((f) => ({ f, t: statSync(join(SCRIPTS, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    if (!briefs.length) return null;
    file = join(SCRIPTS, briefs[0].f);
  }
  const txt = readFileSync(file, "utf8");
  const num = (m, i = 1) => (m ? parseInt(m[i].replace(/,/g, ""), 10) : null);
  // New brief format carries the explicit Surfer-faithful band.
  const band = txt.match(/Target band:\s*\*\*([\d,]+)-([\d,]+)/i);
  const work = txt.match(/working target ~\*\*([\d,]+)\*\*/i);
  if (band) return { name: file.split("/").pop(), lo: num(band, 1), hi: num(band, 2), work: num(work) };
  // Legacy briefs: derive the band from median (+ outlier rule) — floor = median, ceiling =
  // the genuine max (the >=1.5x-median outlier is capped at 1.5x median, matching serp-optimize).
  const med = num(txt.match(/median\s*\*\*([\d,]+)\*\*/i));
  const mx = num(txt.match(/\bmax\s*\*\*([\d,]+)\*\*/i));
  if (!med) return null;
  const hi = mx && mx >= 1.5 * med ? Math.round(med * 1.5) : (mx || Math.round(med * 1.15));
  return { name: file.split("/").pop(), lo: med, hi, work: Math.round(med * 1.15) };
}

const wc = (s) => s.replace(/!\[[^\]]*\]\([^)]*\)/g, " ").trim().split(/\s+/).filter(Boolean).length;

const src = readFileSync(SRC, "utf8");
const posts = [...src.matchAll(/slug:\s*"([^"]+)"[\s\S]*?body:\s*`([\s\S]*?)`,\s*\n\s*\},/g)]
  .map((m) => ({ slug: m[1], body: m[2] }));

if (!posts.length) { console.error("No posts parsed from content/blog.ts"); process.exit(1); }
const post = slugArg ? posts.find((p) => p.slug === slugArg) : posts[0];
if (!post) { console.error(`Post not found: ${slugArg}`); process.exit(1); }

// The SERP-faithful BAND (calibrated to the Surfer editor): TARGET = floor = competitor
// median (never write below it); CEILING = longest GENUINE competitor (the >=1.5x-median
// outlier is excluded — match its coverage, not its padding). Over the ceiling => trim/merge,
// never deepen. --target overrides the brief (ceiling = ×1.3 around it).
let TARGET, CEILING, WORK = null, briefName = null;
if (tIdx >= 0) {
  TARGET = parseInt(args[tIdx + 1], 10);
  CEILING = Math.round(TARGET * 1.3);
} else {
  const b = loadBrief(post.slug, !slugArg);
  if (b && b.lo) {
    TARGET = b.lo; CEILING = b.hi; WORK = b.work; briefName = b.name;
  } else {
    TARGET = 1500; CEILING = Infinity; // no brief → legacy fallback floor, no ceiling guard
  }
}
const budgetLo = Math.round(TARGET / SECTION_FLOOR);
const budgetHi = CEILING === Infinity ? Infinity : Math.round(CEILING / SECTION_FLOOR);

// split body into sections by H2
const parts = post.body.split(/\n## /);
const intro = parts[0];
const sections = parts.slice(1).map((s) => {
  const nl = s.indexOf("\n");
  return { title: nl < 0 ? s : s.slice(0, nl), words: wc(nl < 0 ? "" : s.slice(nl)) };
});

const total = wc(post.body);
const introW = wc(intro);
const faqW = sections.filter((s) => /^FAQ/i.test(s.title)).reduce((a, s) => a + s.words, 0);

const contentCount = sections.filter((s) => !/^(FAQ|Table of Contents)/i.test(s.title)).length;
const over = total > CEILING;
const inBand = total >= TARGET && total <= CEILING;
const ceilTxt = CEILING === Infinity ? "" : `–${CEILING}`;
const srcTxt = tIdx >= 0 ? "[--target override]" : briefName ? `[${briefName}]` : "[no brief → 1500 fallback floor]";

console.log(`\nPost: ${post.slug}`);
console.log(`Total: ${total} words   |   SERP band ${TARGET}${ceilTxt}${WORK ? ` (working target ~${WORK})` : ""}   ${srcTxt}`);
const status = over
  ? `▲ ${total - CEILING} OVER the ceiling — TRIM or MERGE sections (do NOT deepen)`
  : inBand
    ? "✅ in band"
    : `▼ ${TARGET - total} under target — only a problem if the live top-3 are longer`;
console.log(`              ${status}`);
const budgetTxt = budgetHi === Infinity ? "" : `   |   target supports ~${budgetLo}-${budgetHi} content H2 at ${SECTION_FLOOR}w`;
console.log(`Sections: ${sections.length} H2 (${contentCount} content)${budgetTxt}   |   Intro: ${introW}w   |   avg/H2: ${Math.round((total - introW) / sections.length)}w\n`);
console.log("  words  section");
console.log("  -----  -------");
for (const s of sections) {
  const flag = s.words < SECTION_FLOOR && !/^(FAQ|Table of Contents)/i.test(s.title) ? "  ⚠ thin" : "";
  console.log(`  ${String(s.words).padStart(5)}  ${s.title}${flag}`);
}
const thin = sections.filter((s) => s.words < SECTION_FLOOR && !/^(FAQ|Table of Contents)/i.test(s.title));

// Visual cadence — keep humans reading: 1 visual (infographic / tour / directions /
// the one cover image) per ~500 words. Native infographics preferred (crawlable + fast).
// travelpluscost posts are plain Markdown: visuals = images + tables (no ::infographic/::tour syntax).
const images = (post.body.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length;
const tables = (post.body.match(/\n\s*\|[-:| ]+\|\s*\n/g) || []).length; // one per table (its header-divider row)
const visuals = images + tables;
const visualTarget = Math.max(2, Math.round(total / 500)); // 1 visual per ~500 words
console.log("");
console.log(`Visuals: ${visuals} (${images} img · ${tables} table)   |   aim ~${visualTarget} (1 per ~500 words)   |   ${visuals >= visualTarget ? "✅" : `⚠ add ${visualTarget - visuals} more`}`);
console.log("");
// Overshoot guard — the missing upper bound. When a post is already at/over the
// ceiling, "deepen the thin sections" is the WRONG move: it's what drives the 2x
// overshoot. Above target, thin sections should be MERGED or CUT, not fattened.
if (over) {
  console.log(`▲ OVERSHOOT: ${total}w vs a ${TARGET}-${CEILING}w band${WORK ? ` (working target ~${WORK})` : ""}. You have ${contentCount} content sections; the band supports ~${budgetLo}-${budgetHi}. MERGE or CUT to match the SERP — do NOT deepen. Padding past the longest genuine competitor is the overshoot bug, not depth.`);
}
if (thin.length && total >= TARGET) {
  console.log(`→ ${thin.length} section(s) under ${SECTION_FLOOR}w — but you're already at/over target, so MERGE or CUT them (fold into a neighbour), don't deepen. Deepening an at-target post is exactly how the overshoot happens.`);
} else if (thin.length) {
  console.log(`→ ${thin.length} section(s) under ${SECTION_FLOOR}w — deepen with full-sentence detail, OR (if you have more sections than the target supports, ~${budgetHi === Infinity ? "n/a" : budgetHi}) merge/cut instead. Never pad.`);
}
if (total < TARGET) {
  console.log(`→ Under target. Check the live top-3: if they're shorter, you're fine — match the SERP, never pad to a number.`);
}
if (inBand && !thin.length) {
  console.log("→ Length in band. (Sanity-check against the actual SERP top-3.)");
}
