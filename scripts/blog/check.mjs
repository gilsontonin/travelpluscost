// check.mjs — the pre-deploy GATE for blog/brand content. Fast, deterministic, no-network. Exits
// non-zero if any check fails. Wired into the Netlify build so a red check FAILS THE DEPLOY (the last
// good version stays live). Network/Lighthouse checks run separately (blog:links, blog:lh).
//   npm run check
import { execSync } from "node:child_process";
import fs from "node:fs";

const steps = [];
function run(label, cmd) {
  process.stdout.write(`▶ ${label} … `);
  try { execSync(cmd, { stdio: "pipe" }); console.log("✓"); steps.push([label, true]); }
  catch (e) {
    console.log("❌");
    const out = (e.stdout?.toString() || "") + (e.stderr?.toString() || "");
    console.log(out.split("\n").filter((l) => /❌|HARD|claim|fail|missing/i.test(l)).slice(0, 20).map((l) => "    " + l).join("\n"));
    steps.push([label, false]);
  }
}

// 1) AI-slop on every blog post (0 HARD tells to ship)
run("ai-slop · blog posts", "node scripts/blog/ai-slop-check.mjs --all");
// 2) Claims integrity (no fake reviews / ratings / price overclaims in authored copy)
run("claims-integrity", "node scripts/blog/claims-check.mjs");
// 3) Prose style (owner voice: no dashes, no colons/semicolons in prose, no contractions). SHARED
// engine now (the local copy had drifted) so the rule is IDENTICAL to HP. (2026-06-29)
run("prose-style", "node ../blog-system/scripts/style-clean.mjs --all");
// 3a) Infographics text — same human style (native-visual prose is customer-facing). UNIFORM with HP.
run("prose-style · infographics", "node ../blog-system/scripts/style-clean.mjs --ig");
// 3b) No duplicate slugs (silent route collision) — UNIFORM shared gate.
run("dup-slugs", "node ../blog-system/scripts/check-dup-slugs.mjs");
// 4) Structural HTML audit (JSON-LD BlogPosting+BreadcrumbList, canonical, img alt) — UNIFORM with HP. Build-gated.
if (fs.existsSync(".next/server/app/blog")) run("html audit (.next)", "node scripts/blog/audit-html.mjs");
else console.log("▶ html audit … skipped (no .next — run after build)");

const failed = steps.filter(([, ok]) => !ok);
console.log(`\n${"─".repeat(48)}\ncheck: ${steps.length - failed.length}/${steps.length} passed`);
if (failed.length) {
  console.log("❌ FAILED: " + failed.map(([l]) => l).join(", "));
  console.log("Deploy should be blocked. Fix the above and re-run `npm run check`.");
  process.exit(1);
}
console.log("✓ ALL CHECKS PASSED — safe to deploy.");
