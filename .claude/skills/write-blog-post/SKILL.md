---
name: write-blog-post
description: >-
  Write one SEO-optimized, on-brand "where to stay in <city>" blog post for travelpluscost, end to end
  and mostly hands-off — deep Semrush keyword research, the rate-verified inventory scaffold, the
  cluster-targeted draft in the house voice (added to src/lib/posts.ts), and the full gate loop
  (serp/slop/cta/lighthouse) to SHIP-READY. Use when asked to "write a blog post", "write the next post",
  "knock out a post", or "/write-blog-post". Run it autonomously; only stop to confirm the city (if not
  given) and to HOLD the push until the owner says "go live".
---

# write-blog-post (travelpluscost)

> ⭐ **2026-06-27 — START HERE: `docs/blog-system/BLOG-PROMPT.md`** is the canonical, copy-paste workflow +
> the non-negotiable craft/layout rules + the full checklist to PRINT at the end. The owner reset the bar to
> the Hawaii-Picnics posts (the old posts ranked but read DRY). The hard rules: **funny is mandatory** (a
> beat every ~200–250w, written into the fact); **bold a few KEY WORDS, never a whole sentence**;
> **paragraphs = 3 sentences, 1 for punchlines, never 4+**; **active voice**; **property cards ARE the
> visuals — distribute them INLINE, never pile; skip stock photos**; **≥1 designed infographic / ~500w**.
> **PRINT `docs/blog-system/PRINT-CHECKLIST.md` in full at the end** (✅/❌/👁 + a beat per section). Never
> ship dry or red — circle back until green. SEO is necessary but NOT sufficient.

The **governing manual is `docs/blog-system/BLOG-PLAYBOOK.md`** (§3 funny-first voice, §4 the twelve
corner-cuts, §5 the process, §9 the pre-publish ritual), read alongside **`docs/blog-system/TheBible.md`**
and **`docs/blog-system/FablePlaybook.md`** (the judgment calls the checklists can't enforce: the
corner-cutting catalogue, the engagement layer — *one engaged reader beats ten who bounce* — and the
`blog:fable` pass; travelpluscost-native, exemplars Charleston/Savannah/Scottsdale).
**Read all three first — do not free-write, do not skip steps; the writing is the product.** The program +
tools live in **`docs/blog-system/References/InventoryPosts.md`**; performance rules in
**`References/Lighthouse.md`**; brand/compliance in **`docs/POSITIONING.md`** (never publish the wholesale
cost or the exact markup %; claims exactly true; no fake scarcity). **READ THE LESSONS LOG FIRST —
`docs/blog-system/References/WritingLessons.md`** (the "where to stay" program section near the end): every
gate gotcha we've already paid for (the `npm run check` deploy gate, the voice-gate decimal/bullet
over-count, title–state pairing, recap-table cta false positives, the serp-ceiling taxonomy). After
shipping, **append a one-line lesson** there for anything systemic you hit this run.

## Workflow — one call, end to end

**Start every post with `npm run blog:next -- "<city>"`.** It pre-flights inventory (≥8 rate-verified
hotels or skip), prints this whole runbook city-filled, and emits the production scaffold (new post) or a
QA note (post exists). Then work it top to bottom. If no city was given, pick one from `blog:opportunities`
+ a quick Semrush KD vet and confirm it; otherwise run autonomously.

1. **DEEP keyword research (Semrush MCP — do NOT skip; this is what you pair the head term with).**
   - **Variants → the TITLE** (`phrase_fullsearch "where to stay <city>"`): a `<city> <state>` variant
     often carries its own volume at lower KD → put the winning pairing in the title (Estes Park → "Colorado").
   - **Questions by volume → the FAQ + a section** (`phrase_questions "<city>"`): the highest-volume
     questions become the FAQ *and* a dedicated body section (Estes Park: Denver-distance 720, elevation
     ~1,200, "is it in RMNP" 520, "Stanley haunted" 210 — that's the gold, not guesses).
   - **KD is a BAND, not a gate (full ref `References/KeywordResearch.md`).** We go BROAD: write the easy
     KD<30 quick-wins (spokes that rank early + link up) AND the juicy KD 50–70+ pillars (anchor posts that
     build topical authority, slow to rank). Don't reject high-KD. Volume ≥~100 to bother. Pull the next
     keyword from the **keyword map** (`npm run blog:map -- "<city>"` → `content/keyword-map-<slug>.md`).
   - **STEP 1 — SCAN THE TOP 3 (do this BEFORE writing).** WebSearch the keyword → take the GENUINE top
     ranking guides (not Reddit/Wikipedia/YouTube/news/OTA listings). Run **`npm run blog:scan -- "<kw>"
     --urls "u1,u2,u3"`** → the #1/#2/#3 competitor cards + averaged **TARGET SPEC** (words · H2/H3 · images
     · FAQs) + the 9-point scan + the ★gaps. This sets the shape the SERP already rewards; then the deep
     `blog:serp` brief (below) fills the terms/PAA/gaps. Items 1–8 match the winners, item 9 is where you
     beat them (the booking path they lack, the PAA they answer poorly, cluster cross-links, freshness).
   - **The REAL SERP** (`blog:serp`): use those same **actual ranking guide pages** as the serp `--urls`, NOT
     long off-SERP listicles. If the rankers are thin/incoherent (a ~270w page, Reddit, OTA listings, resort
     homepages — no genuine guide) it's a **thin-SERP exec-decision keyword**: write the best honest guide
     and ship it; do not pad to a meaningless serp number. Log the cluster: `npm run blog:keywords`.
2. **STEP 2 — RESEARCH (facet-driven; full ref `References/ResearchBrief.md`).** Do your OWN research so the
   post isn't a top-3 echo. Walk the facet checklist (famous · awarded · where-locals-eat via Reddit · by-
   dish · by-neighborhood · by-occasion · new/buzzy · practical/PAA · video/critic · our LiteAPI data) — one
   WebSearch per facet, **10–30 facets scaled by keyword depth (floor 10, cap 30)** — facets matter, not raw
   count; a narrow keyword runs the ~10 core facets, a deep pillar sub-divides them (neighborhoods/dishes/
   occasions) up to 30. Travel source types
   only (skip industry-reports/studies/gov/product-specs). Localize city posts; subagents opt-in for broad
   pillars. Synthesize → `scripts/blog/research-brief-<slug>.md` (exemplar: best-restaurants-in-new-orleans)
   and **write FROM the brief**.
3. **Backfill social proof:** `npm run blog:pros -- "<city>"` → the cards show "Guests loved …" (real LiteAPI sentiment).
4. **Write the post** into `src/lib/posts.ts` (new entry; `region: { name, destination }` fires the
   inventory-first UI). Target the **CLUSTER**: head + pairing in the title; the questions as the FAQ + a
   section; the pairings (families / near <attraction> / budget / by season / cabins …) as the H2s.
   - **Voice:** funny-first, real, dry (BLOG-PLAYBOOK §3). Answer-first intro, keyword verbatim in sentence
     1, a visible "as of 2026". Author = **"Gilson Tonin, MBA"**. Title = CTR formula (keyword + state +
     "Best Areas & Hotels (2026)").
   - **Card rule:** every hotel named in a heading/prose → its `::hotel <id>` card (rate-verified only — the
     scaffold's pool) or a link to *that* hotel. A famous **direct-only** marquee (Big Cedar, Kalahari, the
     Stanley) gets an honest "books direct, we can't price it" mention — no card.
   - **Cover:** a famous local property's best photo OR a cute, colourful town shot. **INSPECT it** (curl →
     Read a local file; never pick a URL blind — that's how a grey cover slipped out).
5. **Loop the gates until green (re-run after every edit):**
     `npm run blog:serp -- "<kw>" --draft <slug> --urls "<REAL rankers>"` — **serp ≥ 90**. Raise it the
       right way: heading lever first (it hits 100% when the exact phrase + the competitors' subtopics sit
       in H2/H3s), then loop the legit ADD list FULLY, never stuff. Honest ceilings: a **thin SERP**
       (Dells 66) or a **coherent SERP where only junk listicle terms remain** ("information"/"journey"/
       "sweet" — Estes Park 88) is a reported exec-decision, NOT a lazy stop and NOT a reason to stuff.
     `npm run blog:slop -- <slug>` (0 HARD) · `npm run blog:stats -- <slug>` (in band) · `npm run blog:voice`
     `npm run blog:style` — **owner punctuation rule (2026-06-28)**: spell every word out (NO contractions),
       NO dashes in prose, NO prose colons/semicolons (titles + the `**The move:**` strips keep their colon);
       split with `.` and `,`. It auto-fixes the safe cases and flags the rest. Now part of `npm run check`.
     `npm run blog:cta -- <slug>` — **0 leaks**, a CTA every section, every mentioned hotel carded/linked.
     `npm run blog:qa -- <slug>` (the aggregate).
6. **Build + Lighthouse:** `npm run typecheck && npm run lint && npm run build && npm run check` (0 errors).
   **`npm run check` is the Netlify DEPLOY GATE** (claims-integrity + ai-slop + prose-style, per netlify.toml) — a RED
   check fails the WHOLE deploy, so a new post silently 404s on prod and stale content stays live. It
   flags unverifiable superlatives (e.g. "most-reviewed"); rephrase to verifiable wording. Then
   `npm run blog:lh -- /blog/<slug>` against a running server (`npm run build && npm start`; perf ≥ 90,
   a11y/BP/SEO = 100 — `References/Lighthouse.md`: every image via `next/image`, cover = `priority`).
   Cross-link the `/hotels/<city>` hub (don't cannibalise).
7. **Commit, then HOLD the push until the owner says "go live."** Paste the keyword line (head + pairing +
   vol/KD), the serp/slop/cta/lh numbers, and the honest serp verdict (≥90, or the named ceiling + why).
8. **Log the lesson.** If this run surfaced anything systemic (a new gate quirk, a SERP-shape call, a
   compliance/claims trap), append a one-line, dated, post-tagged entry to
   `docs/blog-system/References/WritingLessons.md` so the next post doesn't re-pay for it.

## Hard rules (never break)
- **Real data only** — rate-verified hotels (the scaffold pool), live LiteAPI rates, real sentiment. No
  fabricated reviews/numbers, no fake discounts/scarcity. Never the net cost or the exact markup %.
- **Never stuff** to fake a serp number; never ship a thin/templated post. Funny-first + real data is the
  moat against Google's scaled-content-abuse — pace + quality over volume.
- **Never touch the home page** for a blog task. Commit; **never `git push` until the owner says "go live."**
