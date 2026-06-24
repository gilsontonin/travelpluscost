// check-lh.mjs — Lighthouse budget check (network/Chrome — run locally, not in the deploy gate).
// travelpluscost is SSR (no static export), so point this at a RUNNING server:
//   npm run build && npm start            # in one terminal (serves on :3000)
//   npm run blog:lh -- /blog/<slug>       # in another (defaults to /)
// Override the base with BASE=https://travelpluscost.com to test prod. Budget: perf ≥90, seo/a11y/bp =100.
import { execSync } from "node:child_process";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
const paths = process.argv.slice(2).filter((a) => !a.startsWith("--")).length ? process.argv.slice(2).filter((a) => !a.startsWith("--")) : ["/"];
const BUDGET = { performance: 90, seo: 100, accessibility: 100, "best-practices": 100 };

let bad = 0;
for (const p of paths) {
  const url = `${BASE}${p}`;
  try {
    execSync(`npx --yes lighthouse "${url}" --quiet --chrome-flags="--headless --no-sandbox" --only-categories=performance,seo,accessibility,best-practices --output=json --output-path=/tmp/lh-tpc.json`, { stdio: "ignore" });
  } catch { console.log(`❌ ${p}  — Lighthouse failed (is the server running at ${BASE}?)`); bad++; continue; }
  const c = JSON.parse(fs.readFileSync("/tmp/lh-tpc.json", "utf8")).categories;
  const row = Object.keys(BUDGET).map((k) => `${k} ${Math.round(c[k].score * 100)}`).join(" · ");
  const fails = Object.entries(BUDGET).filter(([k, min]) => Math.round(c[k].score * 100) < min);
  console.log(`${fails.length ? "❌" : "✓"} ${p}  ${row}`);
  if (fails.length) bad++;
}
console.log(bad ? `\n❌ ${bad} page(s) under budget.` : "\n✓ all pages meet the Lighthouse budget.");
process.exit(bad ? 1 : 0);
