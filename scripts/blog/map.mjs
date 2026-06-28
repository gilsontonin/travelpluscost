// blog:map — the KEYWORD MAP (priority queue). Reads the downloaded Semrush CSV (via lib/keywords.mjs),
// clusters similar keywords around a primary per topic, prioritizes "quick wins first" (by the easiest
// meaningful entry KD), cross-references content/keywords.json (so already-published topics drop to DONE),
// and writes content/keyword-map-<slug>.md — the ranked list of what to write next.
//   npm run blog:map -- "new orleans"
// Travel = BROAD, ballpark — Semrush CSV volume/KD is plenty; we don't drill to local-SEO precision.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { loadClusters, TOPICS, BRANDED, median } from "./lib/keywords.mjs";

const city = (process.argv.slice(2).find((a) => !a.startsWith("--")) || "new orleans").toLowerCase();
const slug = city.replace(/[^a-z0-9]+/g, "-");

let loaded;
try { loaded = loadClusters(city); } catch (e) { console.error(String(e.message || e)); process.exit(1); }
const { file, kept, dropped, clusters } = loaded;

// What's already published → which topic does each cover (so the map shows DONE vs TODO).
const topicOf = (kw) => (TOPICS.find(([, re]) => re.test(kw.toLowerCase())) || [null])[0];
const done = new Map(); // topic -> [slugs]
if (existsSync("content/keywords.json")) {
  const ledger = JSON.parse(readFileSync("content/keywords.json", "utf8"));
  for (const [postSlug, e] of Object.entries(ledger)) {
    const t = topicOf(e.primary || "");
    if (t) { if (!done.has(t)) done.set(t, []); done.get(t).push(postSlug); }
  }
}

// Build one map entry per topic: a pillar PRIMARY (highest volume) + the easiest meaningful ENTRY
// (lowest KD with real volume — the quick win) + a CLUSTER of similar secondary keywords.
// A keyword worth building a post around: informational/commercial intent (Jono's blog levers) + not a
// branded/navigational/transactional term. Junk like "drago's hilton" or "zoo tickets" gets excluded.
const blogWorthy = (k) => /informational|commercial/i.test(k.intent) && !BRANDED.test(k.kw);

const entries = [];
for (const [topic, list] of clusters) {
  if (!list.length) continue;
  const worthy = list.filter(blogWorthy);
  const pool = worthy.length ? worthy : list; // fall back to raw if a topic has nothing clean
  const byVol = pool.slice().sort((a, b) => b.vol - a.vol);
  const primary = byVol[0];
  // Quick-win candidates: real entries only — KD ≥5 (skip branded/no-competition junk) + vol ≥400,
  // the 3 lowest-KD. Tier by the BEST real candidate (junk-resistant); fall back to median if none.
  const candidates = pool.filter((k) => k.kd >= 5 && k.vol >= 400).sort((a, b) => a.kd - b.kd).slice(0, 3);
  const cluster = byVol.filter((k) => k.kw !== primary.kw).slice(0, 7); // similar keywords around the primary
  const tierKD = candidates.length ? candidates[0].kd : median(pool.map((k) => k.kd));
  const tier = tierKD <= 18 ? 1 : tierKD <= 30 ? 2 : 3;
  entries.push({
    topic, primary, candidates, cluster, tier,
    totalVol: list.reduce((s, k) => s + k.vol, 0),
    winnable: list.filter((k) => k.kd <= 35).length,
    medKD: median(list.map((k) => k.kd)),
    doneBy: done.get(topic) || null,
  });
}

// Band by the PILLAR keyword's difficulty (the shot we're taking) — NOT a gate. We go broad and write
// across every band: <30 ranks early + eventually, 50–70+ are the juicy anchor posts that build topical
// authority. Within a band, biggest opportunity (volume) first.
const band = (kd) => (kd < 30 ? 1 : kd < 50 ? 2 : kd < 70 ? 3 : 4);
const BANDS = {
  1: "🟢 Quick wins — pillar KD <30 (rank early, and eventually)",
  2: "🟡 Solid shots — pillar KD 30–49",
  3: "🟠 Big juice — pillar KD 50–69 (anchor posts, topical authority — take the shot)",
  4: "🔴 Giants — pillar KD 70+ (take a shot anyway; the rising tide lifts these)",
};
for (const e of entries) e.band = band(e.primary.kd);
const todo = entries.filter((e) => !e.doneBy).sort((a, b) => a.band - b.band || b.totalVol - a.totalVol);
const doneList = entries.filter((e) => e.doneBy).sort((a, b) => b.totalVol - a.totalVol);

const today = new Date().toISOString().slice(0, 10);
const L = [];
L.push(`# Keyword map — ${city}`);
L.push(`_priority queue · source: ${file} · generated ${today}_`);
L.push(`_${kept} travel keywords · ${dropped} noise/excluded · ${entries.length} topic clusters · ${todo.length} to write · ${doneList.length} done_`);
L.push(`\n**We go BROAD — KD is a difficulty label, NOT a gate.** Write across every band: the quick wins (KD <30) rank early and eventually, and the big pillars (KD 50–70+) are the juicy anchor posts that build topical authority. Take the shots worth taking. Each topic lists the **pillar** (the big shot), the **quick-win entries** (the easy way to start ranking the topic), and the **cluster** of similar keywords. Volume/KD are Semrush ballpark — broad is fine.`);

const fmt = (e) => {
  const lines = [];
  lines.push(`### ▶ ${e.topic}  ·  pillar KD ${e.primary.kd} · ${e.totalVol.toLocaleString()} vol`);
  lines.push(`- **Pillar (the shot):** "${e.primary.kw}" — ${e.primary.vol.toLocaleString()} vol / KD ${e.primary.kd}`);
  lines.push(`- **Quick-win entries:** ${e.candidates.length ? e.candidates.map((k) => `"${k.kw}" (${k.vol.toLocaleString()}/KD ${k.kd})`).join(" · ") : "— no easy entry; go straight for the pillar"}`);
  lines.push(`- **Cluster (similar keywords):** ${e.cluster.map((k) => `${k.kw} (KD ${k.kd})`).join(" · ")}`);
  lines.push(`- _topic: ${e.winnable} keywords KD≤35 · medKD ${e.medKD}_`);
  return lines.join("\n");
};

L.push(`\n## ▶ Write next (${todo.length})`);
for (const b of [1, 2, 3, 4]) {
  const g = todo.filter((e) => e.band === b);
  if (!g.length) continue;
  L.push(`\n### ${BANDS[b]}`);
  for (const e of g) L.push(fmt(e));
}

L.push(`\n## ✓ Done (covered — ${doneList.length})`);
for (const e of doneList) L.push(`- **${e.topic}** → ${e.doneBy.join(", ")}`);

L.push(`\n---\n_Drill any topic: \`npm run blog:cluster -- "${city}" --topic <name>\`. Then scan → research → write. Regenerate this map: \`npm run blog:map -- "${city}"\`._`);

const out = `content/keyword-map-${slug}.md`;
writeFileSync(out, L.join("\n") + "\n");
const bc = (b) => todo.filter((e) => e.band === b).length;
console.log(`Wrote ${out} — ${todo.length} to write (🟢<30:${bc(1)} 🟡30-49:${bc(2)} 🟠50-69:${bc(3)} 🔴70+:${bc(4)}) · ${doneList.length} done`);
console.log(`Biggest opportunities: ${todo.slice(0, 5).map((e) => `${e.topic}(KD${e.primary.kd})`).join(" · ")}`);
