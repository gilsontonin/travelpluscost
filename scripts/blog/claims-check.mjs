// claims-check.mjs — blocks FAKE / unverifiable social proof in blog posts + brand/marketing copy.
// Scoped to the surfaces WE author (posts + About/home/disclosure/legal) — NOT the hotel/search
// components, which legitimately display REAL per-hotel ratings + review counts from LiteAPI.
// FAILS (exit 1) on any match. Allowlist a string below only once it's genuinely substantiated.
//   node scripts/blog/claims-check.mjs
import fs from "node:fs";

const TARGETS = [
  "src/lib/posts.ts",
  "src/app/about/page.tsx",
  "src/app/page.tsx",
  "src/app/disclosure/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/privacy/page.tsx",
];

const PATTERNS = [
  { re: /AggregateRating/g, why: "AggregateRating schema (needs real, verifiable reviews)" },
  { re: /"?reviewCount"?\s*[:=]/g, why: "reviewCount markup in authored copy" },
  { re: /"?ratingValue"?\s*[:=]/g, why: "ratingValue markup in authored copy" },
  { re: /most[-\s]reviewed/gi, why: '"most-reviewed" (unverifiable superlative)' },
  { re: /\brated\s*(a\s*)?(clean\s*)?5\.0\b/gi, why: '"rated 5.0" (unverifiable rating claim)' },
  { re: /\b\d{2,}\+?\s*(five[-\s]?star|5[-\s]?star)\b/gi, why: "N-star review-count claim" },
  { re: /\b\d{3,}\+\s*(reviews|happy customers|bookings|guests served)/gi, why: "inflated track-record count" },
  // Brand promise: we never claim "the lowest/cheapest/best price" (POSITIONING). Flagged only as a
  // POSITIVE assertion — the negation "never the lowest price" / "not always the cheapest" is allowed.
  { re: /(?<!never |not |n't |only )\b(guaranteed lowest|lowest price anywhere|cheapest price|best price guaranteed)\b/gi, why: 'overclaim — we sell the HONEST price, not "lowest" (POSITIONING)' },
];
const ALLOW = []; // exact strings, once genuinely substantiated

const hits = [];
for (const f of TARGETS) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "utf8");
  for (const a of ALLOW) s = s.split(a).join(" ");
  for (const { re, why } of PATTERNS) {
    const m = s.match(re);
    if (m) hits.push(`${f}: ${why} (×${m.length}) — e.g. "${m[0].slice(0, 40)}"`);
  }
}

console.log(`claims-check: scanned ${TARGETS.filter((f) => fs.existsSync(f)).length} authored files`);
if (hits.length) {
  console.log(`\n❌ ${hits.length} potential unverifiable-claim hit(s):`);
  [...new Set(hits)].forEach((h) => console.log("  " + h));
  console.log("\nRESULT: ❌ claims-integrity failed (remove, rephrase, or allowlist if genuinely substantiated).");
  process.exit(1);
}
console.log("RESULT: ✓ no fake/unverifiable social-proof or price overclaims.");
