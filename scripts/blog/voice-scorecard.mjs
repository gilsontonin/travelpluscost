#!/usr/bin/env node
// voice-scorecard.mjs — ONE-SCREEN regression dashboard for a blog post.
//
// WHY THIS EXISTS (owner, 2026-06-20): "every time I change one thing, another breaks"
// — add 'concise', lose 'funny'. Root cause: the MEASURED qualities (length, sentences/
// para, serp) auto-win because they fail the build; the JUDGMENT qualities (humour,
// warmth) are silent, so they regress unnoticed. This puts EVERY dimension on one screen
// with a floor each, so a drop in any one is visible BEFORE shipping. It does NOT replace
// serp-optimize / post-stats / ai-slop / post-checklist — it's the loop-back read on top
// of them, and it forces the humour line to carry EVIDENCE (a beat listed per section).
//
// Usage: node scripts/voice-scorecard.mjs <slug>
//   reads content/blog.ts (the post body) + scripts/serp-brief-<slug>.md (band + score,
//   if present). Read-only. Prints the scorecard; exits 1 if a HARD floor is breached.

import fs from "node:fs";

const slug = process.argv[2];
if (!slug) { console.error("Usage: node scripts/voice-scorecard.mjs <slug>"); process.exit(2); }

// ---- pull the post body out of content/blog.ts (same extraction as serp-optimize) -------
const src = fs.readFileSync("src/lib/posts.ts", "utf8");
const m = src.match(new RegExp(`slug:\\s*"${slug}"[\\s\\S]*?body:\\s*\`([\\s\\S]*?)\`,\\n`, "m"));
if (!m) { console.error(`Post "${slug}" not found in content/blog.ts`); process.exit(2); }
const body = m[1];

// ---- band + serp score from the brief, if it exists ------------------------------------
let band = null, serp = null;
const briefPath = `scripts/blog/serp-brief-${slug}.md`;
if (fs.existsSync(briefPath)) {
  const b = fs.readFileSync(briefPath, "utf8");
  const bm = b.match(/Target band:\s*\*\*(\d+)-(\d+)/);
  if (bm) band = { lo: +bm[1], hi: +bm[2] };
  const sm = b.match(/SEO SCORE:\s*(\d+)\/100/);
  if (sm) serp = +sm[1];
}

// ---- helpers ---------------------------------------------------------------------------
const wordsOf = (s) => (s.match(/[A-Za-z0-9'’-]+/g) || []).length;
const sentencesOf = (s) => (s.replace(/\b(Mr|Mrs|Ms|Dr|St|Hwy|approx|vs|a\.m|p\.m)\./gi, "$1")
  .match(/[^.!?]+[.!?]+(\s|$)/g) || [s]).filter((x) => x.trim().length > 1).length;
const syllables = (w) => {
  w = w.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  return (w.match(/[aeiouy]{1,2}/g) || []).length || 1;
};

// A "line" = a markdown block. Classify each.
const isDirective = (l) => /^::/.test(l.trim());
const isHeading = (l) => /^#{1,6}\s/.test(l.trim());
const isImage = (l) => /^!\[/.test(l.trim());
const isToC = (l) => /^- \[.*\]\(#/.test(l.trim());
const isStrip = (l) => /^\*\*[^*]+:\*\*/.test(l.trim()) && l.includes(" · ");   // quick-facts strip
const isCaption = (l) => /^\*Photo:/.test(l.trim()) || /^\*Cover/.test(l.trim());

// ---- split into sections by H2 ---------------------------------------------------------
const lines = body.split("\n");
const sections = [];
let cur = { title: "(intro)", h2: false, paras: [] };
let buf = [];
const flushPara = () => { const t = buf.join(" ").trim(); if (t) cur.paras.push(t); buf = []; };
for (const raw of lines) {
  const l = raw;
  if (l.trim() === "") { flushPara(); continue; }
  if (/^##\s/.test(l.trim())) { flushPara(); sections.push(cur); cur = { title: l.replace(/^##\s*/, "").trim(), h2: true, paras: [] }; continue; }
  if (isHeading(l) || isDirective(l) || isImage(l) || isToC(l) || isCaption(l)) { flushPara(); continue; }
  buf.push(l.trim());
}
flushPara(); sections.push(cur);

// ToC section is exempt from prose checks
const isToCSection = (s) => /table of contents/i.test(s.title);
const isFaq = (s) => /^faq/i.test(s.title) || /\bFAQ\b/.test(s.title);

// ---- FULL-BODY word count for the BAND line (match post-stats / serp, the authority) ----
// post-stats counts the whole body (headings, FAQ, strips) minus directives/image-markup/
// link URLs. Mirror that so this LENGTH verdict never contradicts the real gate.
const bandWords = wordsOf(
  body.split("\n")
    .filter((l) => !isDirective(l) && !isImage(l) && !isToC(l))
    .join("\n")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")   // [text](url) -> text (drop URL tokens)
    .replace(/[*`#>]/g, " ")                    // strip md markers
);

// ---- objective metrics over PROSE paragraphs (exclude strips) --------------------------
let totalWords = 0, totalSent = 0, totalSyll = 0, totalProseParas = 0;
let longParas = 0, oneSentParas = 0, totalBold = 0;
const allText = [];
for (const s of sections) {
  for (const p of s.paras) {
    if (isStrip(p)) continue;
    const pw = wordsOf(p); if (pw === 0) continue;
    totalProseParas++; totalWords += pw;
    const sc = sentencesOf(p); totalSent += sc;
    if (sc > 3) longParas++;
    if (sc === 1) oneSentParas++;
    for (const w of (p.match(/[A-Za-z'’-]+/g) || [])) totalSyll += syllables(w);
    totalBold += (p.match(/\*\*[^*]+\*\*/g) || []).length;
    allText.push(p);
  }
}
const fkGrade = totalSent && totalWords
  ? 0.39 * (totalWords / totalSent) + 11.8 * (totalSyll / totalWords) - 15.59 : 0;

// ---- ACTIVE VOICE (#3): passive-construction count (hint; over-counts predicate adjs) ----
// Reliable signal = be-verb + past-participle + " by " (agentful passive). Looser = be-verb
// + known past-participle. Reported as a HINT to eyeball, not an auto-judge.
const PP = "built|made|seen|done|taken|given|known|found|held|kept|told|brought|caught|sold|set|put|lost|grown|drawn|written|hidden|carved|ringed|wrapped|tucked|named|run|driven|left|paid|served|lined|surrounded|protected|located|filled|gone";
const passiveRe = new RegExp(`\\b(?:was|were|been|being)\\s+(?:\\w+ly\\s+)?(?:\\w+ed|${PP})\\b`, "gi");
const agentPassiveRe = new RegExp(`\\b(?:am|is|are|was|were|be|been|being)\\s+(?:\\w+ly\\s+)?(?:\\w+ed|${PP})\\s+by\\b`, "gi");

// ---- RFT / POSITIVE FRAMING (#2): avoidance-framing count (hint; some "when not to" is required) --
// Flags "don't / never / avoid / skip / instead of X" used as a DIRECTIVE — the thing RFT says to
// reframe into "do Y when Z". NOT all negation (contractions are fine); a few are mandatory
// ("tell people when not to"), so this is a confirm-you-reframed hint, not a fail.
const avoidanceRe = /\b(don't|do not|never|avoid|skip(?!\s+the\s+full)|no need to|instead of|rather than)\b/gi;

// ---- humour: WIT-MARKER hint per content section (NON-AUTHORITATIVE — a flatness flag) --
// Counts cheap signals a dry-plus beat usually leaves: a parenthetical aside, a comparison
// (like/than/as if), or a dash-aside punch. 0 markers in a section = LIKELY dry → list a
// beat or add one. This does NOT judge funny; it just surfaces sections to eyeball.
const witMarkers = (t) => {
  let n = 0;
  n += (t.match(/\([^)]{4,}\)/g) || []).length;                 // parenthetical aside
  n += (t.match(/\b(like|than|as if|as though)\b/gi) || []).length; // comparison
  n += (t.match(/ [-—] [a-z]/g) || []).length;                  // lowercase dash-aside punch
  return n;
};

// ---- print -----------------------------------------------------------------------------
const P = (s) => process.stdout.write(s + "\n");
const bar = "─".repeat(78);
let hardFail = [];

P("");
P(`🎚  VOICE SCORECARD — ${slug}`);
P(bar);

// LENGTH (band line uses the full-body count to match post-stats; prose count shown too)
let lenLine = `LENGTH       ${bandWords}w body (${totalWords}w prose)`;
if (band) {
  const verdict = bandWords < band.lo ? "▼ UNDER floor" : bandWords > band.hi ? "▲ OVER ceiling" : "✅ in band";
  lenLine += `   ·   band ${band.lo}-${band.hi}   ·   ${verdict}`;
  if (bandWords > band.hi || bandWords < band.lo) hardFail.push("length out of band — confirm vs post-stats");
} else lenLine += "   ·   (no serp-brief — run serp-optimize for the band)";
P(lenLine);

// CONCISE
const conciseOk = longParas === 0;
P(`CONCISE      ${longParas} para(s) >3 sentences   ·   ${oneSentParas}/${totalProseParas} one-sentence   ·   ${conciseOk ? "✅" : "❌ split the long ones"}`);
if (!conciseOk) hardFail.push(`${longParas} paragraph(s) over 3 sentences`);

// READING LEVEL
const grade = fkGrade.toFixed(1);
const gradeOk = fkGrade <= 11;
P(`READING      grade ${grade} (Flesch-Kincaid)   ·   target ≤10 (high-school)   ·   ${gradeOk ? "✅" : "⚠ simplify"}`);

// SERP + BOLD
P(`SERP         ${serp != null ? serp + "/100 " + (serp >= 90 ? "✅" : "❌ <90") : "(run serp-optimize)"}   ·   BOLD ${totalBold} answer-phrase bolds`);
if (serp != null && serp < 90) hardFail.push(`serp ${serp} <90`);

// ACTIVE VOICE (#3) + RFT FRAMING (#2) — measured over prose, reported as HINTS to eyeball
const proseAll = allText.join("  ");
const passiveAll = (proseAll.match(passiveRe) || []);
const agentPassive = (proseAll.match(agentPassiveRe) || []);
const per200 = totalWords ? (passiveAll.length / (totalWords / 200)) : 0;
const activeFlag = agentPassive.length > 0 ? "⚠ agentful passive — recast active" : (per200 > 4 ? "⚠ passive-heavy — eyeball" : "✅");
P(`ACTIVE (#3)  ~${passiveAll.length} passive-ish (${agentPassive.length} agentful "by")   ·   ${per200.toFixed(1)}/200w   ·   ${activeFlag}`);

const avoid = (proseAll.match(avoidanceRe) || []);
const framingFlag = avoid.length > 2 ? "⚠ confirm each is reframed (do Y when Z), not raw \"don't X\"" : "✅";
P(`RFT (#2)     ${avoid.length} avoidance-framing phrase(s) [${[...new Set(avoid.map((s) => s.toLowerCase()))].slice(0, 6).join(", ") || "none"}]   ·   ${framingFlag}`);
P(`             (some "when not to" is REQUIRED — this is a confirm-you-reframed hint, never a fail.)`);

P(bar);
P("HUMOUR — list ONE dry beat per content section (the teeth: a section with no beat = dry).");
P("         wit-markers = a flatness HINT only (parenthetical/comparison/dash-aside), NOT a judge.");
P("");
let drySections = 0;
for (const s of sections) {
  if (!s.h2 || isToCSection(s) || isFaq(s)) continue;
  const text = s.paras.filter((p) => !isStrip(p)).join(" ");
  const w = wordsOf(text);
  if (w < 40) continue;
  const wm = witMarkers(text);
  const flag = wm === 0 ? "⚠ LIKELY DRY — add/list a beat" : `${wm} wit-marker(s)`;
  if (wm === 0) drySections++;
  P(`  • ${s.title.slice(0, 52).padEnd(54)} ${String(w).padStart(4)}w   ${flag}`);
  P(`      beat → ____________________________________________________`);
}
if (drySections) P(`\n  ⚠ ${drySections} section(s) show ZERO wit-markers — eyeball them; that's where dry creeps in.`);

P(bar);
P("REGRESSION WATCH (fill in the run report):");
P("  • What rule/constraint changed this run? ________________________");
P("  • Which OTHER axes did you re-check vs the last good post, and did any drop? ____");
P("  • Log any rule-interaction to memory (e.g. concise-vs-humour).");
P(bar);

if (hardFail.length) {
  P(`❌ HARD floor breached: ${hardFail.join(" · ")}`);
  process.exit(1);
}
P(`✅ Objective floors hold. Now confirm a beat per section above (humour has no auto-judge).`);
