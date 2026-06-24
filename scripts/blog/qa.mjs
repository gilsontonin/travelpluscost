#!/usr/bin/env node
// qa.mjs — the single CONSOLIDATED final QA for a travelpluscost blog post (the loop-back).
//
// Runs every check, scores 14 blocks, classifies each fail EASY-FIX vs EXEC-DECISION, prints ONE
// verdict, and appends the result to qa-logs/<slug>.md. Sits on top of the individual gates. Faithful
// port of the Hawaii Picnics QA, de-Hawaii'd and repointed to scripts/blog/ + src/lib/posts.ts.
//
//   node scripts/blog/qa.mjs <slug> [--kw "<primary>"] [--build pass|fail] [--check N/N] [--lighthouse 99/100/100/96] [--freshness 0]
//
// The slug-tools (ai-slop, voice-scorecard, post-checklist, post-stats) + serp-brief run/read
// automatically. The heavy/external results (build, lint/check, lighthouse, freshness) are passed as
// flags — run those separately and hand the runner the numbers so the QA log stays honest.

import { execSync } from "node:child_process";
import fs from "node:fs";

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
if (!slug) { console.error("Usage: node scripts/blog/qa.mjs <slug> [--kw ...] [--build pass] [--check N/N] [--lighthouse 99/100/100/96] [--freshness 0]"); process.exit(2); }
const flag = (n, d = null) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : (i >= 0 ? "true" : d); };
const kw = flag("--kw", slug.replace(/-/g, " "));

const run = (cmd) => { try { return { ok: true, out: execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) }; } catch (e) { return { ok: false, out: (e.stdout || "") + (e.stderr || "") }; } };
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
const PFX = 'export PATH="$HOME/.local/node/bin:$PATH"; ';

const slop = run(`${PFX}node scripts/blog/ai-slop-check.mjs ${slug}`);
const voice = run(`${PFX}node scripts/blog/voice-scorecard.mjs ${slug}`);
const checklist = run(`${PFX}node scripts/blog/post-checklist.mjs ${slug} --kw ${JSON.stringify(kw)}`);
const stats = run(`${PFX}node scripts/blog/post-stats.mjs ${slug}`);
const brief = read(`scripts/blog/serp-brief-${slug}.md`);

// ---- parse signals -----------------------------------------------------------------------
const serp = (brief.match(/SEO SCORE:\s*(\d+)\/100/) || [])[1];
const bandVerdict = /✅ in band/.test(stats.out) ? "in band" : /▲.*OVER/.test(stats.out) ? "OVER ceiling" : /▼.*under/i.test(stats.out) ? "UNDER floor" : "?";
const thin = (stats.out.match(/(\d+) section\(s\) under \d+w/) || [])[1] || (/⚠ thin/.test(stats.out) ? "some" : "0");
const igCadence = /Visuals:.*✅/.test(stats.out) ? "✅" : "check";
const auto = (checklist.out.match(/AUTO:\s*(\d+)\/(\d+)/) || []);
const drySections = (voice.out.match(/(\d+) section\(s\) show ZERO wit-markers/) || [])[1] || "0";
const statsSlug = (stats.out.match(/Post:\s*([a-z0-9-]+)/) || [])[1];

const lh = flag("--lighthouse");
const lhParts = lh ? lh.split("/").map(Number) : null;
const lhOk = lhParts && lhParts[0] >= 95 && lhParts[1] === 100 && lhParts[2] === 100 && lhParts[3] >= 95;
const build = flag("--build");
const check = flag("--check");
const checkOk = check && /^(\d+)\/\1$/.test(check.trim());
const fresh = flag("--freshness");

// ---- block scoring (PASS | VERIFY | FAIL ; fix EASY | EXEC | null) ------------------------
const B = [];
const add = (n, title, status, detail, fix = null, verify = []) => B.push({ n, title, status, detail, fix, verify });

add(1, "KEYWORD & SERP", serp == null ? "VERIFY" : +serp >= 90 ? "PASS" : "FAIL", `serp ${serp ?? "?"}/100`, serp != null && +serp < 90 ? "EXEC" : null, ["primary unused", "slug clean", "genuine competitors", "cannibalization by intent"]);
add(2, "LENGTH & STRUCTURE", bandVerdict === "in band" && thin === "0" ? "PASS" : "FAIL", `${bandVerdict} · thin: ${thin}${statsSlug === slug ? "" : ` · ⚠ stats showed '${statsSlug}'`}`, bandVerdict === "in band" && thin === "0" ? null : "EASY", ["section count ≈ band÷280", "ToC anchors resolve"]);
const conciseOk = /CONCISE.*✅/.test(voice.out);
add(3, "VOICE — CONVERSION", conciseOk ? "VERIFY" : "FAIL", (voice.out.match(/READING.*$/m) || ["reading ?"])[0].replace(/\s+/g, " ").trim(), conciseOk ? null : "EASY", ["#2 RFT framing", "#3 active voice", "#6 plain words, no clever-for-clever"]);
add(4, "VOICE — HUMOUR", +drySections > 0 ? "FAIL" : "VERIFY", `${drySections} zero-wit section(s)`, +drySections > 0 ? "EASY" : null, ["LIST one dry beat per content section", "smile cadence ~1/200-300w"]);
add(5, "AI-SLOP / TELLS", slop.ok ? "PASS" : "FAIL", slop.ok ? "0 HARD tells" : "HARD tell(s) present", slop.ok ? null : "EASY");
add(6, "ANSWER & SKIMMABILITY", "VERIFY", "TL;DR/bold/answer-first AUTO in checklist", null, ["answer-first + dry hook 50w", "snippet format matched", "decision-helper · anticipate-next"]);
add(7, "FAQ", "VERIFY", "FAQPage auto + 4-8 Qs AUTO in checklist", null, ["FAQ = leftovers only (swap test)"]);
add(8, "VISUALS", igCadence === "✅" ? "VERIFY" : "FAIL", `visual cadence ${igCadence}`, igCadence === "✅" ? null : "EASY", ["cover INSPECTED (sharp/on-topic)", "infographic keys exist", "no fact dup prose+visual"]);
add(9, "LINKS & CTA", "VERIFY", "internal links + hotel-card/CTA AUTO in checklist", null, ["authority links curl-200", "the ONE CTA routes to real inventory", "no fake-deal framing"]);
add(10, "FRESHNESS / ACCURACY", fresh == null ? "VERIFY" : /^0$/.test(fresh.trim()) ? "PASS" : "FAIL", fresh == null ? "visible 'as of 2026' AUTO in checklist; run freshness if perishable" : `${fresh} stale`, fresh != null && !/^0$/.test(fresh.trim()) ? "EASY" : null, ['visible "as of 2026"', "real numbers only (stats.md)"]);
add(11, "TECH / SEO / SCHEMA", "VERIFY", "title/desc/JSON-LD/alt AUTO in checklist", null, ["dehyphenate applied", "seoTitle ≤60 if set"]);
const parts12 = [build ? `build ${build}` : "build ?", check ? `lint/check ${check}` : "check ?", lh ? `lh ${lh}` : "lighthouse ?"];
let b12 = "VERIFY", fix12 = null;
if (build && check && lh) { const ok12 = build === "pass" && checkOk && lhOk; b12 = ok12 ? "PASS" : "FAIL"; fix12 = ok12 ? null : "EASY"; }
add(12, "BUILD & DEPLOY GATES", b12, parts12.join(" · "), fix12);
add(13, "REGRESSION WATCH", "VERIFY", "fill the 3 prompts in the report", null, ["rule changed this run?", "other axes re-checked?", "interaction logged?"]);
add(14, "LOGGING & POST-PUBLISH", "VERIFY", "backlinks IN · related regenerated · held for go-live", null, ["1-3 backlinks IN (de-orphan)", "blog:related regenerated", "GSC reindex after deploy"]);

const autoLine = auto.length ? `post-checklist AUTO ${auto[1]}/${auto[2]}${auto[1] === auto[2] ? " ✅" : " ❌"}` : "post-checklist: ?";
const autoFail = auto.length && auto[1] !== auto[2];

// ---- print -------------------------------------------------------------------------------
const out = [];
const P = (s) => out.push(s);
const bar = "═".repeat(80);
const icon = { PASS: "✅", VERIFY: "👁", FAIL: "❌" };
P("");
P(`🧾  FINAL QA — ${slug}   ·   ${new Date().toISOString().slice(0, 10)}`);
P(bar);
for (const b of B) {
  const fixTag = b.fix === "EASY" ? "  🟢 EASY-FIX" : b.fix === "EXEC" ? "  🔴 EXEC-DECISION" : "";
  P(`${icon[b.status]} ${String(b.n).padStart(2)} ${b.title.padEnd(24)} ${b.detail}${fixTag}`);
  for (const v of b.verify) P(`        👁 ${v}`);
}
P(bar);
P(autoLine + "   (rolls up the AUTO rows behind blocks 6/7/9/11)");

const hardBlocks = B.filter((b) => [1, 2, 4, 5, 8, 10, 12].includes(b.n));
const hardGreen = hardBlocks.filter((b) => b.status === "PASS").length;
const hardFail = B.filter((b) => b.status === "FAIL");
const execFails = hardFail.filter((b) => b.fix === "EXEC");
const easyFails = hardFail.filter((b) => b.fix !== "EXEC");
const verifyCount = B.filter((b) => b.status === "VERIFY").length;

let verdict;
if (hardFail.length === 0 && !autoFail) verdict = "✅ SHIP-READY  (all HARD blocks green · answer every 👁 row + paste evidence)";
else if (easyFails.length || autoFail) verdict = `🟢 FIX-FIRST  (${easyFails.length + (autoFail ? 1 : 0)} easy-fix open → fix + re-run qa)`;
else verdict = `🔴 EXEC-DECISION  (${execFails.length} owner-judgment item(s) — flag the numbers)`;

P("");
P(`QA SCORE: ${hardGreen}/${hardBlocks.length} HARD blocks green · ${verifyCount} judgment blocks · ${autoLine}`);
P(`VERDICT: ${verdict}`);
if (autoFail) P(`   ↳ post-checklist has ${auto[2] - auto[1]} failing AUTO row(s) — run blog:checklist to see which.`);
if (easyFails.length) P(`   ↳ easy-fix: ${easyFails.map((b) => b.title).join(", ")}`);
if (execFails.length) P(`   ↳ exec-decision: ${execFails.map((b) => `${b.title} (${b.detail})`).join(", ")}`);
P(bar);

const report = out.join("\n");
console.log(report);
fs.mkdirSync("qa-logs", { recursive: true });
fs.appendFileSync(`qa-logs/${slug}.md`, `\n\`\`\`\n${report}\n\`\`\`\n`);
console.log(`\n(logged → qa-logs/${slug}.md)`);
process.exit(hardFail.length || autoFail ? 1 : 0);
