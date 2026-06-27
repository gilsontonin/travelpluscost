# Bootleg Surfer — reverse-engineered SEO content system

> **⛔ 2026-06-11 — THIS SYSTEM IS NOW THE ONLY OPTIMIZER (Surfer access ended; owner went fully
> free).** Every "score it in Surfer / paste into Surfer / panel mode / calibration" step in this
> doc is DORMANT — skip them. The live loop is: STEP 1-4 fresh-SERP brief → raw SEO SCORE ≥ 90 →
> STEP 5-6 gates → **GSC rank over 4-8 weeks is the verdict** (monthly /site-health). The
> reverse-engineering kit (STEP 4c) stays shelved for a possible one-off Surfer month.

A free, in-repo replacement for Surfer SEO's content optimization. Validated across 5 posts
(best: **best-beaches-in-maui +13 overall / +11 SEO / +16 AI Search**, no stuffing).

**Consumers:** `write-blog-post` (new posts) and **`review-blog` v2** (existing posts — runs this
same pipeline to re-optimize old content to raw ≥90, striking-distance first via `gsc-rank.mjs`).

**This doc has two layers:** PART 1 is an **AGENT RUNBOOK** (imperative steps an AI agent executes
literally). PART 2 is the **HUMAN VERSION** (plain-English explanation of the same system). Same
system, two audiences.

═══════════════════════════════════════════════════════════════════════════
# PART 1 — AGENT RUNBOOK  (follow these steps literally)
═══════════════════════════════════════════════════════════════════════════

## Inputs
- `keyword` — the target search phrase.
- `slug` (optional) — an existing post in `content/blog.ts` to optimize. Omit for a new post.

## Procedure

**STEP 1 — Get competitors (FRESH every run; never reuse a saved list):**
- WebSearch `keyword`.
- Pick the top ~10 result URLs that are GENUINE blogs/guides.
- HARD-EXCLUDE: `*.gov`, official monument/park pages, `reddit.com`, TripAdvisor, Wikipedia,
  YouTube, Yelp, major news, and pure vendor/booking/ticket widgets.
- SELECT BY INTENT, NOT KEYWORD/DOMAIN: drop pages that share the keyword but cover a different
  topic (e.g. "Kauai shipwrecks" maritime history ≠ "Shipwreck Beach"); KEEP genuinely-relevant
  authority guides (hawaii-guide) — relevance decides, not domain size. (This is the human/LLM
  edge: Surfer grabs by domain authority + keyword string, so it pulls Reddit/vendor/wrong-topic
  pages and drops the best guides; an agent reading the SERP picks by what each page is *about*.)
- REDDIT/FORUMS = A QUESTION SOURCE, NOT A SCORED COMPETITOR: never put them in the `--urls`
  corpus (forum format skews the term/structure/length math, and they block scraping). But DO
  read the Reddit/forum thread(s) in the SERP and mine them for the *real* questions, debates, and
  vocabulary people use — that's authentic intent the polished guides miss — then fold it into the
  FAQ and coverage. (It's why Google ranks Reddit so highly now; use it for intent, not benchmarking.)

**STEP 2 — Run the tool:**
```
export PATH="$HOME/.local/node/bin:$PATH"
node scripts/serp-optimize.mjs "<keyword>" [--draft <slug>] --urls "u1,u2,..."
```
→ writes `scripts/serp-brief-<slug>.md` (gitignored). ~8/10 fetch success is normal.

**STEP 3 — Read `scripts/serp-brief-<slug>.md`.** Sections: Length target · Term ranges (❌/⚠/✅) ·
Exact-phrase check · Structure · Upfront-intent checklist · Fact candidates · Questions ·
Per-competitor outlines.

**STEP 4 — APPLY (deterministic — do NOT exercise discretion on "how much"):**
For each brief item, take the fixed action. Default = APPLY ALL genuine gaps until the length
target is met.
```
🔑 heading keywords (brief's "PUT IN YOUR H2/H3") → BUILD/RENAME H2-H3s around them FIRST (Surfer's biggest lever — keyword-in-heading ≫ body; update ToC #anchors to match the renamed slug)
exact primary phrase == 0                              → ADD verbatim 1-3× (intro or an H2)
phrase ❌/⚠ AND is a named entity (place/road/gear/condition) → ADD each — be LIBERAL (Ka'uiki Head, private property, slippery, naked are real, not filler)
CORE term below its ⚠ range (primary phrase + beach/sand/trail/hike-type) → RAISE into range: use the proper noun not pronouns ("Red Sand Beach", not "it"); this is the SEO-dial lever
fact candidate, concrete+citable, absent               → ADD each as a stated fact
question not already answered                          → ADD each to the FAQ
intent item missing (answer/what/who-for/why)          → ADD a line to the intro
length / density under target                          → keep applying + LENGTHEN with genuine content to carry the density
plain generic word the brief flags (located/area/weather/signs) → INCLUDE where it fits (fine for density, won't trip ai-slop)
pure mood adjective that trips ai-slop (stunning/vibrant/breathtaking) → SKIP (the only real filler)
images/headings flagged "under"                        → DO NOT chase (chrome); only ≥1 infographic/~500w
stale or wrong fact you notice                         → VERIFY, then FIX
```
GOAL: **SEO dial ≥70 from the first draft** — coverage alone leaves it low (red-sand scored SEO 39 /
AI 71 first draft, 2026-06-10: strong coverage, under-dense core terms → re-densified to in-range).
Loosen toward inclusion; only mood-filler is skipped. **If scoring in Surfer, use SURFER's panel
ranges** — its mobile/USA competitor set (incl. sites we exclude) often demands more density than ours.
Tool calibration (2026-06-10): curl uses a **mobile UA** (Surfer is mobile-first) and **--min-pct 0.25**
(surfaces more entities for the density dial).

**STEP 4b — OUR LOCAL SEO SCORE (the bar to hit — no Surfer round-trip):**
Running with `--draft <slug>` prints **`🎯 OUR SEO SCORE: N/100`** at the top of the brief — a local
reverse-engineering of Surfer's SEO dial: weighted term coverage (each term weighted by competitor
prevalence; phrases boosted) + exact-primary-phrase presence, scored against the **top ~90 terms by
weight** (mirrors Surfer's curated ~80-term set; without the cap our bigger surfaced set scores far
harsher). Below the score is a **points-ranked "add these to reach the bar"** list — juicy
entities/core terms first, filler last — so you add highest-value gaps until the score clears.
- **The loop:** draft → `--draft` → read **SEO SCORE (≈ Surfer)** → add the top gaps → re-run → repeat
  until you've hit Surfer's published targets (below). The tool also prints a calibrated ≈Surfer estimate,
  but it's a convenience — the real gate is Surfer's own spec.
- **THE GATE = COPY SURFER'S PUBLISHED SPEC (owner directive 2026-06-10, supersedes any "ceiling" theory):**
  match their **word count** (write to the competitor median — the #1 lever; our posts ran ~2K vs 5-8K and
  tanked), **paragraph count**, **heading count**, **every term's range** (fill unders, trim overs), and put
  the **exact phrase + every recommended subtopic in an H2/H3**. Aim 90+. Don't reinvent past Surfer — it's
  the proven standard; mirror it. The brief reports every one of these targets vs your draft.
- **Calibration:** anchored on red-sand (densified ≈ Surfer ~70 → **our 77**; ours runs a touch high =
  safe direction). Tune `--target-score` as real Surfer scores accrue — paste a finished post into
  Surfer, compare to OUR SEO SCORE, adjust the threshold so our-bar ≈ Surfer 70.
- **🤖 Mine Surfer's Auto-Optimize** on a finished post: it shows the EXACT edits Surfer makes (its
  ground-truth playbook) — exact phrase IN a heading, specific AI facts, entity inserts (nearby-beach
  alternatives). **Its score lift is NOT a ceiling** — Auto-Optimize does minimal edits to preserve the
  original, so the number depends on what's missing (often 90s on well-structured posts). Don't cap our
  target to it; **aim 80-100 by writing it right up front.** Record each run in the calibration log.
- Knobs: `--target-score` (bar), `--score-terms` (curated set size, default 90).

**STEP 4c — PANEL MODE + THE PERTURBATION EXPERIMENT (cracking Surfer's formula for real):**
- **Panel mode:** whenever the owner has a Surfer Content Editor open for a keyword, copy its term
  panel into `References/surfer/panel-<slug>.md` (format: see `panel-red-sand-beach-hana-maui.md`)
  and score with `node scripts/serp-optimize.mjs --panel <file> --draft <slug>`. This scores
  against **Surfer's OWN term set**, eliminating the term-extraction mismatch — any remaining gap
  vs the real Surfer score is pure FORMULA error. **Log every panel-score↔Surfer pair** in
  `References/surfer/calibration-log.md`; panel mode starts uncalibrated (its raw scale ≠ the
  extraction path's, so the −30 offset does NOT apply).
- **The experiment (one-time, ~60-90 min):** Surfer's editor shows every score INPUT and updates
  live — so its function is measurable by single controlled edits. Run
  `References/surfer/experiment-protocol.md` in a throwaway Content Editor, fill
  `References/surfer/experiments/<slug>.csv` (copy TEMPLATE.csv), then
  `node scripts/surfer-fit.mjs <csv>` prints measured point-values per component (exact-keyword
  placement, word-count gate-vs-additive, per-term value by panel rank, heading/above-fold bonus,
  structure chrome) + suggested knobs (`--w-body/--w-head/--w-exact`, `--panel-weight`, length
  handling, offsets).
- **Exit criterion (cancel the subscription):** the scorer predicts Surfer's SEO score blind on
  **3 consecutive new drafts within ±5 points** (predict with `--panel` BEFORE pasting into Surfer).

**STEP 5 — Do NOT change writing voice / humour / style / FORMATTING.**
- Voice & humour: `references/voice.md`, `References/DanKennedyVoice.md`, `References/Humour.md`,
  `References/FunnyHumor.md`.
- Formatting & design: `References/DESIGN.md` + our native-visual standard — native `::infographic`
  cards/stat-panels/compare, ONE cover photo, vetted in-body photos (inspect each for quality+location), the existing layout/structure.
- This system ONLY adds SEO *coverage* (facts/entities/questions woven INTO our existing format and
  voice). It never alters how we write or how the page looks. New facts go into existing-style
  sentences/sections and existing `::infographic` patterns — not new formatting.

**STEP 6 — Gate before ship:** `npm run build` (every route `○ Static`) · `ai-slop-check` (0 HARD) ·
`post-stats` (length + ≥1 infographic/~500w) · Lighthouse ≥ 95/100/100/100 · ToC anchors resolve.
Re-run the tool; the ❌ list should now be only genuine non-applicables.

## Hard constraints (never violate)
1. Always-fresh competitors — NO pinning/caching.
2. NEVER stuff for the density score (it craters AI Search; measured SEO +5 / AI Search −31).
3. Exclude `.gov` / Reddit / TripAdvisor / Wikipedia / YouTube / Yelp / news / vendor widgets.
4. Structure targets are chrome-inflated — ignore image/heading counts.
5. Accuracy > score — fix stale facts.
6. The score is a gap-finder, NOT a target. Real verdict = GSC rank over 4–8 weeks.

## To rebuild the tool itself in another environment
1. SERP URLs: agent (or SERP API) supplies top ~10 genuine blog URLs (exclusion list above).
2. Fetch each: `curl -sL -A "Mozilla/..." --max-time 25 <url>` (~80% success; degrade gracefully).
3. Clean: strip `<script|style|nav|header|footer|form>`, then tags→text. Capture headings (h1-h6
   + level), `<img>` count, `<p>` count, char count.
4. Tokenize: normalize diacritics (NFD strip macrons; remove okina WITHOUT a space so
   "Waiʻanapanapa" stays one token); lowercase; stopword + mood-filler filter.
5. Term ranges: uni/bi/tri-grams; keep terms in ≥30% of docs; range = [p25, p90] of per-page
   counts; classify draft add/more/ok/over.
6. Facts: dump corpus sentences with numbers/specifics (filter chrome) → LLM judges coverage.
7. Length: target = median×1.15 if #1 is an outlier (≥1.5×median), else avg×1.15.
8. Structure / questions / outlines: aggregate counts; question-form headings; per-competitor
   H1-Hn with chrome flagging.
9. Apply via STEP 4 under the hard constraints. Keep writing-voice rules separate.

═══════════════════════════════════════════════════════════════════════════
# PART 2 — HUMAN VERSION  (what this is and why)
═══════════════════════════════════════════════════════════════════════════

## The short story
Surfer SEO charges monthly to tell you how to optimize a page. We reverse-engineered the parts
that actually matter and built them into a free script (`scripts/serp-optimize.mjs`). On a fair
test it drove a Maui post +13 points without any keyword stuffing — and it even caught a factual
error (a booking window that said "14 days" when the right answer was 30).

## How Surfer actually works (no magic)
It scrapes the top ~10-20 Google results for your keyword, then:
- counts how often each word/phrase appears across them → "use this term 8-13 times" ranges;
- pulls their headings (subtopics), their FAQ questions, and structure counts;
- (newer) uses an LLM to list the **facts** the top pages state and whether your draft covers them,
  plus whether your intro answers the question / says what it's about / who it's for / why it matters;
- rolls it into a 0-100 score split into two dials: **SEO** (keyword density) and **AI Search**
  (facts + clarity, for answer engines like AI Overviews).

We rebuilt all of that. The score itself has weak, non-causal evidence for rankings (Ahrefs found
"weak correlations everywhere"; Surfer's own study = a weak 0.28). So we treat the brief as a
**gap-finder, not a target.**

## The things we learned the hard way (the rules exist for reasons)
- **Who you compare against is everything.** Surfer includes .gov pages and Reddit as
  "competitors," which drags its targets toward content you can't or shouldn't copy. When we
  excluded those and benchmarked against real blogs, our edits jumped from "barely moved" to +13.
- **Stuffing keywords for the SEO dial backfires.** A test that crammed in keywords gained 5 SEO
  points but lost 31 on AI Search — because stuffing buries the facts and spams the intro, which
  is exactly what answer engines penalize. So: add real content, never repeat for the score.
- **The "structure" targets are fake-inflated.** Competitors' heading/image/paragraph counts
  include their navigation, related-post widgets, comments, and footers. Surfer counts all of it,
  so "use 25-100 images" really means "those sites have lots of chrome." We don't chase it (and it
  would wreck our Lighthouse score anyway).
- **Don't cache the competitor list.** It's tempting to save it, but a year later you'd be
  optimizing against pages that have since dropped to page 75 — and you'd never know why your post
  stalled. Always pull today's SERP.
- **AI Search is the dial worth winning.** Keyword density is the old blue-link game; facts +
  clarity is where search is going (AI Overviews, answer engines). Our facts-first approach moves
  that dial reliably.

## The other safeguard: minimal judgment
Early on, the agent (me) kept *deciding* how much of the brief to apply — once too timid (the post
barely moved), once over-correcting. So we removed the discretion: PART 1 STEP 4 is a fixed table —
apply every genuine gap until the length target is met; the only call is "real thing vs filler,"
which is nearly mechanical. Same input → same thorough output, every time.

## What this does NOT touch
The writing AND the formatting are completely separate and unchanged: voice, humour, the "tell
them when not to hire you," the no-AI-tells rule — and our "pretty way" (the design system, native
infographics, one cover photo, vetted in-body photos, the layout). This system is the SEO/coverage layer
that runs *after* (or alongside) the writing — it adds facts/entities/questions into our existing
voice and format. It is never a rewrite of the style or a change to how the page looks.

## Evidence log
| Post | SERP type | Result |
|---|---|---|
| road-to-hana-maui | blog + some official | AI Search +12 (facts pass) |
| diamond-head-from-waikiki | .gov/Reddit-polluted | +6 (small — unfair set); caught a 14→30-day error |
| best-beaches-in-maui | clean blog SERP | **+13 overall (SEO +11, AI Search +16)** |
| stuffing test | — | SEO +5 / **AI Search −31** → proves: never stuff |

**Bottom line:** fair competitor set + apply-every-genuine-gap + never-stuff = both dials rise. The
tool finds gaps; real rankings (GSC over 4–8 weeks) are the only scoreboard that counts.
