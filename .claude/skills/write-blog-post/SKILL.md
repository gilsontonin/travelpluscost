---
name: write-blog-post
description: >-
  Write one SEO-optimized, on-brand blog post for travelpluscost, end to end — research the SERP,
  draft in the house voice, add it to src/lib/posts.ts (TL;DR, infographics, hotel cards, FAQ), and
  loop the QA robots until SHIP-READY. Use when asked to "write a blog post", "create a post", "write
  the next post", or "/write-blog-post". Stops for owner review at the keyword, the draft, and before commit.
---

# write-blog-post (travelpluscost)

The authoritative standard is **`docs/blog-system/TheBible.md`** — read it first and follow every §2 gate.
This skill is the execution wrapper. The brand promise + hard limits live in `docs/POSITIONING.md` and
`docs/blog-system/References/stats.md` (never publish the wholesale cost or the exact markup %).

## Before writing a sentence, read
- `docs/blog-system/TheBible.md` (the contract + gates)
- `docs/blog-system/References/Voice.md` + `DanKennedyVoice.md` + `Humour.md` + `PassAISlopAndDetection.md`
- `docs/blog-system/References/stats.md` (the ONLY numbers you may state) · `Opinions.md` · `Stories.md`
- `docs/blog-system/References/BlogStructure.MD` + `OnPageSEOCheckList.md` + `AffiliateLinks.md` (linking)

## Workflow
1. **Keyword.** Use the one the owner gives. If none, propose 3 candidates (brand/transparency angle
   first, then a destination among Oahu/Maui/Las Vegas/Seattle/San Diego) and **PAUSE for the owner's pick.**
   (We don't keep a keyword cluster — that system was intentionally left out.)
2. **Research the SERP.** `node scripts/blog/serp-optimize.mjs "<kw>" --urls "u1,u2,…" --draft <slug>` over
   ~6–10 genuine competitor URLs (fresh WebSearch, no Reddit/TA/Wiki/YT/news). Read the brief: must-have
   subtopics, questions, fact candidates, the length band. Mine PAA with `npm run blog:paa -- <slug>` (Gemini)
   — grep-gate every suggestion (most are already covered).
3. **Plan + PAUSE.** Show the angle, outline, the ONE CTA (a city hub / search — `AffiliateLinks.md`), and
   which `::hotel <id>` cards / `::infographic <key>` you'll use. Wait for the owner's OK.
4. **Draft in the house voice** per TheBible §4: answer-first intro with the keyword verbatim + a bolded
   answer phrase + a dry hook in 50 words; benefit H2s carrying SERP heading terms; one dry beat per
   section; one opinion (number-backed) + ≤1 true story; ≥2 honest "when not to" beats; a visible "as of 2026".
5. **Source a cover.** `npm run blog:photo -- "<scene>"` → INSPECT the preview → use the printed `cover`
   object (real photographer credit).
6. **Add the post** to the TOP of `POSTS` in `src/lib/posts.ts` — fill every `Post` field, the **`tldr`
   { answer (35–60w, ≠ excerpt/first paragraph), points (3–5 bold-led) }**, `faqs` (4–8 leftover questions),
   3–5 internal links to real pages, `::infographic <key>` (keys live in `src/lib/infographics.ts`), and
   `::hotel <lpId>` cards for any named property. `date`/`updated` = today; author "The travelpluscost team".
7. **Regenerate + clean.** `npm run blog:related` (Gemini vectors) · `node scripts/blog/dehyphenate.mjs <slug> --apply`.
8. **Loop the gates until green:** `npm run blog:qa -- <slug>` (re-run serp/stats/voice/slop after every
   edit). Then `npm run typecheck && npm run lint && npm run build` (lint MUST be 0 errors). Optional Opus
   polish: `npm run blog:fable -- <slug>`.
9. **PAUSE before commit.** Paste the full `blog:qa` verdict + the gate numbers. **Commit only when the
   owner says so; never `git push` until "go live"** (use the publish-post skill).

## Hard rules (never break)
- Real numbers only (`stats.md` + live LiteAPI data). No fake discounts/scarcity/points. No exclamation
  marks, no emoji, 0 HARD AI-tells. Never publish the net cost or the exact markup %. Don't push until "go live".
