// blog:cluster — topical-authority content mapper. Reads a Semrush location broad-match CSV
// (Designs/Locations/<slug>_broad-match_*.csv), keeps the TRAVEL/TOURISM keywords (drops sports/
// jobs/real-estate/news/weather-utility + the exclusions — near-me/competitors), buckets them into
// content topics, and prints a ranked content map (one cluster ≈ one post area): head keyword, volume,
// KD, winnable count, seeds. Shares its CSV/noise/topic logic with blog:map via lib/keywords.mjs.
//   npm run blog:cluster -- "new orleans"      (auto-finds the newest CSV for that city)
//   npm run blog:cluster -- "new orleans" --topic food   (dump every keyword in one cluster)
import { loadClusters, TOPICS, median as med } from "./lib/keywords.mjs";

const argv = process.argv.slice(2);
const city = (argv.find((a) => !a.startsWith("--")) || "new orleans").toLowerCase();
const topicArg = (() => { const i = argv.indexOf("--topic"); return i >= 0 ? argv[i + 1] : null; })();

let loaded;
try { loaded = loadClusters(city); } catch (e) { console.error(String(e.message || e)); process.exit(1); }
const { file, kept, dropped, clusters } = loaded;

if (topicArg) {
  const list = (clusters.get(topicArg) || []).sort((a, b) => b.vol - a.vol);
  console.log(`\n${topicArg} — ${list.length} keywords (sorted by volume)\n`);
  for (const k of list.slice(0, 80)) console.log(`  ${String(k.vol).padStart(7)}  KD ${String(k.kd).padStart(3)}  ${k.kw}`);
  process.exit(0);
}

const summary = [...clusters.entries()].map(([topic, list]) => {
  const sorted = list.slice().sort((a, b) => b.vol - a.vol);
  const winnable = list.filter((k) => k.kd <= 35).length;
  return { topic, n: list.length, vol: list.reduce((s, k) => s + k.vol, 0), kdMed: med(list.map((k) => k.kd)), winnable, head: sorted[0], seeds: sorted.slice(0, 5) };
}).filter((c) => c.n).sort((a, b) => b.vol - a.vol);

console.log(`\n🗺️  CONTENT MAP — ${city}   (${file})`);
console.log(`   ${kept} travel keywords kept · ${dropped} noise dropped · ${summary.length} content clusters\n`);
for (const c of summary) {
  console.log(`▶ ${c.topic.toUpperCase().padEnd(26)} ${String(c.vol).padStart(8)} vol · ${String(c.n).padStart(4)} kw · ${c.winnable} winnable(KD≤35) · medKD ${c.kdMed}`);
  console.log(`    head: "${c.head.kw}" (vol ${c.head.vol}, KD ${c.head.kd})`);
  console.log(`    seeds: ${c.seeds.map((s) => s.kw).join(" · ")}`);
}
console.log(`\nDrill into one:  npm run blog:cluster -- "${city}" --topic <name>\n`);
