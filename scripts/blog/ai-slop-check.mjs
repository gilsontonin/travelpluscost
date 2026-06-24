// AI-slop checker — flags AI-tell words/phrases in a blog post.
// See References/PassAISlopAndDetection.md. Run by write-blog-post + publish-post.
//
//   node scripts/ai-slop-check.mjs <slug>                 # a published post in content/blog.ts
//   node scripts/ai-slop-check.mjs content/drafts/x.md    # a draft / any text file
//   node scripts/ai-slop-check.mjs --all                  # every post in content/blog.ts
//
// Exits 1 if any HARD tell is found (so publish QA can gate on it). SOFT tells warn only.

import fs from "node:fs";

// HARD = near-always slop in our context → fail. SOFT = warn / review (3+ per paragraph = red flag).
const HARD = [
  "delve", "leverage", "utilize", "utilise", "utilization", "utilisation", "facilitate",
  "seamless", "world-class", "world class", "cutting-edge", "cutting edge", "unlock the",
  "unlock your", "unlock the power", "game-chang", "revolutioni", "unparalleled",
  "best-in-class", "synerg", "nestled", "hidden gem", "treasure trove", "testament to",
  "tapestry", "ever-evolving", "ever-changing", "in today's", "in today’s", "furthermore",
  "moreover", "in conclusion", "it is important to note",
  "it should be noted", "it should be mentioned", "take it to the next level",
  // + Grammarly multi-word AI phrases (near-zero legit travel use)
  "streamline", "shed light on", "sheds light on", "shedding light on", "to put it simply",
  "a key takeaway", "from a broader perspective", "this underscores",
];
// SOFT = warn/review (3+ per paragraph = red flag). Includes context-ambiguous terms that
// would false-block as HARD: "elevate" (elevated view / elevation gain), "at the end of the day"
// (literal evening), "to the next level" (literal stairs).
const SOFT = [
  "elevate", "at the end of the day", "to the next level",
  // travel-brochure tells — warn (a real beach/destination post may use them once, on purpose)
  "lush", "turquoise", "nestled", "oasis", "gem of a",
  "significant", "vital", "crucial", "comprehensive", "realm", "nuance", "intricate", "myriad",
  "plethora", "robust", "vibrant", "bustling", "stunning", "breathtaking", "majestic", "serene",
  "tranquil", "picturesque", "boasts", "paradise", "captivating", "mesmeriz", "immers", "embark",
  "dive into", "when it comes to", "whether you're", "whether you’re", "look no further",
  "rich history", "array of", "showcase", "enhance", "foster", "pivotal", "underscore", "garner",
  "a testament", "it's worth noting", "it is worth noting",
  // + Grammarly: academic verbs, hedges, buzzwords (often legit → warn, don't block)
  "harness", "illuminate", "at its core", "generally speaking", "typically", "tends to",
  "arguably", "to some extent", "broadly speaking", "refine", "bolster", "differentiate",
  "innovative", "transformative", "scalable",
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Leading word boundary, no trailing boundary → catches word families (elevate→elevated, leverage→leveraging).
const rx = (term) => new RegExp((/^[a-z]/i.test(term) ? "\\b" : "") + esc(term), "gi");

function bodyForSlug(src, slug) {
  const i = src.indexOf(`slug: "${slug}"`);
  if (i < 0) return null;
  const bs = src.indexOf("body: `", i);
  if (bs < 0) return null;
  const start = bs + "body: `".length;
  const end = src.indexOf("`,", start); // bodies contain no backticks
  return src.slice(start, end);
}

function clean(text) {
  // strip markdown link URLs (keep anchor text) so URLs don't false-positive
  return text.replace(/\]\((?:https?:\/\/|\/|#)[^)]*\)/g, "]");
}

// Approved overrides: clichés the writing deliberately MOCKS in scare-quotes are not slop.
// (Add new approved scare-quote phrases here.) Stripped before HARD detection only.
const ALLOW = [/["“][^"”\n]*hidden gems?[^"”\n]*["”]/gi];

function scan(label, body) {
  const text = clean(body);
  let hardText = text;
  for (const re of ALLOW) hardText = hardText.replace(re, " ");
  const paras = text.split(/\n/).filter((p) => p.trim());
  const mkHit = (list, t) => {
    const lines = t.split("\n");
    return list
      .map((term) => {
        const m = t.match(rx(term)); // fresh global regex → count
        if (!m) return null;
        // non-global regex for the snippet (avoids stateful lastIndex bugs)
        const one = new RegExp((/^[a-z]/i.test(term) ? "\\b" : "") + esc(term), "i");
        const line = (lines.find((l) => one.test(l)) || "").trim().slice(0, 90);
        return { term, count: m.length, line };
      })
      .filter(Boolean);
  };
  const hard = mkHit(HARD, hardText); // scare-quoted clichés excluded
  const soft = mkHit(SOFT, text);
  // paragraphs with 3+ soft tells
  const dense = paras.filter((p) => SOFT.reduce((n, t) => n + ((p.match(rx(t)) || []).length), 0) >= 3);
  // Hawaiian diacritics (ʻokina / macrons) are only allowed INSIDE a first-mention parenthetical
  // like "Iao (ʻĪao)". Any diacritic-bearing word OUTSIDE parentheses is a fail.
  const noParen = text.replace(/\([^)]*\)/g, "");
  const diacRe = /[A-Za-zāēīōūĀĒĪŌŪʻ‘ʽ'’-]*[āēīōūĀĒĪŌŪʻ‘ʽ][A-Za-zāēīōūĀĒĪŌŪʻ‘ʽ'’-]*/g;
  const diac = [...new Set(noParen.match(diacRe) || [])];

  console.log(`\n=== ${label} ===`);
  if (!hard.length && !soft.length && !diac.length) console.log("clean ✓ — no AI tells");
  if (hard.length) {
    console.log(`❌ HARD tells (${hard.reduce((n, h) => n + h.count, 0)}):`);
    hard.forEach((h) => console.log(`   ${h.term} ×${h.count}  — “${h.line}”`));
  }
  if (soft.length) {
    console.log(`⚠  SOFT tells (${soft.reduce((n, h) => n + h.count, 0)}) — review:`);
    soft.forEach((h) => console.log(`   ${h.term} ×${h.count}`));
  }
  if (dense.length) console.log(`⚠  ${dense.length} paragraph(s) with 3+ soft tells (red flag)`);
  if (diac.length) {
    console.log(`❌ Hawaiian diacritics OUTSIDE parentheses (${diac.length}): ${diac.slice(0, 12).join(", ")}`);
    console.log(`   → use plain ASCII in the main text; put the Hawaiian spelling in (parens) on first mention only.`);
  }
  return hard.length > 0 || diac.length > 0;
}

const arg = process.argv[2];
if (!arg) {
  console.error("usage: ai-slop-check.mjs <slug | file.md | --all>");
  process.exit(2);
}

let anyHard = false;
if (arg === "--all") {
  const src = fs.readFileSync("src/lib/posts.ts", "utf8");
  const slugs = [...src.matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1]);
  for (const s of slugs) {
    const body = bodyForSlug(src, s);
    if (body) anyHard = scan(s, body) || anyHard;
  }
} else if (/\.(md|tsx?|txt)$/.test(arg)) {
  anyHard = scan(arg, fs.readFileSync(arg, "utf8"));
} else {
  const src = fs.readFileSync("src/lib/posts.ts", "utf8");
  const body = bodyForSlug(src, arg);
  if (!body) { console.error(`slug "${arg}" not found in content/blog.ts`); process.exit(2); }
  anyHard = scan(arg, body);
}

console.log(anyHard ? "\nRESULT: ❌ HARD tells present — fix before publish." : "\nRESULT: ✓ no HARD tells.");
process.exit(anyHard ? 1 : 0);
