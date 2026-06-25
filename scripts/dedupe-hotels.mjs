#!/usr/bin/env node
// Dedupe the directory: the same physical hotel was ingested under two LiteAPI ids (a re-ingest
// artifact), producing ~25k duplicate property pages (duplicate title tags), duplicate city-hub cards,
// and polluted where-to-stay pools. This collapses exact (name + city + state) duplicates to ONE row.
//
// KEEPER per group: a blog-referenced id ALWAYS wins (so ::hotel/::showcase/::compare cards never break);
// otherwise the row with the most reviews, tie-broken by has-thumbnail → rating → id. Losers are deleted.
//
//   node --env-file=.env.local scripts/dedupe-hotels.mjs            # DRY RUN (default) — prints the plan
//   node --env-file=.env.local scripts/dedupe-hotels.mjs --apply    # actually delete the redundant rows

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const APPLY = process.argv.includes("--apply");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

// Ids referenced by the blog (must never be deleted).
const posts = readFileSync(join(ROOT, "src/lib/posts.ts"), "utf8");
const blogIds = new Set([...posts.matchAll(/::(?:hotel|showcase)\s+(\S+)/g)].map((m) => m[1])
  .concat([...posts.matchAll(/::compare\s+(.+)/g)].flatMap((m) => m[1].trim().split(/\s+/))));
console.log(`Blog-referenced ids (protected): ${blogIds.size}`);

// Pull the whole directory. MUST order by id — an unordered range() returns overlapping pages, which
// would double-count rows (and falsely show the same id as its own "duplicate").
let rows = [], from = 0;
for (;;) {
  const { data, error } = await sb.from("hotels").select("id,name,city,state,review_count,rating,thumbnail").order("id", { ascending: true }).range(from, from + 999);
  if (error) { console.error("✗", error.message); process.exit(1); }
  rows = rows.concat(data); if (data.length < 1000) break; from += 1000;
}
const byId = new Map(rows.map((h) => [h.id, h])); // belt-and-suspenders: unique by primary key
const all = [...byId.values()];
console.log(`Directory rows: ${rows.length} fetched · ${all.length} unique ids`);

const norm = (s) => (s ?? "").trim().toLowerCase();
const groups = new Map();
for (const h of all) {
  const k = `${norm(h.name)}|${norm(h.city)}|${norm(h.state)}`;
  (groups.get(k) ?? groups.set(k, []).get(k)).push(h);
}

// score: blog id first, then reviews, then thumbnail, then rating
const score = (h) => (blogIds.has(h.id) ? 1e9 : 0) + (h.review_count ?? 0) * 10 + (h.thumbnail ? 5 : 0) + (h.rating ?? 0);
const losers = [];
let protectedKept = 0, dupGroups = 0;
for (const g of groups.values()) {
  if (g.length < 2) continue;
  dupGroups++;
  const sorted = [...g].sort((a, b) => score(b) - score(a));
  const keeper = sorted[0];
  if (blogIds.has(keeper.id)) protectedKept++;
  for (const l of sorted.slice(1)) losers.push(l);
}
const loserBlog = losers.filter((l) => blogIds.has(l.id));
console.log(`\nDuplicate groups: ${dupGroups}  ·  redundant rows to delete: ${losers.length}`);
console.log(`Groups where a blog id is the keeper: ${protectedKept}`);
console.log(`⚠ blog ids that would be DELETED: ${loserBlog.length}  (must be 0)`);

console.log(`\nSample (5 groups — KEEP ✓ / delete ✗):`);
let shown = 0;
for (const g of groups.values()) {
  if (g.length < 2 || shown >= 5) continue;
  shown++;
  const sorted = [...g].sort((a, b) => score(b) - score(a));
  console.log(`  ${sorted[0].name} / ${sorted[0].city}, ${sorted[0].state}`);
  sorted.forEach((h, i) => console.log(`    ${i === 0 ? "✓keep" : "✗del "} ${h.id}  rev=${h.review_count}${blogIds.has(h.id) ? " [BLOG]" : ""}`));
}

if (!APPLY) { console.log(`\nDRY RUN — nothing deleted. Re-run with --apply to delete ${losers.length} rows.`); process.exit(0); }
if (loserBlog.length) { console.error(`\n✗ ABORT: ${loserBlog.length} blog ids in the delete set — refusing.`); process.exit(1); }
console.log(`\n🗑  Deleting ${losers.length} redundant rows…`);
const ids = losers.map((l) => l.id);
let done = 0;
for (let i = 0; i < ids.length; i += 200) {
  const { error } = await sb.from("hotels").delete().in("id", ids.slice(i, i + 200));
  if (error) { console.error("✗", error.message); process.exit(1); }
  done += Math.min(200, ids.length - i);
  if (done % 2000 < 200) console.log(`   …${done}/${ids.length}`);
}
console.log(`✓ Deleted ${done} duplicate rows.`);
