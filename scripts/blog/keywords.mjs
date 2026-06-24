#!/usr/bin/env node
// Keyword ledger robot for the write-blog-post workflow.
//
// Reads content/keywords.json (the used-keyword + cluster ledger, keyed by slug) and
// src/lib/posts.ts (the live posts), then reports THREE things — no Semrush call, it
// just reads the ledger the write/review flow fills via the MCP (see
// docs/blog-system/References/Semrush.md):
//
//   1. USED KEYWORDS  — every primary + secondary, so you never target one twice.
//   2. CANNIBALIZATION — two posts sharing a primary (exact/subset) or the same intent
//                        with heavy head-term overlap. These split our own ranking signals.
//   3. OPTIMIZATION    — entries whose Semrush research is STALE (> 180 days) and due a
//                        re-pull/re-map, plus ledger⇄posts sync gaps.
//
// Ledger entry shape (per slug):
//   { primary, secondary[], volume, kd, intent, database, researched (YYYY-MM-DD),
//     status: "researching"|"published"|"retired", history: [{ primary, retired, why }] }
//
// Usage:
//   node scripts/blog/keywords.mjs          # full report (advisory; always exits 0)
//   npm run blog:keywords

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LEDGER = join(ROOT, "content", "keywords.json");
const POSTS = join(ROOT, "src", "lib", "posts.ts");

const STALE_DAYS = 180;
const norm = (s) => String(s || "").toLowerCase().trim().replace(/\s+/g, " ");
const STOP = new Set(["the", "a", "an", "in", "on", "to", "of", "for", "and", "is", "are", "with", "your", "you"]);
const tokens = (s) => norm(s).split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));
function overlap(a, b) {
  const A = new Set(tokens(a)), B = new Set(tokens(b));
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return shared / Math.min(A.size, B.size); // share of the smaller phrase covered
}

if (!existsSync(LEDGER)) {
  console.error(`✗ No ledger at ${LEDGER}. Create it (keyed by slug) — see References/Semrush.md.`);
  process.exit(0);
}
const ledger = JSON.parse(readFileSync(LEDGER, "utf8"));
const postSlugs = new Set(
  [...readFileSync(POSTS, "utf8").matchAll(/slug:\s*["']([^"']+)["']/g)].map((m) => m[1])
);
const entries = Object.entries(ledger);

console.log("\n📒  KEYWORD LEDGER  (content/keywords.json)\n" + "=".repeat(52));

// 1. USED KEYWORDS
console.log(`\n1. USED KEYWORDS — ${entries.length} ${entries.length === 1 ? "entry" : "entries"} (never reuse a primary):`);
for (const [slug, e] of entries) {
  const sec = (e.secondary || []).length ? `  ·  +${e.secondary.length} secondary` : "";
  console.log(`   • ${e.primary}  [${slug}]  vol ${e.volume ?? "?"} / KD ${e.kd ?? "?"} / ${e.intent ?? "?"} / ${e.status ?? "?"}${sec}`);
}

// 2. CANNIBALIZATION
console.log(`\n2. CANNIBALIZATION:`);
const flags = [];
for (let i = 0; i < entries.length; i++) {
  for (let j = i + 1; j < entries.length; j++) {
    const [sa, ea] = entries[i], [sb, eb] = entries[j];
    const pa = norm(ea.primary), pb = norm(eb.primary);
    if (!pa || !pb) continue;
    if (pa === pb) { flags.push(`HARD  ${sa} ⇄ ${sb}: identical primary "${ea.primary}"`); continue; }
    if (pa.includes(pb) || pb.includes(pa)) { flags.push(`WARN  ${sa} ⇄ ${sb}: one primary contains the other ("${ea.primary}" / "${eb.primary}")`); continue; }
    if (ea.intent && ea.intent === eb.intent && overlap(pa, pb) >= 0.6)
      flags.push(`WARN  ${sa} ⇄ ${sb}: same intent (${ea.intent}) + head-term overlap ("${ea.primary}" / "${eb.primary}")`);
  }
}
console.log(flags.length ? flags.map((f) => "   ⚠ " + f).join("\n") : "   ✅ clear — no two posts share an intent.");

// 3. OPTIMIZATION
console.log(`\n3. OPTIMIZATION (re-pull / re-map):`);
const now = Date.now();
const opt = [];
for (const [slug, e] of entries) {
  if (e.researched) {
    const age = Math.floor((now - Date.parse(e.researched)) / 864e5);
    if (age > STALE_DAYS) opt.push(`STALE   ${slug}: researched ${e.researched} (${age}d ago) — re-pull Semrush, consider a new cluster.`);
  } else opt.push(`NODATE  ${slug}: no "researched" date — backfill from Semrush.`);
}
for (const [slug, e] of entries)
  if (e.status !== "researching" && !postSlugs.has(slug)) opt.push(`ORPHAN  ${slug}: in ledger (status ${e.status}) but no post in posts.ts.`);
for (const slug of postSlugs)
  if (!ledger[slug]) opt.push(`UNLOGGED ${slug}: a live post with NO ledger entry — add its keyword cluster.`);
console.log(opt.length ? opt.map((o) => "   • " + o).join("\n") : "   ✅ all entries fresh + in sync.");

console.log("");
