#!/usr/bin/env node
// serp-optimize.mjs v2 — cheap in-repo Surfer alternative (frequency-range targets).
//
// Evidence note (researched 2026): independent tests (Ahrefs, Search Engine Land) find
// content SCORES correlate only WEAKLY with rankings and are NOT proven causal. What has
// support is COVERAGE/intent — covering the subtopics & entities Google expects. So this
// tool is a gap-finder for coverage, not a score to chase. Surfer's own study = 0.28
// Spearman (their data scientist; weak). We use the brief; Claude judges meaning vs filler.
//
// v2 adds, from the real Surfer-panel comparison:
//   - FREQUENCY-RANGE TARGETS: "you use X 3×, top pages use it 8-13×" (not just present/absent)
//   - 30% prevalence threshold (was 50%) -> catches specific entities (fish, sub-spots)
//   - questions tier (competitor question-headings)
//   - exact-primary-phrase presence check
//   - outlier-aware length target
//
// Usage:
//   node scripts/serp-optimize.mjs "<keyword>" --urls "u1,u2,..." [--draft <slug>]
//   node scripts/serp-optimize.mjs --panel References/surfer/panel-<slug>.md --draft <slug>
//     ↳ PANEL MODE: scores the draft against SURFER'S OWN term panel (no fetching) — kills the
//       term-set mismatch, so any gap vs the real Surfer score is pure formula error.
//   tune: --min-pct 0.3  --lo-pctl 25  --hi-pctl 90   (calibration knobs)

import fs from "node:fs";
import { execSync } from "node:child_process";

const argv = process.argv.slice(2);
const flagVals = new Set(argv.flatMap((a, i) => (a.startsWith("--") ? [i + 1] : []))); // positions that are a flag's VALUE, not the positional keyword
let keyword = (argv.find((a, i) => !a.startsWith("--") && !flagVals.has(i)) ?? "").toLowerCase();
const get = (f, d = null) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
let urls = [];
if (get("--urls")) urls = get("--urls").split(",").map((s) => s.trim()).filter(Boolean);
if (get("--urls-file")) urls = fs.readFileSync(get("--urls-file"), "utf8").split(/\s+/).map((s) => s.trim()).filter(Boolean);
const draftSlug = get("--draft");
const MIN_PCT = parseFloat(get("--min-pct", "0.25"));  // term must appear in >= this share of pages (0.25 surfaces more entities for the SEO-density dial)
const LO_PCTL = parseInt(get("--lo-pctl", "25"));      // target-range low percentile of per-page counts
const HI_PCTL = parseInt(get("--hi-pctl", "90"));      // target-range high percentile
const TARGET_SCORE = parseInt(get("--target-score", "90")); // bar on the RAW score — maximize coverage (owner directive: aim 90+, stuffing accepted). Raw 90 = nearly every term range + heading covered. ≈Surfer is shown alongside as the calibrated estimate.
const SCORE_TERMS = parseInt(get("--score-terms", "81")); // Surfer consistently scores against 81 terms — match it exactly
// Calibration: our RAW score runs ~27 over Surfer SEO, dead consistent across paired posts
// (red-sand 86→59, luau 82→55). So calibrated ≈ raw + offset → displays as Surfer's real number.
// Refit slope/offset as more pairs land in References/surfer/calibration-log.md.
const CAL_SLOPE = parseFloat(get("--cal-slope", "1"));
const CAL_OFFSET = parseFloat(get("--cal-offset", get("--panel") ? "0" : "-30")); // -30 ROUGH (fits red-sand raw91→S59 on the EXTRACTION path); PANEL mode has a different raw scale (Surfer's curated terms, not our 81) so it starts UNCALIBRATED (0) — log panel-score↔Surfer pairs in the calibration log to fit its own offset.
const PANEL_FILE = get("--panel"); // Surfer panel file (References/surfer/panel-<slug>.md) — see usage
const PANEL_WEIGHT = get("--panel-weight", "equal"); // equal | rank (rank = top-of-panel terms count more; the C-phase experiment in References/surfer/experiment-protocol.md decides which)
// Component weights — surfer-fit.mjs refines these from perturbation-experiment data.
const W_BODY = parseFloat(get("--w-body", "0.5"));
const W_HEAD = parseFloat(get("--w-head", "0.35"));
const W_EXACT = parseFloat(get("--w-exact", "0.15"));

// NO PINNING — always pass TODAY's competitors (fresh WebSearch each run). We deliberately do
// NOT cache/pin the competitor set: a stale pin would silently make us optimize against a SERP
// that has moved on (last year's "winners" may be page 75 now), and we'd never know why a post
// stalled. Always-fresh is the safe default. For stable before/after within one session, just
// reuse the SAME --urls string; for a later rewrite, WebSearch fresh.
if (PANEL_FILE) {
  if (!draftSlug) { console.error("--panel requires --draft <slug> (panel mode scores an existing post against Surfer's own term panel)."); process.exit(1); }
} else if (!keyword || urls.length === 0) {
  console.error('Usage: node scripts/serp-optimize.mjs "<keyword>" --urls "u1,u2,..." [--draft <slug>]\n       node scripts/serp-optimize.mjs --panel References/surfer/panel-<slug>.md --draft <slug>\nPass TODAY\'s top ~10 genuine blog competitors (no pinning — never optimize against a stale SERP).');
  process.exit(1);
}

const STOP = new Set(`a about above after again against all am an and any are aren't as at be because been before being below between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each few for from further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more most mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own same shan't she she'd she'll she's should shouldn't so some such than that that's the their theirs them themselves then there there's these they they'd they'll they're they've this those through to too under until up very was wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours yourself yourselves get got also just like will may one two much many well via etc per ll re ve need don ll`.split(/\s+/));
const NOISE = new Set("home menu search subscribe newsletter cookie cookies privacy policy terms contact about login signup account share facebook twitter instagram pinterest email print comment comments reply read posts post tag tags category categories author related advertisement sponsored affiliate disclosure copyright reserved click here view more click skip nav navigation".split(/\s+/));
// FILLER: contentless mood/process/positional words that flood the term table with
// "correlation SEO" noise (no ranking evidence). Filtering them = the Claude-layer
// judgment encoded, so the table surfaces real entities/subtopics, not stuffing words.
for (const w of `even long sure nice done looking making start started similar close closer point points list easily careful chance bottom follow enter covered seen hot explore explored great good best better place places thing things way ways take taken find found see know knows want really very around kind sort lots bit plenty able far big small low full part parts side sides right left top three four five several heres simply actually definitely truly perfect amazing beautiful stunning vibrant gorgeous wonderful fantastic incredible breathtaking favorite popular unique special nice enjoy lovely`.split(/\s+/)) STOP.add(w);
const isWord = (t) => t.length >= 3 && /[a-z]/.test(t) && !STOP.has(t) && !NOISE.has(t);

// Mobile UA — Surfer analyzes the MOBILE-rendered SERP/pages (Google's mobile-first index).
// Most blogs are responsive (same HTML), so term counts barely move, but this matches Surfer
// and catches any site that serves a lighter mobile page.
const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
function fetchHtml(url) { try { return execSync(`curl -sL -A ${JSON.stringify(MOBILE_UA)} --max-time 25 ${JSON.stringify(url)}`, { encoding: "utf8", maxBuffer: 25 * 1024 * 1024 }); } catch { return ""; } }
function clean(html) {
  let h = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<noscript[\s\S]*?<\/noscript>/gi, " ").replace(/<nav[\s\S]*?<\/nav>/gi, " ").replace(/<header[\s\S]*?<\/header>/gi, " ").replace(/<footer[\s\S]*?<\/footer>/gi, " ").replace(/<form[\s\S]*?<\/form>/gi, " ");
  const outline = [...h.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ lvl: +m[1], text: m[2].replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim() })).filter((o) => o.text && o.text.length < 130);
  const headings = outline.map((o) => o.text);
  const imgCount = (h.match(/<img\b/gi) || []).length;
  const pCount = (h.match(/<p\b/gi) || []).length;
  const text = h.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
  return { text, headings, outline, imgCount, pCount, chars: text.length };
}
// Normalize Hawaiian diacritics first: strip macrons (NFD) and the okina (ʻ ' ' `) WITHOUT
// inserting a space, so "Waiʻanapanapa"/"Haleakalā"/"Keʻanae" stay ONE token (not "wai anapanapa").
const tokenize = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[ʻʼ‘’'`]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).map((t) => t.replace(/^[-]+|[-]+$/g, "")).filter(Boolean);
function ngrams(tokens, n) { const out = []; for (let i = 0; i + n <= tokens.length; i++) { const g = tokens.slice(i, i + n); if (g.every(isWord)) out.push(g.join(" ")); } return out; }
const pctl = (arr, q) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor((q / 100) * s.length))]; };

// ---- Surfer panel file (panel mode) -------------------------------------------
// Format (see References/surfer/panel-red-sand-beach-hana-maui.md): "@words: 1900-2200" style
// directives; "term lo-hi" body-term lines IN PANEL ORDER; "h: term" heading-tab terms.
const norm = (s) => tokenize(s).join(" "); // same diacritic/okina pipeline as the corpus
const countIn = (text, term) => term ? (text.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) || []).length : 0;
function parsePanel(file) {
  const meta = {}; const terms = []; const headingTerms = [];
  const range = (s) => { s = s.trim(); let m;
    if ((m = s.match(/^(\d+)\s*-\s*(\d+)$/))) return [+m[1], +m[2]];
    if ((m = s.match(/^(\d+)\s*\+$/))) return [+m[1], Infinity];
    if ((m = s.match(/^(\d+)$/))) return [+m[1], +m[1]];
    return null; };
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    let m;
    if ((m = line.match(/^@(\w+):\s*(.+)$/))) { const k = m[1].toLowerCase(); if (k === "keyword") meta.keyword = m[2].trim().toLowerCase(); else meta[k] = range(m[2]); continue; }
    if ((m = line.match(/^h:\s*(.+)$/i))) { headingTerms.push(norm(m[1])); continue; }
    if ((m = line.match(/^(.+?)[\s:]+(\d+(?:\s*-\s*\d+|\s*\+)?)$/))) { const r = range(m[2]); if (r) { terms.push({ term: norm(m[1]), lo: r[0], hi: r[1] }); continue; } }
    console.error(`  ⚠ panel line not parsed, skipped: "${line}"`);
  }
  return { meta, terms, headingTerms };
}
const panel = PANEL_FILE ? parsePanel(PANEL_FILE) : null;
if (panel) {
  if (!keyword) keyword = panel.meta.keyword || "";
  if (!keyword) { console.error("Panel mode needs the keyword — pass it as an arg or add '@keyword: ...' to the panel file."); process.exit(1); }
  console.error(`Panel: ${panel.terms.length} terms, ${panel.headingTerms.length} heading terms (${PANEL_FILE})`);
}

const docs = [];
if (!panel) {
  console.error(`Fetching ${urls.length} pages…`);
  for (const url of urls) {
    const html = fetchHtml(url);
    if (!html || html.length < 500) { console.error(`  ✗ ${url} (blocked/empty)`); continue; }
    const { text, headings, outline, imgCount, pCount, chars } = clean(html);
    const tokens = tokenize(text);
    if (tokens.length < 200) { console.error(`  ✗ ${url} (${tokens.length}w)`); continue; }
    docs.push({ url, words: tokens.length, tokens, text, headings, outline, headingsN: headings.length, imgCount, pCount, chars });
    console.error(`  ✓ ${url} (${tokens.length}w, ${headings.length} headings)`);
  }
  if (!docs.length) { console.error("No pages fetched — all URLs blocked/empty. Try different competitor URLs."); process.exit(1); }
  if (docs.length < 4) console.error(`⚠  Only ${docs.length} page(s) fetched — the brief will be THIN and unreliable (term ranges need several pages). Re-run with more or different competitor URLs before trusting it.`);
}
const N = docs.length;

// per-doc count maps for uni/bi/tri
function gramCounts(tokens, n) { const grams = n === 1 ? tokens.filter(isWord) : ngrams(tokens, n); const m = new Map(); for (const g of grams) m.set(g, (m.get(g) || 0) + 1); return m; }
const docGrams = docs.map((d) => ({ 1: gramCounts(d.tokens, 1), 2: gramCounts(d.tokens, 2), 3: gramCounts(d.tokens, 3) }));

// draft
let draft = null;
if (draftSlug) {
  const src = fs.readFileSync("src/lib/posts.ts", "utf8");
  const m = src.match(new RegExp(`slug:\\s*"${draftSlug}"[\\s\\S]*?body:\\s*\`([\\s\\S]*?)\`,\\n`, "m"));
  if (!m) console.error(`Draft "${draftSlug}" not found.`);
  else {
    const body = m[1].replace(/::\w+[^\n]*/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[#*>`_]/g, " ");
    const tk = tokenize(body);
    const headingsN = (m[1].match(/^ {0,3}#{2,4} /gm) || []).length;
    const headingTexts = (m[1].match(/^ {0,3}#{2,4} .+$/gm) || []).map((h) => h.replace(/^ {0,3}#{2,4}\s+/, "").toLowerCase());
    const images = (m[1].match(/!\[/g) || []).length + (m[1].match(/::(infographic|tour|directions)/g) || []).length;
    const paras = m[1].split(/\n\n+/).filter((p) => p.trim().length > 40).length;
    draft = { words: tk.length, raw: body.toLowerCase(), norm: tk.join(" "), headings: headingsN, headingTexts, headNorm: headingTexts.map((h) => tokenize(h).join(" ")), images, paras, chars: body.length, g: { 1: gramCounts(tk, 1), 2: gramCounts(tk, 2), 3: gramCounts(tk, 3) } };
  }
}

// build term table for a given n
function buildTerms(n) {
  const df = new Map(); // term -> [per-doc counts among docs that contain it]
  for (let i = 0; i < N; i++) for (const [g, c] of docGrams[i][n]) { if (!df.has(g)) df.set(g, []); df.get(g).push(c); }
  const minDocs = Math.max(2, Math.ceil(N * MIN_PCT));
  const rows = [];
  for (const [term, counts] of df) {
    if (counts.length < minDocs) continue;
    const lo = Math.max(1, Math.round(pctl(counts, LO_PCTL)));
    const hi = Math.max(lo, Math.round(pctl(counts, HI_PCTL)));
    const draftN = draft ? (draft.g[n].get(term) || 0) : null;
    let status = "  ", prio = 9;
    if (draft != null) {
      if (draftN === 0) { status = "❌ add"; prio = 0; }
      else if (draftN < lo) { status = "⚠ more"; prio = 1; }
      else if (draftN > hi) { status = "↑ over"; prio = 3; }
      else { status = "✅ ok"; prio = 2; }
    }
    rows.push({ term, df: counts.length, pct: Math.round((counts.length / N) * 100), lo, hi, draftN, status, prio });
  }
  // gaps first (add, then more), then by prevalence
  rows.sort((a, b) => a.prio - b.prio || b.pct - a.pct || (b.lo - (b.draftN || 0)) - (a.lo - (a.draftN || 0)));
  return rows;
}
const U = buildTerms(1), B = buildTerms(2), T = buildTerms(3);

// ---- OUR local SEO score (reverse-engineered Surfer SEO dial) ----------------
// Weighted term coverage + exact-phrase presence. Each term's weight = competitor
// prevalence (df/N), with phrases boosted (more specific = juicier). Per-term score:
// in-range-or-over = 1, under = have/lo (partial), missing = 0. This lets us iterate a
// draft to a FIXED bar locally — no Surfer round-trip — and the gap list is ranked by
// the score points each fix buys, so we add juicy entities/core terms first and only
// dip into filler to top up to threshold. Calibrate TARGET_SCORE against real Surfer
// scores as they accrue (red-sand: SEO 39 first draft ≈ our ~47).
// competitor heading prevalence: # of competitor pages using a term in ANY heading.
// Headings are Surfer's highest-weighted signal (keyword in an H2 >> in body) — modelling
// it is what makes our score track Surfer (validated: red-sand our 86 vs Surfer SEO 59 —
// the whole gap was heading coverage).
function headingDf(term) { let n = 0; for (const d of docs) if (d.headings.some((h) => h.toLowerCase().includes(term))) n++; return n; }
function inDraftHeading(term) { return !!draft && draft.headingTexts.some((h) => h.includes(term)); }

function scoreDraft() {
  if (!draft) return null;
  const scored = [...U, ...B, ...T]
    .map((r) => ({ ...r, w: (r.df / N) * (r.term.includes(" ") ? 1.3 : 1), hdf: headingDf(r.term) }))
    .sort((a, b) => b.w - a.w)
    .slice(0, SCORE_TERMS);
  // (1) BODY term coverage
  let wSum = 0, sSum = 0;
  const gaps = [];
  for (const r of scored) {
    const c = r.draftN || 0;
    // under = partial credit; in-range = full; OVER = graduated penalty (Surfer penalizes stuffing
    // HARD — e.g. exact phrase 7× vs target 1 lost points). The further over the ceiling, the worse.
    const ts = c < r.lo ? (c > 0 ? c / r.lo : 0) : c > r.hi ? Math.max(0.4, 1 - 0.5 * (c - r.hi) / Math.max(r.hi, 1)) : 1;
    wSum += r.w; sSum += r.w * ts;
    if (ts < 1) gaps.push({ term: r.term, lo: r.lo, hi: r.hi, have: c, gain: r.w * (1 - ts), missing: c === 0, over: c > r.hi });
  }
  const bodyCov = wSum ? sSum / wSum : 0;
  // (2) HEADING coverage — terms competitors put in headings (≥40% of pages), credited
  // ONLY if they appear in OUR H2/H3s. The big lever Surfer rewards.
  // Phrase subtopics competitors put in headings (≥2 pages). Phrases only — a single
  // common word like "beach" in a heading is too generous to credit; the distinct
  // multi-word subtopics (kaihalulu beach, red sand beach trail, ocean conditions) are
  // what Surfer's heading dial actually rewards.
  const headTerms = scored.filter((r) => r.term.includes(" ") && r.hdf >= 2);
  let hwSum = 0, hsSum = 0;
  const headGaps = [];
  for (const r of headTerms) {
    const hw = r.hdf / N;
    const got = inDraftHeading(r.term) ? 1 : 0;
    hwSum += hw; hsSum += hw * got;
    if (!got) headGaps.push({ term: r.term, hdf: r.hdf, pct: Math.round((r.hdf / N) * 100), w: hw });
  }
  const headCov = hwSum ? hsSum / hwSum : 1; // no heading-terms surfaced → don't penalize
  // (3) exact primary phrase
  const exactRe = new RegExp(keyword.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "\\s+"), "g");
  const exactN = (draft.raw.match(exactRe) || []).length;
  // Presence = good (headings legitimately repeat it). NB: Surfer wants the exact phrase ~1× in
  // BODY but rewards it in headings; our raw string conflates the two, so we don't penalize here —
  // body over-use is a manual watch-out (the gap list can't catch a 5-gram).
  const exactScore = exactN >= 1 ? 1 : 0;
  const score = Math.round(100 * (W_BODY * bodyCov + W_HEAD * headCov + W_EXACT * exactScore));
  const surfer = Math.max(0, Math.min(100, Math.round(score * CAL_SLOPE + CAL_OFFSET))); // calibrated ≈ Surfer SEO
  gaps.sort((a, b) => b.gain - a.gain);
  for (const g of gaps) g.pts = 100 * W_BODY * (g.gain / wSum);
  headGaps.sort((a, b) => b.w - a.w);
  return { score, surfer, bodyCov, headCov, exactN, exactScore, gaps, headGaps };
}

// PANEL MODE scorer — same formula, but the term set/ranges are SURFER'S OWN panel (not our
// extraction), and counts come from raw phrase matching (panel terms can be 4+ grams).
function scoreDraftPanel() {
  if (!draft) return null;
  const n = panel.terms.length;
  const scored = panel.terms.map((t, i) => ({ ...t, w: PANEL_WEIGHT === "rank" ? 1 - 0.6 * (n > 1 ? i / (n - 1) : 0) : 1, draftN: countIn(draft.norm, t.term) }));
  let wSum = 0, sSum = 0;
  const gaps = [];
  for (const r of scored) {
    const c = r.draftN;
    const over = r.hi !== Infinity && c > r.hi;
    const ts = c < r.lo ? (c > 0 ? c / r.lo : 0) : over ? Math.max(0.4, 1 - 0.5 * (c - r.hi) / Math.max(r.hi, 1)) : 1;
    wSum += r.w; sSum += r.w * ts;
    if (ts < 1) gaps.push({ term: r.term, lo: r.lo, hi: r.hi, have: c, gain: r.w * (1 - ts), missing: c === 0, over });
  }
  const bodyCov = wSum ? sSum / wSum : 0;
  let hwSum = 0, hsSum = 0;
  const headGaps = [];
  for (const term of panel.headingTerms) {
    const got = draft.headNorm.some((h) => h.includes(term)) ? 1 : 0;
    hwSum += 1; hsSum += got;
    if (!got) headGaps.push({ term });
  }
  const headCov = hwSum ? hsSum / hwSum : 1;
  const exactN = countIn(draft.norm, norm(keyword));
  const exactScore = exactN >= 1 ? 1 : 0;
  const score = Math.round(100 * (W_BODY * bodyCov + W_HEAD * headCov + W_EXACT * exactScore));
  const surfer = Math.max(0, Math.min(100, Math.round(score * CAL_SLOPE + CAL_OFFSET)));
  gaps.sort((a, b) => b.gain - a.gain);
  for (const g of gaps) g.pts = 100 * W_BODY * (g.gain / wSum);
  return { score, surfer, bodyCov, headCov, exactN, exactScore, gaps, headGaps };
}
const SEO = panel ? scoreDraftPanel() : scoreDraft();

// ---- PANEL MODE brief (short — score + gaps + structure vs Surfer's targets) ----
if (panel) {
  if (!draft) { console.error("Panel mode: draft not found in content/blog.ts — check the slug."); process.exit(1); }
  const out = [];
  const P = (s = "") => out.push(s);
  P(`# Surfer-panel brief — ${keyword}`);
  P(`_Scored against SURFER'S OWN panel (${panel.terms.length} terms, ${panel.headingTerms.length} heading terms · weight: ${PANEL_WEIGHT}) from \`${PANEL_FILE}\`. Term-set mismatch eliminated — any gap vs the real Surfer score is pure FORMULA error; log the pair in References/surfer/calibration-log.md and refit with scripts/surfer-fit.mjs._`);
  P("");
  P(`## 🎯 SEO SCORE vs panel: ${SEO.score}/100${CAL_OFFSET === 0 ? " — ⚠ panel-mode calibration PENDING (raw shown; log real Surfer pairs, then pass --cal-offset)" : ` (≈ Surfer ${SEO.surfer})`}`);
  P(`_Body **${Math.round(SEO.bodyCov * 100)}%** (×${W_BODY}) · Heading **${Math.round(SEO.headCov * 100)}%** (×${W_HEAD}) · exact phrase **${SEO.exactN}×** (×${W_EXACT})_`);
  if (SEO.headGaps.length) {
    P("");
    P(`### 🔑 Surfer heading terms missing from our H2/H3s — fix FIRST`);
    for (const g of SEO.headGaps) P(`- \`${g.term}\``);
  }
  if (SEO.gaps.length) {
    P("");
    P(`### Body terms vs Surfer's ranges (highest-value first)`);
    for (const g of SEO.gaps.slice(0, 30)) P(`- ${g.over ? "**TRIM** (over — Surfer penalizes stuffing)" : g.missing ? "**ADD**" : "more"} \`${g.term}\` — have ${g.have}, ${g.over ? `≤ ${g.hi}` : `aim ${g.lo}`}  *(+${g.pts.toFixed(1)} pts)*`);
  }
  P("");
  P(`## Structure vs Surfer's targets`);
  const sline = (label, target, val) => { if (!target) return; const [lo, hi] = target; P(`- **${label}:** target ${lo}${hi === Infinity ? "+" : `-${hi}`} · you **${val}** ${val < lo ? "⚠ under" : hi !== Infinity && val > hi ? "↑ over" : "✅"}`); };
  sline("Words", panel.meta.words, draft.words);
  sline("Headings (H2-H4)", panel.meta.headings, draft.headings);
  sline("Paragraphs", panel.meta.paragraphs, draft.paras);
  sline("Images", panel.meta.images, draft.images);
  const file = `scripts/blog/serp-brief-${draftSlug}-panel.md`;
  fs.writeFileSync(file, out.join("\n"));
  console.error(`\nWrote ${file} | panel score ${SEO.score} (≈Surfer ${SEO.surfer}) | ${SEO.gaps.length} body gaps | ${SEO.headGaps.length} heading gaps`);
  process.exit(0);
}

// questions from headings
const qWords = /^(who|what|when|where|why|how|is|are|can|do|does|should|would|will|which)\b/i;
const qJunk = /pingback|tripster|tell us|did we miss|are you (a|staying|ready)|subscribe|comment|newsletter|sign up|leave a/i;
const qset = new Map();
for (const d of docs) for (const h of d.headings) { if (!h.endsWith("?") || !qWords.test(h) || qJunk.test(h) || h.length < 14) continue; const k = h.toLowerCase().replace(/\s+/g, " "); if (!qset.has(k)) qset.set(k, h); }

// headings inventory
const hc = new Map();
for (const d of docs) for (const h of d.headings) { const k = h.toLowerCase(); if (!hc.has(k)) hc.set(k, { n: 0, ex: h }); hc.get(k).n++; }
const headings = [...hc.values()].sort((a, b) => b.n - a.n);

// length (outlier-aware) — this is THE standard, calibrated to match the Surfer editor.
// Surfer outputs a word RANGE (e.g. red-sand: 1.9-2.2K), so we express a BAND, not a point.
const wc = docs.map((d) => d.words).sort((a, b) => a - b);
const median = wc[Math.floor(wc.length / 2)], avg = Math.round(wc.reduce((s, x) => s + x, 0) / wc.length), max = wc[wc.length - 1];
const outlier = max >= 1.5 * median;               // a competitor >=1.5x the median is padding — EXCLUDE it
const target = outlier ? Math.round(median * 1.15) : Math.round(avg * 1.15); // working number (preserved)
// The band: floor = competitor median (never write below it — "hit their word count"); ceiling =
// the longest GENUINE competitor (the outlier is dropped, you match its coverage, not its length).
const genuineLens = outlier ? wc.filter((w) => w < 1.5 * median) : wc;
const bandLo = Math.round(median);
const bandHi = Math.round(Math.max(target, genuineLens[genuineLens.length - 1] || target));

// ---- write brief ----
const slugOut = draftSlug || keyword.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const out = [];
const P = (s = "") => out.push(s);
P(`# SERP brief v2 — ${keyword}`);
P(`_${docs.length}/${urls.length} pages · min-pct ${MIN_PCT} · range ${LO_PCTL}-${HI_PCTL}pctl · mobile UA · gap-finder + local SEO score_`);
P("");
if (SEO) {
  const pass = SEO.score >= TARGET_SCORE;
  P(`## 🎯 SEO SCORE: ${SEO.score}/100 (≈ Surfer ${SEO.surfer}) — ${pass ? `✅ PASS (raw ≥${TARGET_SCORE})` : `❌ raw below ${TARGET_SCORE} — keep going`}`);
  P(`_Body **${Math.round(SEO.bodyCov * 100)}%** (×0.50) · **Heading ${Math.round(SEO.headCov * 100)}%** (×0.35 — biggest lever) · exact phrase **${SEO.exactN}×** (×0.15). **AIM 90+: match competitor LENGTH** (our biggest gap — write to their word count), hit EVERY term range (fix all unders, trim overs), put EVERY heading phrase in an H2/H3, add every entity. ≈Surfer ${SEO.surfer} is the calibrated estimate (high-end unfit — measure in Surfer)._`);
  if (SEO.headGaps.length) {
    P("");
    P(`### 🔑 PUT THESE KEYWORDS IN YOUR H2/H3 HEADINGS — do this FIRST (biggest score lever)`);
    P(`Competitors put these in their headings and we don't. Build or rename H2s/H3s around them — a keyword in a heading is worth far more than in body:`);
    for (const g of SEO.headGaps.slice(0, 14)) P(`- \`${g.term}\` — in **${g.pct}%** of competitor headings, missing from ours`);
  }
  if (!pass) {
    P("");
    P(`### Then body density — add these (highest-value first; juicy entities/core before filler):`);
    for (const g of SEO.gaps.slice(0, 24)) {
      const act = g.over ? `**TRIM** (over — Surfer penalizes stuffing)` : g.missing ? "**ADD**" : "more";
      const aim = g.over ? `≤ ${g.hi}` : `aim ${g.lo}`;
      P(`- ${act} \`${g.term}\` — have ${g.have}, ${aim}  *(+${g.pts.toFixed(1)} pts)*`);
    }
    P(`_Add from the top down until ≥ ${TARGET_SCORE}; skip pure mood-filler (stunning/vibrant) — everything else is fair game._`);
  }
  P("");
}
P(`## Length`);
P(`- Competitors: avg **${avg}**, median **${median}**, max **${max}**${outlier ? " (outlier — excluded from the band)" : ""}.`);
P(`- Target band: **${bandLo}-${bandHi} words** (working target ~**${target}** = median×1.15; match the competitor median, never write below it)${draft ? ` · your draft: **${draft.words}** ${draft.words > bandHi ? "▲ OVER — trim/merge, don't deepen" : draft.words < bandLo ? "⚠ under" : "✅ in band"}` : ""}.`);
P(`- _The band is the Surfer-faithful form: floor = the competitor median, ceiling = the longest GENUINE competitor. The >=1.5x-median outlier is excluded — match its coverage, not its padding. Over the ceiling is the overshoot bug, not depth._`);
P("");
// STRUCTURE (the dimension Surfer scores beyond terms)
P(`## Structure`);
const srng = (key, label, dval, perf) => { const a = docs.map((d) => d[key]).sort((x, y) => x - y); const lo = a[0], hi = a[a.length - 1], med = a[Math.floor(a.length / 2)]; P(`- **${label}:** competitors ${lo}-${hi} (median ${med})${draft ? ` · you **${dval}** ${dval < lo ? "⚠ under" : dval > hi ? "↑ over" : "✅"}` : ""}${perf ? ` — ${perf}` : ""}`); };
srng("headingsN", "Headings (H2-H4)", draft && draft.headings);
srng("imgCount", "Images", draft && draft.images, "we cap images for Lighthouse/LCP — native infographics instead; do NOT chase 25+");
srng("pCount", "Paragraphs", draft && draft.paras);
srng("chars", "Characters", draft && draft.chars);
P("");
// UPFRONT INTENT (AI Search dial — hardcoded checklist)
P(`## Upfront intent (does your intro do all four?)`);
["Answer the main question", "Say what the page is about", "Identify who it's for", "Explain why it matters to the reader"].forEach((x) => P(`- [ ] ${x}`));
P("");
// FACT CANDIDATES (AI Search / GEO dial — Claude picks the missing, citable ones)
P(`## Fact candidates (citable claims competitors make — Claude judges which you're missing)`);
P(`_Sentences with numbers/specifics from the corpus. The GEO/answer-engine layer: state the discrete facts AI engines quote._`);
const facts = new Set();
const FACTNOISE = /cookie|subscribe|copyright|comment|©|\bclick\b|\bmenu\b|read more|:has\(|baseline since|old width|dead space|voice mele|read the transcript|\b0:0|where are you staying|free hawaii|take a quiz|verified by|select an option|newsletter|founder|certified|dotm|hofstra|normal\.dot/i;
for (const d of docs) for (const s of d.text.split(/(?<=[.!?])\s+/)) { const t = s.trim(); if (t.length > 35 && t.length < 170 && /\b\d/.test(t) && !FACTNOISE.test(t)) facts.add(t); }
[...facts].slice(0, 30).forEach((f) => P(`- ${f}`));
P("");
if (draft) {
  const kc = (draft.raw.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  P(`## Exact primary phrase`);
  P(`- "${keyword}" appears **${kc}×** in your draft ${kc === 0 ? "❌ — add it verbatim at least once (title/intro/H2)" : "✅"}.`);
  P("");
}
function tbl(title, rows, n) {
  P(`## ${title}`);
  P(draft ? `_❌ add · ⚠ use more (below range) · ✅ in range · ↑ over_` : "");
  P(`| ${draft ? "status · " : ""}term | top pages | target/pg${draft ? " | you" : ""} |`);
  P(`|---|---|---|${draft ? "---|" : ""}`);
  rows.slice(0, n).forEach((r) => P(`| ${draft ? r.status + " · " : ""}${r.term} | ${r.pct}% (${r.df}/${N}) | ${r.lo}-${r.hi}${draft ? ` | ${r.draftN}` : ""} |`));
  P("");
}
tbl("Single terms", U, 45);
tbl("2-word phrases", B, 30);
tbl("3-word phrases", T, 18);

P(`## Questions competitors answer (FAQ / section seeds)`);
P(`_From competitor headings; cross-check live PAA. Add the ones you don't already answer._`);
[...qset.values()].slice(0, 20).forEach((q) => P(`- ${q}`));
P("");
P(`## Competitor headings (subtopics — most-shared first)`);
headings.slice(0, 30).forEach((h) => P(`- ${h.n > 1 ? `**(${h.n}×)** ` : ""}${h.ex}`));
P("");
// Competitor outlines (per-page H1-Hn) — what Surfer's "Competitors' Outlines" shows.
// Also reveals WHY structure targets are inflated: nav/related/comments/footer headings count too.
const CHROME = /\b(comments?|subscribe|newsletter|related|you may|featured|policies|resources|destinations|instagram|sign up|leave a reply|favou?rite|top posts|popular|travel guides|our company|forecast|weather|listen|select an|recap|start a blog|disclosure|menu|stay updated|thank you|hey there|nearby|reviews?|gallery|about us|follow us|^search$|^about$|^explore)\b/i;
P(`## Competitor outlines (their H1-Hn — model the structure, ignore the chrome)`);
P(`_⟵ = likely nav/related/comments/footer junk; it inflates Surfer's heading/word/image targets, so don't chase those numbers._`);
for (const d of docs) {
  const junk = d.outline.filter((o) => CHROME.test(o.text)).length;
  P(`\n**${d.url}** _(${d.outline.length} H-tags, ~${junk} chrome)_`);
  d.outline.slice(0, 26).forEach((o) => P(`${"  ".repeat(Math.max(0, o.lvl - 1))}- h${o.lvl} ${o.text}${CHROME.test(o.text) ? "  ⟵" : ""}`));
}
P("");
P(`## How to use (Claude layer)`);
P(`- ❌/⚠ = candidates, not orders. Add the *meaningful* ones (real entities/subtopics/questions); skip mood-filler (vibrant/stunning/great) & generic words even if "under".`);
P(`- Coverage & intent have evidence; the density score does not — never stuff to hit a range.`);

const file = `scripts/blog/serp-brief-${slugOut}.md`;
fs.writeFileSync(file, out.join("\n"));
console.error(`\nWrote ${file} | target ~${target}w | ${U.length}u/${B.length}b/${T.length}t terms | ${qset.size} questions${draft ? ` | gaps: ${U.filter(r=>r.prio<=1).length+B.filter(r=>r.prio<=1).length+T.filter(r=>r.prio<=1).length}` : ""}`);
