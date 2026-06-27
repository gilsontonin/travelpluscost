#!/usr/bin/env node
// blog:kd — KD-vet + semantic-cluster miner for the "where to stay" program.
//
// Reads the Semrush "where to stay in *" broad-match export (US) in Designs/ and answers two questions
// the SERP-first flow couldn't, now that we have real data again:
//   1. Is this city WINNABLE? (Keyword Difficulty + volume + intent + SERP features)
//   2. What is the full CLUSTER to target? (every semantically related variant + its vol/KD — the FAQ
//      and section seeds for the post)
//
// Usage:
//   npm run blog:kd -- kauai          # vet one city + print its cluster (the keywords to target)
//   npm run blog:kd                    # no arg → the winnable shortlist (KD ≤ 35, vol ≥ 500, US)
//
// The CSV lives in Designs/ (a local-only data file, like the health-scan state — not committed; it's a
// 1 MB Semrush export). Drop a fresher "where-to-stay-in-*broad-match*.csv" in Designs/ to update.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const C = { b: "\x1b[1m", dim: "\x1b[2m", g: "\x1b[32m", y: "\x1b[33m", r: "\x1b[31m", c: "\x1b[36m", x: "\x1b[0m" };

// --- locate the CSV (newest matching file in Designs/) ---
const DIR = "Designs";
let csvPath;
try {
  const matches = readdirSync(DIR)
    .filter((f) => /where-to-stay-in.*broad-match.*\.csv$/i.test(f))
    .sort();
  csvPath = matches.length ? join(DIR, matches[matches.length - 1]) : null;
} catch {
  csvPath = null;
}
if (!csvPath) {
  console.error(`${C.r}No "where-to-stay-in*broad-match*.csv" found in ${DIR}/.${C.x}\n` +
    `Export the "where to stay in *" broad-match (US) from Semrush and drop it in ${DIR}/.`);
  process.exit(1);
}

// --- parse (semicolon-delimited: Keyword;Intent;Volume;Keyword Difficulty;CPC;SERP Features) ---
const rows = readFileSync(csvPath, "utf8")
  .split(/\r?\n/)
  .slice(1)
  .map((l) => l.split(";"))
  .filter((p) => p[0])
  .map((p) => ({
    kw: p[0].toLowerCase().trim(),
    intent: (p[1] || "").trim(),
    vol: +p[2] || 0,
    kd: +p[3] || 0,
    serp: (p[5] || "").trim(),
  }));

const verdict = (kd) =>
  kd <= 20 ? `${C.g}easy${C.x}` : kd <= 30 ? `${C.g}winnable${C.x}` : kd <= 40 ? `${C.y}moderate${C.x}` : `${C.r}hard${C.x}`;

const city = process.argv.slice(2).join(" ").toLowerCase().trim();

if (!city) {
  // --- shortlist mode: winnable US head terms ---
  const covered = new Set(JSON.parse(
    "[\"albuquerque\",\"galveston\",\"san antonio\",\"sedona\",\"scottsdale\",\"tucson\",\"flagstaff\",\"charleston\",\"savannah\",\"saint augustine\",\"st augustine\",\"key west\",\"estes park\",\"santa barbara\",\"telluride\",\"branson\",\"wisconsin dells\",\"bend\",\"asheville\",\"moab\",\"maui\",\"oahu\"]"
  ));
  const intl = /(tokyo|london|paris|rome|dublin|edinburgh|barcelona|madrid|amsterdam|lisbon|berlin|prague|vienna|venice|florence|cancun|tulum|bangkok|bali|kyoto|osaka|sydney|cabo|reykjavik|iceland|ireland|scotland|italy|france|spain|portugal|greece|japan|mexico city|costa rica|cozumel|aruba|jamaica|maldives|dubai|singapore|hong kong|seoul|montreal|toronto|vancouver|quebec|santorini|mykonos|nice|munich|zurich|interlaken|positano|amalfi|marrakech|cartagena|medellin|lima|cusco|queenstown|auckland|milan|athens|copenhagen|porto|istanbul|phuket|taipei|como|brussels|split|tuscany|turks)/i;
  const out = [];
  for (const r of rows) {
    const m = r.kw.match(/^where to stay in ([a-z .'-]+)$/);
    if (!m) continue;
    const place = m[1].trim();
    if (place.split(/\s+/).length > 3 || intl.test(place) || r.vol < 500 || r.kd > 35) continue;
    out.push({ place, vol: r.vol, kd: r.kd, covered: covered.has(place) });
  }
  out.sort((a, b) => b.vol / Math.max(b.kd, 1) - a.vol / Math.max(a.kd, 1));
  console.log(`\n${C.b}🔑 WINNABLE "where to stay" targets${C.x} ${C.dim}(US · KD ≤ 35 · vol ≥ 500 · by opportunity)${C.x}\n`);
  console.log(`  ${C.dim}vol     KD   opp   city${C.x}`);
  for (const r of out.slice(0, 30))
    console.log(`  ${String(r.vol).padStart(5)}  ${String(r.kd).padStart(3)}  ${String(Math.round(r.vol / Math.max(r.kd, 1))).padStart(4)}  ${r.place}${r.covered ? `   ${C.dim}✓ already${C.x}` : ""}`);
  console.log(`\n${C.dim}Vet one: npm run blog:kd -- <city>${C.x}`);
  process.exit(0);
}

// --- vet mode: one city + its cluster ---
const head = rows.find((r) => r.kw === `where to stay in ${city}`);
const cluster = rows.filter((r) => r.kw.includes(city)).sort((a, b) => b.vol - a.vol);

console.log(`\n${C.b}🔑 KD-VET — ${city}${C.x}   ${C.dim}(${csvPath})${C.x}\n`);
if (head) {
  console.log(`${C.b}HEAD:${C.x} "where to stay in ${city}"  ·  vol ${C.b}${head.vol}${C.x}  ·  KD ${C.b}${head.kd}${C.x} (${verdict(head.kd)})  ·  ${head.intent}`);
  if (head.serp) console.log(`  ${C.dim}SERP: ${head.serp}${C.x}`);
} else {
  console.log(`${C.y}No exact "where to stay in ${city}" head term in the export.${C.x} Cluster matches below (if any).`);
}
if (!cluster.length) {
  console.log(`\n${C.r}No rows contain "${city}".${C.x} Check spelling, or it's below the export's volume floor.`);
  process.exit(0);
}
const avgKd = Math.round(cluster.reduce((s, r) => s + r.kd, 0) / cluster.length);
const totVol = cluster.reduce((s, r) => s + r.vol, 0);
console.log(`\n${C.b}CLUSTER${C.x} ${C.dim}(${cluster.length} variants · ${totVol.toLocaleString()} combined vol · avg KD ${avgKd}) — target these as sections + FAQ:${C.x}\n`);
console.log(`  ${C.dim}vol    KD   keyword${C.x}`);
for (const r of cluster.slice(0, 30))
  console.log(`  ${String(r.vol).padStart(5)}  ${String(r.kd).padStart(3)}  ${verdict(r.kd).padEnd(18)} ${r.kw}`);
if (cluster.length > 30) console.log(`  ${C.dim}… +${cluster.length - 30} more${C.x}`);
