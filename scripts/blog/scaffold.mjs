#!/usr/bin/env node
// Just-in-time SCAFFOLD — assembles an inventory-forward post skeleton from real data.
//
// Reads the market dataset, groups by area, and prints a ready Markdown body: answer-first TL;DR
// stub, a top-of-post search + areas block, one section per real area (rail + top hotel card +
// a collapsible ::details box for the deep SEO prose), then map / compare / priceproof. You paste
// it into src/lib/posts.ts and write the prose into the stubs — the inventory is already wired.
//
// Usage:  node scripts/blog/scaffold.mjs maui   |   npm run blog:scaffold -- maui

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dest = process.argv.slice(2).join(" ").trim();
if (!dest) { console.error("usage: node scripts/blog/scaffold.mjs <market>"); process.exit(1); }
const slug = dest.toLowerCase().replace(/[^a-z0-9]/g, "");
const file = join(ROOT, "content", `${slug}.json`);
if (!existsSync(file)) { console.error(`✗ No dataset content/${slug}.json`); process.exit(1); }

const AREAS = ["kaanapali", "kapalua", "napili", "kahana", "honokowai", "wailea", "makena", "kihei",
  "lahaina", "paia", "wailuku", "kahului", "hana", "waikiki", "ko olina", "kailua", "north shore",
  "the strip", "downtown", "henderson"];
const areaOf = (h) => {
  const t = `${h.city || ""} ${h.address || ""} ${h.name || ""}`.toLowerCase();
  return AREAS.find((a) => t.includes(a)) || "other";
};
const conf = (h) => ((h.reviewCount ?? 0) >= 20 ? 1 : 0);
const byScore = (x, y) => conf(y) - conf(x) || (y.rating ?? 0) - (x.rating ?? 0) || (y.reviewCount ?? 0) - (x.reviewCount ?? 0);
const title = (s) => s.replace(/[a-z0-9]+/gi, (w) => w[0].toUpperCase() + w.slice(1));

const hotels = JSON.parse(readFileSync(file, "utf8"));
const byArea = {};
for (const h of hotels) if (areaOf(h) !== "other") (byArea[areaOf(h)] ??= []).push(h);
const named = Object.entries(byArea)
  .map(([a, hs]) => [a, hs.sort(byScore)])
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 6);

const D = title(dest);
const out = [];
out.push(`Where to stay in ${D} comes down to <!-- the one framing choice -->. <!-- bolded answer phrase + a dry hook, ~50 words, keyword verbatim in sentence 1, a visible "as of 2026". -->`);
out.push("");
out.push(`::search ${D}`);
out.push("");
out.push(`::areas ${D}`);
out.push("");
for (const [area, hs] of named) {
  const A = title(area);
  out.push(`## ${A}: <!-- benefit headline -->`);
  out.push("");
  out.push(`**<!-- bold answer: who ${A} is for. -->** <!-- 2 sentences: the beach/vibe + the honest trade-off, one dry beat. -->`);
  out.push("");
  out.push(`::rail ${A}`);
  out.push("");
  out.push(`::hotel ${hs[0].id}`);
  out.push("");
  out.push(`::details More on ${A}`);
  out.push(`<!-- deep detail (collapsed, still crawlable): named beaches, dining, parking, who should skip it. This is the long-tail SEO text the big brands bury. -->`);
  out.push(`::/details`);
  out.push("");
}
out.push(`## ${D} on the map`);
out.push("");
out.push(`::map ${D}`);
out.push("");
if (named.length >= 2) {
  out.push(`## Two picks, head to head`);
  out.push("");
  out.push(`::compare ${named[0][1][0].id} ${named[1][1][0].id}`);
  out.push("");
}
out.push(`## How we price the stays you find here`);
out.push("");
out.push(`**<!-- the rate plus one flat fee, same for everyone, never your data. -->** <!-- link [surveillance pricing](/blog/surveillance-pricing) + [how it works](/#how). -->`);
out.push("");
out.push(`::priceproof`);

console.log(`\n# ===== SCAFFOLD: where to stay in ${D} =====`);
console.log(`# Paste into the post body in src/lib/posts.ts; fill every <!-- … --> stub. Areas/ids are REAL.\n`);
console.log(out.join("\n"));
console.log(`\n# ===== end scaffold =====\n`);
