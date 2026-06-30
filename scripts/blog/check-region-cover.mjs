#!/usr/bin/env node
// check-region-cover.mjs — TPC deploy gate (self-contained, in-repo).
// Every TPC blog post must funnel to hotels exactly like the established posts:
//   1. a `region: { destination: "<City>" }` → drives the top search widget + the
//      "Top-rated stays in <City>" hotel rail (template only renders these when region exists).
//   2. a real hotel-photo cover from static.cupid.travel — NEVER an Unsplash/stock photo.
// Exit 1 (deploy-blocking) if any post is missing either. Added 2026-06-30 after recent posts
// shipped with no region + Unsplash covers (no search bar, no inventory strip).
import fs from "node:fs";

const f = fs.existsSync("src/lib/posts.ts") ? "src/lib/posts.ts" : "content/blog.ts";
if (f.includes("content/blog.ts")) { console.log("region+cover: HP format — gate is TPC-only, skipped."); process.exit(0); }

const s = fs.readFileSync(f, "utf8");
const blocks = s.split(/\n  \{\n/).slice(1);
const bad = [];
for (const b of blocks) {
  const slug = (b.match(/slug:\s*"([^"]+)"/) || [])[1];
  if (!slug) continue;
  const meta = b.split("body:")[0];
  const hasRegion = /\n    region:\s*\{[^}]*destination:\s*"[^"]+"/.test(meta);
  const cover = (meta.match(/cover:\s*\{[\s\S]*?src:\s*"([^"]+)"/) || [])[1] || "";
  const hotelCover = /static\.cupid\.travel/.test(cover);
  if (!hasRegion || !hotelCover) bad.push({ slug, hasRegion, hotelCover, cover: cover.slice(0, 48) });
}
if (bad.length) {
  console.error(`✗ region+cover: ${bad.length} post(s) missing region or using a non-hotel cover —`);
  for (const x of bad) console.error(`   ${x.slug} · region:${x.hasRegion ? "ok" : "MISSING"} · cover:${x.hotelCover ? "ok" : "NOT-HOTEL (" + x.cover + ")"}`);
  console.error("  Fix: add region:{ name, destination } and a static.cupid.travel hotel cover (copy an established post).");
  process.exit(1);
}
console.log(`✓ region+cover: all ${blocks.length} posts have a region + a static.cupid.travel hotel cover`);
