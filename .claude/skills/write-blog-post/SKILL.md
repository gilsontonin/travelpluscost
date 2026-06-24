---
name: write-blog-post
description: >-
  Write one SEO-optimized, on-brand blog post for travelpluscost, end to end — research the SERP,
  draft in the house voice, add it to src/lib/posts.ts (TL;DR, infographics, hotel cards, FAQ), and
  loop the QA robots until SHIP-READY. Use when asked to "write a blog post", "create a post", "write
  the next post", or "/write-blog-post". Stops for owner review at the keyword, the draft, and before commit.
---

# write-blog-post (travelpluscost)

The **governing manual is `docs/blog-system/BLOG-PLAYBOOK.md`** (the owner's enforced write + QA/QC
contract — §0 the six failure modes, §3 voice/funny-first, §4 the twelve corner-cuts, §5 the step-by-step
process, §9 the pre-publish ritual), read alongside **`docs/blog-system/TheBible.md`** (the ported gate
contract). **Read BOTH first and follow them top to bottom — do not free-write, do not skip steps.**
This skill is the execution wrapper. The brand promise + hard limits live in `docs/POSITIONING.md` and
`docs/blog-system/References/stats.md` (never publish the wholesale cost or the exact markup %).

## Before writing a sentence, read
- `docs/blog-system/BLOG-PLAYBOOK.md` (**the governing manual** — how to write to a publishable standard + the full QA/QC; do not skip a step)
- `docs/blog-system/TheBible.md` (the contract + gates)
- `docs/blog-system/References/Semrush.md` (the live keyword-research wiring — Steps 1–2 run this)
- `docs/blog-system/References/Voice.md` + `DanKennedyVoice.md` + `Humour.md` + `PassAISlopAndDetection.md`
- `docs/blog-system/References/stats.md` (the ONLY numbers you may state) · `Opinions.md` · `Stories.md`
- `docs/blog-system/References/BlogStructure.MD` + `OnPageSEOCheckList.md` + `AffiliateLinks.md` (linking)
- `docs/blog-system/References/WritingLessons.md` (the ported Hawaii feedback-loop — the **scorer mechanics
  transfer** verbatim: heading lever, tokenizer/hyphen/comma traps, ToC over-count, "infographic deletes its
  terms"; ignore the Hawaii-specific examples) + `skills/enhance-with-surfer.md` **Mode C** (how to raise the
  serp score the right way — no stuffing)
- `docs/blog-system/References/InventoryPosts.md` (the conversion widgets `::search/::rail/::map/::compare/
  ::areas/::cta/::priceproof/::details`, the inventory-first layout, the **CTR title/description formula**,
  using our hotel photos, and the long-tail **"where to stay in <city>" pSEO program** + its build tools)

## Workflow
1. **Keyword + live Semrush research** (`References/Semrush.md`). We keep no stored keyword cluster — we
   pull data **live from the Semrush MCP** (`mcp__semrush__*`; if those tools are absent the server didn't
   load — restart Claude Code, or note `semrush: unavailable` and fall back to SERP-only). Take the owner's
   keyword if given; else propose candidates (brand/transparency angle first, then a destination among
   Oahu/Maui/Las Vegas/Seattle/San Diego). **For each candidate get the real numbers:** `phrase_this`
   (volume/CPC/competition) + `phrase_kdi` (difficulty) → **derive intent** (phrasing + question share +
   `phrase_organic` SERP features — Semrush's intent field isn't exposed) → run the **cannibalization
   check** against the keyword ledger (`npm run blog:keywords`, reads `content/keywords.json`). Present a
   table — `kw | vol | KD | intent | cannibalization` — aim KD ≤ 30 / volume > 100 /
   informational-or-commercial, and **PAUSE for the owner's pick.** On the pick, **log the cluster to
   `content/keywords.json`** (status `researching`; see `References/Semrush.md` for the shape).
2. **Expand the keyword + research the SERP.** Pull the cluster with `phrase_related` (→ secondary keywords
   + H2 phrases; filter the foreign-language junk) and `phrase_questions` (→ FAQ + body sub-questions).
   Then `node scripts/blog/serp-optimize.mjs "<kw>" --urls "u1,u2,…" --draft <slug>` over ~6–10 genuine
   competitor URLs (fresh WebSearch, no Reddit/TA/Wiki/YT/news), feeding the Semrush terms/questions into
   the corpus. Read the brief: must-have subtopics, questions, fact candidates, the length band. Mine PAA
   with `npm run blog:paa -- <slug>` (Gemini) — grep-gate every suggestion against the Semrush questions and
   the draft (most are already covered).
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
   Then update its `content/keywords.json` entry: fill the `secondary` cluster from `phrase_related` and
   flip `status` → `published` (`npm run blog:keywords` should read clean).
   - **Title + description = the CTR formula** (`InventoryPosts.md` §4): keyword + (year) + "Best Areas" +
     "Hotels"/"Resorts" + area names; the description is the snippet, so stack it with hotels/rates/year.
   - **Inventory-forward** for "where to stay" posts: set `region: { name, destination }` (fires the top
     search bar + hero rail + CTA off the directory), lead the body with inventory widgets, collapse the
     deep prose in `::details`. For a **long-tail city** (not an ingested region) run the pSEO flow:
     `blog:opportunities` → Semrush-vet → `blog:hotels -- <city>` (directory mode) → researched post →
     accept serp ~75 on low-KD city SERPs (don't grind to 90). Full program: `InventoryPosts.md` §6.
7. **Regenerate + clean.** `npm run blog:related` (Gemini vectors) · `node scripts/blog/dehyphenate.mjs <slug> --apply`.
   - **Marketing-hat CTA + relational pass (every section).** `npm run blog:cta -- <slug>` — per section it
     surfaces the CTA, the directory hotels mentioned (matched to real ids → a `::hotel` card or a link to
     *that* hotel), and any destination that LEAKS to the wrong city. Then **reason + hand-curate**: a
     ready-made CTA in every section, every mentioned hotel actioned (path of least resistance, card or
     link), and **0 leaks** (a "Strip" search must not pull the Vegas Strip — the directory is city-level,
     so verify each dest resolves to this post's city). The script surfaces; *you* decide — curate by hand,
     never blind. Full rule: `InventoryPosts.md` §7.
8. **Loop the gates until green:** `npm run blog:qa -- <slug>` (re-run serp/stats/voice/slop after every
   edit). Then `npm run typecheck && npm run lint && npm run build` (lint MUST be 0 errors). Optional Opus
   polish: `npm run blog:fable -- <slug>`.
   - **Raising serp < 90 the RIGHT way (never stuff — stuffing craters the AI-Search dial that actually
     ranks; measured SEO +5 / AI-Search −31):** in order — (a) the **HEADING lever** (biggest weight): put the
     exact phrase + the brief's competitor subtopics in H2/**H3**s; the heading check is a raw lowercased
     `.includes()`, so write the bare contiguous phrase and drop `&`/commas. (b) **Match the competitor median
     length** (never under it). (c) Add **real subtopic H3s, named entities, and fact candidates** from the
     brief; **use proper nouns, not pronouns**, to lift core terms into range. (d) SKIP mood-filler. A
     thin/legalese SERP (few genuine competitors) can be **density-capped in the low-80s** — that's the
     owner-override case (note it on the board), not a reason to stuff. Full method: `enhance-with-surfer.md`
     Mode C + `WritingLessons.md`.
9. **PAUSE before commit.** Paste the keyword line (primary kw + Semrush **volume / KD / intent** +
   cannibalization verdict), the full `blog:qa` verdict, and the gate numbers. **Commit only when the
   owner says so; never `git push` until "go live"** (use the publish-post skill).

## Hard rules (never break)
- Real numbers only (`stats.md` + live LiteAPI data). No fake discounts/scarcity/points. No exclamation
  marks, no emoji, 0 HARD AI-tells. Never publish the net cost or the exact markup %. Don't push until "go live".
