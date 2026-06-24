# Surfer score — perturbation experiment protocol

**Goal:** identify Surfer's SEO-score aggregation function by measuring it directly — one
controlled edit at a time in a throwaway Content Editor, recording the score delta after each.
~45 score reads, ~60-90 minutes, one Content Editor credit.

**Why this works:** Surfer shows you every INPUT to the score (the full term panel with ranges,
word/heading/paragraph/image targets) and the score updates live as you type. The only unknown
is how the inputs combine into 0-100. Two finished-post calibrations can't identify a ~6-parameter
function; ~45 single-edit deltas can — each delta is a partial derivative of the score.

**Exit criterion (when the $300/mo goes):** after fitting, our scorer predicts Surfer's SEO score
blind on 3 consecutive new drafts within ±5 points. Until then, every post pasted into Surfer is a
free validation point — log it in `calibration-log.md`.

---

## One-time setup (10 min)

1. **Create a throwaway Content Editor** for one keyword we know well (suggest a fresh mid-tail
   one, NOT tied to a live post — e.g. `anini beach kauai`). Don't enable AI writing, don't run
   Auto-Optimize in it (that contaminates the doc).
2. **Copy the full term panel** into `References/surfer/panel-<slug>.md` using the panel file
   format (see `panel-red-sand-beach-hana-maui.md` for a worked example): every term + its range,
   in panel order top-to-bottom, plus the word/heading/paragraph/image targets and the Headings-tab
   terms as `h:` lines. Panel ORDER matters — it's Surfer's importance sort and we test it.
3. **Pick 4 probe terms** from the panel: **T1, T2 = top of panel** (high importance),
   **T3, T4 = bottom of panel** (low importance). Prefer single words or 2-word phrases with
   small ranges (e.g. 2-7). Write them in the CSV legend lines.
4. **Prepare neutral filler text:** plain narrative about an unrelated everyday topic (how a
   public library works, how bread is baked). Then Ctrl+F **every** panel term in your filler —
   0 matches required; swap synonyms until clean. Vary sentences; don't paste one identical
   paragraph on loop.
5. **Copy the CSV template** `experiments/TEMPLATE.csv` → `experiments/<slug>.csv`.

**Recording rules:**
- After each step, wait for the score to settle (~3-5 s), then record **SEO**, **AI Search**, and
  **Content** scores plus the editor's own **word count** in the CSV row. Fit uses SEO; AI/Content
  are free extra signal.
- One edit per step. Never combine.
- If you mis-edit, undo back to the previous recorded state before continuing.

---

## Phase A — baseline & exact keyword placement (4 reads)

| Step | Edit |
|---|---|
| A0 | Empty document. Record. |
| A1 | Put the **exact keyword in the Title field** only. Record. |
| A2 | Add an **H1 = exact keyword**. Record. |
| A3 | Add a first paragraph (~50 words, from your filler) containing the **exact keyword once**, phrased as a direct answer to the query. Record. |

*Measures: the title / H1 / above-fold exact-keyword components in isolation.*

## Phase B — word-count ladder (7-8 reads) — THE BIG ONE

Keep the A3 state. Paste neutral filler (zero panel terms) to reach each rung; record at each:

`B250 · B500 · B1000 · B1500 · B2000 · B-lo (panel word-range low) · B-hi (range high) · B-over (~1.3× range high)`

Skip rungs that collide (if range-lo ≈ 2000, merge them); record the editor's ACTUAL word count
in the `words` column — that's what the fit uses, not the rung label.

*Tests the #1 hypothesis: is word count a **multiplicative gate** (under-length caps everything —
which would explain our 2K-word posts stalling at Surfer 55-59 despite good term coverage) or a
small additive component? Shape of the curve + what happens past range-high (penalty or plateau).*

## Phase C — term ladders (≈20 reads)

Stay at the B-lo state (realistic length). For each probe term T1-T4, walk its count up,
**replacing a filler word with the term each time** so total word count stays constant
(replace, don't append). Record at each count level:

| Step pattern | Count level |
|---|---|
| C-Tn-1 | 1 occurrence |
| C-Tn-min | range minimum |
| C-Tn-mid | range midpoint |
| C-Tn-max | range maximum |
| C-Tn-3x | ~3× range maximum |
| C-Tn-back | delete back down to range-mid. Score should return to C-Tn-mid exactly (determinism check) |

Leave each term AT range-mid before starting the next term. Fill the `term` and `count` columns.

*Measures: per-term point value (is a top-panel term worth more than a bottom-panel one — i.e. is
the panel importance-weighted or equal-weighted?), partial-credit shape below range, and the
over-stuffing penalty curve past range max (the luau panel says it's harsh — this measures HOW harsh).*

## Phase D — placement / "True Density" (3 reads)

| Step | Edit |
|---|---|
| D1 | Take one T1 occurrence OUT of the body and put it INTO a new H2 (total count unchanged — a move, not an add). Record. |
| D2 | Add an H2 containing the **exact keyword**. Record. |
| D3 | Move one T2 occurrence from deep in the doc into the **first 100 words** (again a move). Record. |

*Measures: the heading bonus and above-fold bonus per occurrence — Surfer's "where they appear
matters more than how often" claim, quantified. D1 is the calibration for our ×0.35 heading weight.*

## Phase E — structure chrome (4 reads)

| Step | Edit |
|---|---|
| E1 | Split 2 long paragraphs into 6 (same words, +4 paragraphs). Record. |
| E2 | Add 3 generic H2s containing NO panel terms ("Quick notes", "Before you go", "Extras"). Record. |
| E3 | Insert 2 images, no alt text. Record. |
| E4 | Add alt text to both; one alt contains T3 once. Record. |

*Measures: whether bare counts (headings/paragraphs/images) score at all vs heading CONTENT, and
whether alt text feeds term counts.*

## Phase F — sanity (2 reads)

| Step | Edit |
|---|---|
| F1 | Undo the E4 edit, redo it. Score must match E4 exactly. |
| F2 | Cut the entire doc, re-paste it. Score must match. (Catches any hidden history/session state.) |

## Phase G — optional cross-keyword replay (second editor, ~10 reads)

Compressed replay on a keyword with a very different panel (different term count + word target):
A0-A3, 3 B-rungs, one term ladder (top term only), D1. *Tests whether the fitted constants
NORMALIZE across keywords (e.g. terms component scaled by panel size) — required before trusting
the model on every post.*

---

## After the session

1. Save the CSV, then run:
   ```
   node scripts/surfer-fit.mjs References/surfer/experiments/<slug>.csv
   ```
   It prints measured point-values per component, curve shapes, the gate-vs-additive verdict on
   word count, and suggested constants for `serp-optimize.mjs`.
2. Apply the constants (weights / `--cal-*` knobs), log the run in `calibration-log.md`.
3. Validation: next 3 posts, run `serp-optimize.mjs --panel` BEFORE pasting into Surfer, write the
   prediction down, then paste and compare. 3 in a row within ±5 → cancel the subscription.

**Caveat from Surfer's own docs:** "Content Score considers more factors than the ones visible in
the guidelines panel" — whatever we can't see lands in the residual. If blind predictions sit
consistently ±3-4 high or low, that's the hidden factor; absorb it in `--cal-offset`.
