# Surfer calibration log — tuning OUR local SEO score to Surfer's dial

> **⛔ STATUS 2026-06-11 — SURFER ACCESS ENDED (owner ran out of credits, won't renew; chose the
> fully-free path).** Calibration is PAUSED: no more Surfer round-trips, no pending re-scores, don't
> ask the owner to paste posts into Surfer. The gate is now `serp-optimize.mjs` raw score ≥ 90 +
> the standard QA gates; **the judge is GSC rank over 4-8 weeks** (monthly /site-health). The
> perturbation-experiment kit (`experiment-protocol.md`, `experiments/TEMPLATE.csv`,
> `scripts/surfer-fit.mjs`, `--panel` mode) stays SHELVED, ready if a one-off Surfer month
> (~$89) is ever bought to lock the constants. All "pending" Surfer columns below stay pending.

**Purpose:** record, per post, OUR SEO SCORE vs the real Surfer SEO/AI scores + the term
targets Surfer recommended, so we calibrate `--target-score` (and the scoring formula) until
**our bar reliably ≈ Surfer 70+**. Fill in the Surfer columns each time you paste a post into Surfer.

## The mapping — CALIBRATED (2 clean paired points, dead consistent)
| Post | Our RAW score | Surfer SEO | Gap |
|---|---|---|---|
| red-sand (v3, generic H2s) | 86 | 59 | +27 |
| luau (blind) | 82 | 55 | +27 |

**→ Our raw runs ~27 over Surfer SEO, identically across both posts. Baked in:**
`calibrated ≈ Surfer = raw − 27` (`--cal-offset -27`, `--cal-slope 1`). The tool now prints
**`SEO SCORE (≈ Surfer): N`** = the predicted Surfer number. Refit slope/offset as more pairs land.

**🎯 Honest target reset (this is the big recalibration):** Surfer SEO **80-100 is NOT realistic** on
competitive topics without stuffing that wrecks our voice. Evidence: both our clean, fully-optimized
posts land Surfer **55-59**, and Surfer's OWN auto-optimizer (minimal edits) maxed at **74**. At raw 100
our model predicts Surfer ~73 — i.e. near-perfect density only reaches ~73. So the realistic,
voice-preserving bar is **Surfer ~60-65**; lean on the **AI-Search dial (we nail 81-94)** + keyword-rich
headings + real GSC rankings rather than chasing a high SEO-density number. `--target-score` default = **62**.

## 🔬 Findings from the luau Surfer panel (2026-06-10)
- **OVER-USE penalized hard:** `is a luau worth it 7/1`, `buffet 17/5-11`, `fire knife 10/2-5`, `dinner 11/5-10`. → tool now has a **graduated over-penalty**; trimmed the luau post (buffet 17→9, dinner→10, fire-knife normalized, +food/kalua pig/price tag).
- **Surfer scores against exactly 81 terms** (every panel). → `--score-terms 81` (was 90).
- **Competitor set skews targets:** Surfer based the luau on a **Reddit thread + specific-luau reviews** (Ka Wa'a, Old Lahaina) → inflated `maui 15-30`, `old lahaina luau 6-16`. A *general* opinion post can't hit those without distorting — we DON'T chase them.
- **Exact phrase:** good in HEADINGS (Surfer rewards), bad over-stuffed in BODY (target ~1); our raw string conflates them so the scorer leaves it un-penalized (manual watch-out).
- **🎯 DIRECTIVE (2026-06-10): COPY SURFER'S SPEC, AIM 90+.** Surfer is the proven standard — mirror it,
  don't theorize past it. Match their published targets exactly: word count (competitor median), paragraph
  count, heading count, every term range, the exact phrase + every recommended heading. The biggest miss
  was LENGTH — our posts ran ~2K vs 5-8K competitors. Hit their word count and the score follows.
  (Supersedes the earlier "don't chase past 65" note — that was our theory, not the owner's call.)
- **Calibration caveat:** both reference posts were edited after their Surfer reads → `--cal-offset -30` is rough; re-validate with fresh paired scores.
**Scoring model:** weighted term coverage (weight = competitor prevalence, phrases ×1.3) + exact phrase;
top-90 terms; **over-range penalty 0.9** (added 2026-06-10 after the densify tanked Surfer — over-stuffing
hurts). Knobs: `--target-score`, `--score-terms`, `--min-pct`, mobile UA.

## 🧪 NEXT: the perturbation experiment (2026-06-11 — supersedes whole-post calibration)
Whole-post pairs can't identify a ~6-parameter formula (2 contaminated points, ~6 unknowns).
New kit measures the function directly — Surfer's editor shows every input and scores live, so
single controlled edits = partial derivatives:
- **Protocol:** `experiment-protocol.md` (~45 reads, one throwaway Content Editor) → fill
  `experiments/<slug>.csv` → `node scripts/surfer-fit.mjs <csv>` → apply suggested knobs.
- **Panel mode (use NOW, every Surfer session):** copy the term panel to `panel-<slug>.md`, run
  `serp-optimize.mjs --panel <file> --draft <slug>` — scores vs Surfer's OWN terms (no term-set
  error). Log pairs below; panel mode needs its own offset (raw scale differs; starts at 0).
  First reading: red-sand v5 panel-raw **79** vs Surfer pending.
- **Exit:** 3 consecutive blind predictions within ±5 pts → cancel the $300/mo.

---

## Post 1 — red sand beach hana maui (1,300/mo · KD17) · 2026-06-10
**Slug:** `red-sand-beach-hana-maui`

| Version | Words | OUR score | Surfer SEO | Surfer AI | Surfer overall |
|---|---|---|---|---|---|
| v1 first draft | 1,785 | ~47* | **39** | **71** | 55 |
| v2 densified | 2,102 | 75 | _tanked a little_ | ~71 | _–_ |
| v3 breadth→80 | 2,158 | 86 | **59** | **89** | **74** |
| v4 heading rewrite | 2,211 | 90 | _pending_ | _pending_ | _pending_ |
| v5 + auto-opt moves | 2,250 | **90** | _pending — run this one_ | _pending_ | _pending_ |
| _(Surfer auto-optimized v3)_ | — | — | **74** | **94** | **84** |
*v1 our-score modelled retroactively.

**🤖 GROUND TRUTH — running Surfer's Auto-Optimize reveals its exact playbook.** Owner ran it on
v3 → it boosted SEO 59→**74**, AI 89→**94**, overall 74→**84** ("48 SEO entities, 11 sections").
**⚠️ 74 is NOT a ceiling.** Auto-Optimize deliberately makes *minimal* edits to preserve the original
article — the lift depends entirely on what's missing, and on better-structured posts it reaches the
90s. So we do NOT anchor `--target-score` to 74. **Aim 80-100 by WRITING it right from the start**
(keyword-rich headings + the exact phrase in a heading + density + facts) — that beats a low draft +
a minimal auto-fix. Use Auto-Optimize only to mine *which* moves it makes, not as a score cap.
Exactly what Auto-Optimize did here (= the playbook to bake in up front):
- **Headings:** prepended the EXACT primary phrase to a heading ("**Red Sand Beach Hana Maui:** What's
  in This Guide") and inserted "**Red Sand Beach** Trail" into the trail H2. → Rule: put the exact
  primary phrase IN a heading, not just keyword-rich headings.
- **AI facts (moved AI most):** Queen Kaʻahumanu birthplace · illegal-parking → police citations ·
  iron-rich lava rock breaks into fine grains. (All now in our post.)
- **Entities (~48):** Koki Beach (= "safer, easier-access option nearby"), ocean conditions, coastline,
  Ka'uiki Head, etc. — small body inserts.
- **Takeaway:** even Surfer's "SEO" optimization is heavily facts/entities (which is why AI moved more).
  Our split (body density / headings / facts) is roughly right; **lower the over-prediction by trusting
  Auto-Optimize's ceiling (~74) over our raw number.**

**🔑 Biggest lesson (v3→v4): HEADINGS are Surfer's dominant SEO lever.** At v3 our score (86) vs
Surfer (59) diverged by 27 — the ENTIRE gap was heading coverage. Surfer's "Headings" tab showed
competitors put `red sand beach / red sand / sand beach` in ~11 headings each, plus `kaihalulu beach`,
`red sand beach trail`, `ocean conditions` — and our H2s were generic. Fix: (1) tool now scores a
**heading-coverage component (×0.35)** on distinct phrase subtopics in our H2/H3s, and dumps the
competitors' actual headings to model; (2) rewrote red-sand's H2s keyword-rich (loaded Kaihalulu /
"red sand beach trail" / Maui into 7 of 8) → heading coverage 68%→**95%**, our score 80→90. **v4
Surfer re-score is the test: did keyword-rich headings lift SEO from 59?** Calibration still shows
our score over-predicts (~90 vs 59 at v3) — the body-vs-heading weights need tuning once v4 + the next
post give more paired points.

**Surfer competitors (their pick, 5):** mauiguidebook.com · noahlangphotography.com · paradise-found-in-maui.com · **en.wikipedia.org** (we exclude) · thehikinghi.com
**Our competitors (9):** paradise-found, wedreamoftravel, noahlang, danielleoutdoors, jordanoutside, soulsummittravel, letsgotomaui, mauiguidebook, thehikinghi. (Overlap: mauiguidebook, noahlang, paradise-found, thehikinghi — 4/5; we drop Wikipedia.)

**Surfer's recommended term targets (from the panel) — have/range at v1:**
- red sand beach 15 / 34-96 · red sand 20 / 37-96 · sand 29 / 43-98 · beach 29 / 58-118
- kaihalulu beach 0 / 6-13 · trail 15 / 28-57 · hike 2 / 10-26 · maui 11 / 15-42
- uakea road 3 / 3-7 · cove 25 / 4-10 (OVER) · cliffs 16 / 2-7 (OVER) · park 9 / 8-22 · bay 8 / 5-20
- ka'uiki head cinder cone 0 / 1-4 · private property 0 / 2-5 · community center 2 / 3-5 · black sand 1 / 2-7
- hana highway 0 / 1-2 · naked 0 / 1-4 · slippery 0 / 3-7 · trespassing 0 / 2-5 · island 0 / 5-10 · located 0 / 3-5
- (Headings target 15-65; words 1.9K-2.2K; paragraphs 61+)

**Lesson:** v1 had strong AI (71) but SEO 39 — core terms under-dense + missing entities. v2 densified to
in-range but over-stuffed a couple (cove/cliffs already over) → Surfer dipped. v3 raised OUR score by
**breadth** (distinct terms) not depth, with an over-penalty now guarding against stuffing. **The open
question the Surfer re-score answers: does our 86 map to Surfer ≥70, and did breadth-not-depth recover it?**

---

## Template for the next post
```
## Post N — <keyword> (<vol>/mo · KD<n>) · <date>  · slug: <slug>
| Version | Words | OUR score | Surfer SEO | Surfer AI | Surfer overall |
Surfer competitors: ...   Our competitors: ...   Overlap: x/5
Surfer term targets (have/range): ...
Lesson: ...
```
