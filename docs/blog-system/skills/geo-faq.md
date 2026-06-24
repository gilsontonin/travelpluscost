---
name: geo-faq
description: >-
  Expand a post's FAQ for GEO (generative-engine optimization) so it gets cited by ChatGPT /
  Perplexity / Google AI Overviews. Gemini surfaces the real "People Also Ask" questions the
  post does NOT already answer (scripts/paa-suggest.mjs); Claude writes crisp, quotable answers
  IN THE HOUSE VOICE (the quality gate — never auto-generated), added as ## FAQ H3s (FAQPage
  schema is automatic). Applied selectively to posts with thin/weak FAQ coverage — never bulk.
  Use when the user says "expand the FAQ", "add GEO FAQ", "/geo-faq <slug>", or wants answer-engine
  citations for a post.
---

# GEO FAQ — answer-engine optimization (quality-gated)

Adds the questions a searcher / AI engine actually asks, with **crisp, specific, quotable**
answers, so the post is the thing an answer engine lifts. The schema is free (the `app/blog/[slug]/`
route emits `FAQPage` JSON-LD from `## FAQ` H3s), so the whole job is: find the real gaps → write
genuinely good answers in the house voice.

## The one rule that makes or breaks this
**Gemini finds the questions; Claude writes the answers — never the reverse.** Bulk
AI-generated FAQ is a known SEO anti-pattern (thin/generic Q&A can trip Google's helpful-content
system). The win only exists if the answers are specific, true, and in voice. So:
- Apply it **selectively** — posts with no/thin FAQ, or genuinely missing high-intent questions.
  Don't run it across the whole corpus, and don't add a question just to pad.
- Every answer passes `ai-slop-check` (0 HARD) and reads like `references/voice.md`.

## Prerequisite
`GEMINI_API_KEY` in `.env` (billing on — it's a cheap `gemini-2.5-flash` text call).

## Workflow

### 1. Find the genuine gaps
```bash
node scripts/paa-suggest.mjs <slug> --kw "<primary keyword>"
```
Gemini returns 6–8 real PAA-style questions the post does **not** already answer (it's given the
body + existing FAQ, so it returns gaps, not dupes).

### 2. Judge them (this is the work — Gemini's list is ~80% wrong)
The PAA list is **candidates, not gaps.** In a 156-post sweep, ~4 of every 5 suggestions were
topics the body already covered. Run each candidate through two hard gates:
- **GREP the body for the gap's keywords** (mechanical leftover check, not a vibe re-read). Slice
  the post block from `content/blog.ts` and count the gap's key terms; if present → **body dupe,
  drop it** (checklist 3.4). This is the step that prevents duplicate-FAQ padding.
- **Groundable-in-fact only.** Drop anything needing an invented number (cost/hours/"average
  price"), an uncertain fact (a specific operator's pet/cancellation policy, a restroom status you
  can't verify), or names that go stale (specific restaurants/operators). Never invent.
- Keep only **genuine, high-intent** survivors — cost(if real), timing, how-to, is-it-worth-it,
  comparisons, logistics, **accessibility** (wheelchair/stroller — the most common real gap on
  beach/hike posts). Add **~0–3, often zero**. Under-adding beats padding; well-built posts and
  single-property hotel / map posts usually yield **nothing**, and that's the correct outcome.

### 3. Write the answers (house voice + GEO format)
For each kept question, write a `### <Question>?` H3 + an answer that is:
- **Crisp: ~40–55 words**, self-contained and quotable (an engine should be able to lift it whole).
- **Bold lead phrase** at the start (the direct answer), rest clean — e.g. `**About $49.95 online.** …`.
- **Specific + true** — real numbers from the post/`stats.md`, no invented facts. House voice
  (`references/voice.md` + `Humour.md`); ASCII Hawaiian (parens on first mention).
Add them under the post's existing `## FAQ ...` H2 (create one if absent, titled `## FAQ: <keyword>`).

### 4. Gates + commit
- `node scripts/ai-slop-check.mjs <slug>` → **0 HARD**.
- `npm run build` clean; built HTML shows the new `FAQPage` Q&A (more `"@type":"Question"`).
- `node scripts/post-checklist.mjs <slug> --kw "..."` — AUTO pass; **paste the table**. Re-check
  3.4 (no body dupes) and 3.5 (bold lead phrase) by hand.
- Re-run `serp-optimize --draft <slug>` if you added meaningful body terms (FAQ H3s carry heading
  weight — the score can move). Commit the post; **hold push** until "go live".

## Acceptance criteria
- Only genuine, non-duplicate, high-intent questions added (≤~5); each answer crisp (~40–55w),
  bold-led, specific, in voice; `ai-slop` 0 HARD; FAQPage schema present; checklist AUTO pass.
- Applied selectively (not bulk); held for go-live.
