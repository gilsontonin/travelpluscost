---
name: enhance-with-surfer
description: >-
  Enhance ONE existing blog post on the Hawaii Picnics & Beach Events site using
  Surfer SEO. Two modes: (A) GAP-FILL from a Content Editor brief — fold in the
  genuinely missing SUBTOPICS (heading gaps) and meaningful entities in the house
  voice, skip filler; (B) VERBATIM COPY — when the owner pastes Surfer's optimized
  text, apply that copy word-for-word as the prose while KEEPING our structure,
  formatting, links, affiliate links, infographics, and tour cards intact (only the
  copy changes). Either way: all guardrails + gates, logs a GSC baseline, holds for
  "go live". Use when the user says "enhance with surfer", "/enhance-with-surfer
  <slug>", "weave in the surfer terms", "add the missing surfer headings", "use this
  copy exactly / verbatim", or pastes a Surfer brief OR Surfer-optimized copy.
---

# Enhance With Surfer — Hawaii Picnics & Beach Events

Improves ONE existing post using Surfer — either by folding the *genuine gaps* from a
Content Editor brief into our voice, or by applying the owner's *verbatim Surfer copy*
while preserving all our structure and scaffolding. One post per run, behind all gates.

> **Read first:** a high Surfer score earned by stuffing *hurts* rankings (broken
> sentences, AI-tell filler, worse dwell). In GAP-FILL mode we use Surfer as a
> **gap-finder**, not a target. In VERBATIM mode the owner has explicitly chosen the
> copy — apply it faithfully, but **never let "verbatim" delete the affiliate links,
> infographics, tour cards, or internal links** (copy-paste flattens those; we keep them).
> See `References/WritingLessons.md`.

---

## Mode C — IN-HOUSE BRIEF via `scripts/serp-optimize.mjs` (PREFERRED — no Surfer needed)

We reverse-engineered Surfer's measurable dimensions into a free, in-repo tool. Validated
across 5 posts — best example: **best-beaches-in-maui +13 overall (SEO +11, AI Search +16)**
on a fair blog SERP, no stuffing. **This is now the default way to generate the brief; Mode A
then applies it.** The Surfer subscription is optional.

**Run it:**
1. WebSearch the primary keyword and pick the **top ~10 GENUINE blog competitors**.
   **Exclude** `.gov`/official pages, Reddit, TripAdvisor, Wikipedia, YouTube, Yelp, big news,
   and pure vendor/booking widgets — they skew targets toward content we can't/shouldn't match.
   **Select by INTENT, not keyword/domain:** drop pages that share the keyword but cover a different
   topic (e.g. "Kauai shipwrecks" maritime history ≠ "Shipwreck Beach"); DO keep genuinely-relevant
   authority guides (hawaii-guide) — relevance decides, not domain size.
   (Surfer grabs by domain authority + keyword string — so it pulls Reddit/vendor/wrong-topic pages
   and even drops the best guides. Benchmarking against them is why its scores mislead. Our edge.)
   **Reddit/forums = a QUESTION source, not a scored competitor:** keep them OUT of the `--urls`
   corpus (forum format skews targets; they block scraping) — but DO read the thread(s) in the SERP
   and *copy the real questions/vocabulary for relevance* into the FAQ + coverage. Mine them; don't
   try to outrank them.
2. `export PATH="$HOME/.local/node/bin:$PATH"` then
   `node scripts/serp-optimize.mjs "<keyword>" --draft <slug> --urls "u1,u2,..."`
   - **No pinning — always pass TODAY's competitors.** We deliberately do NOT cache the set: a
     stale pin would silently make us optimize against a SERP that has moved on (last year's
     "winners" may be page 75 now), and we'd never know why a post stalled. For stable before/after
     *within one session*, just reuse the same `--urls` string; for a later rewrite, WebSearch fresh.
   - Output: `scripts/serp-brief-<slug>.md` (gitignored). ~8/10 fetch is normal (JS/bot blocks).
3. Read the brief, then apply with the **Mode A** procedure below.

**The brief covers every dimension Surfer measures:** outlier-trimmed length target,
frequency-range term targets, 2-/3-word phrase gaps, exact-primary-phrase check, **structure**
(headings/images/paragraphs/chars), **upfront-intent** checklist, **fact candidates** (the
GEO/AI-Search dial), **questions**, and per-competitor **outlines** (chrome flagged with ⟵).

**Validated rules (these govern what you apply — learned from real A/B tests):**
- **Optimize coverage, facts, and intent — NEVER stuff for the SEO density dial.** Real content
  moves *both* dials; stuffing buys SEO points but craters AI Search (measured: a stuffed pass
  ran SEO +5 / AI Search −31). Facts + clarity is the future-proof lever.
- **Fill GENUINE gaps only** — missing subtopics/spots/entities, citable facts, real questions.
  Skip mood-filler (stunning/vibrant/great) even when it's flagged "under range".
- **Structure targets are chrome-inflated** — competitors' heading/image/paragraph counts include
  nav, related-posts, comments, footers. Do **not** chase 25+ images (kills Lighthouse) or
  nav-padded heading counts. The tool flags chrome with ⟵.
- **Catch freshness/accuracy** — the tool surfaces stale facts (it caught a "14-day" booking
  window that should be 30). Verify and fix; accuracy beats any score point.
- The **AI Search dial is the one to win** (answer engines); independent tests (Ahrefs, Search
  Engine Land) show the SEO content score correlates only weakly with rankings. Don't chase it.
- **Voice, humour, AND formatting/design are OUT OF SCOPE — untouched.** Add coverage (facts/
  entities/questions) *into* our existing voice (`voice.md`/`DanKennedyVoice.md`/`Humour.md`) and
  our existing format (`DESIGN.md`: native `::infographic`, one cover photo, vetted in-body photos, the
  layout). Never restyle, never change the writing — only add substance in our current style.

---

## THE APPLY CHECKLIST — run EVERY time, minimal judgment (this is the safeguard)

**Failure mode this prevents:** discretion in BOTH directions. A too-timid pass barely moves the
needle; a coverage-only pass leaves the **SEO-density dial low** (red-sand-beach scored SEO **39** /
AI 71 on the first draft, 2026-06-10 — strong coverage, but core terms way under-dense). So the
default is **APPLY ALL genuine gaps AND raise core terms into their density ranges** — target
**SEO ≥70 from the first draft.** Work the brief top to bottom; each row is a fixed rule:

| Brief item | Fixed action (not a judgment call) |
|---|---|
| **🔑 Heading keywords** (the brief's "PUT THESE IN YOUR H2/H3" list) — DO THIS FIRST | **BUILD/RENAME H2s & H3s around them.** Surfer's single biggest SEO lever — a keyword in an H2 is worth far more than in body (validated: red-sand stuck at Surfer 59 with generic H2s; loading the place name + "X trail" + island/region into 7 of 8 headings took heading-coverage 68%→95%). Echo the competitor heading patterns the brief dumps. **Always update the ToC `#anchor` links to match renamed headings** (the anchor is slugified from the heading text) or the ToC gate breaks. |
| Exact primary phrase | **ADD** it verbatim 1-3× — and put it **IN A HEADING** (Surfer's Auto-Optimize literally prepends "`<exact keyword>:`" to a heading; a heading hit counts most). E.g. an H2 "Where is Red Sand Beach, Hana, Maui?" tokenizes to the exact phrase. |
| ❌/⚠ phrase that is a **named entity** (place, beach, trail, landmark, cinder cone, road, condition, gear) | **ADD** each one. Be LIBERAL — "Ka'uiki Head", "private property", "Hana Highway", "naked", "slippery" are all real, not filler. |
| **Core term below its ⚠ range** (the primary phrase + "beach/sand/trail/hike"-type words) | **RAISE into range** — use the proper noun instead of pronouns ("Red Sand Beach", not "it"), and repeat naturally across sections until you hit the LOW end of the range. This is the SEO-dial lever. |
| **Fact candidate** concrete + citable and absent | **ADD** each as a stated fact in its section. |
| **Question** not already answered | **ADD** to the FAQ (or fold into its section). |
| **Intent** item missing (answer / what / who / why) | **ADD** a line to the intro until all four are covered. |
| **Length / density under target** | Keep applying the above + **lengthen with genuine content** to carry the density naturally, until both length AND core ranges are met. |
| Plain generic word the brief flags (located, area, directions, weather, signs, visitors) | **INCLUDE** where it fits — these are fine for density and won't trip ai-slop. |
| Pure **mood adjective** that trips ai-slop (stunning, vibrant, breathtaking, "best place ever") | **SKIP** — those are the only real "filler". Density comes from topical terms + entities, not mood words. |
| Structure: images/headings flagged "under" | **DON'T chase** (chrome-inflated). Meet our own cadence: ≥1 native infographic / ~500 words. |
| A stale/wrong fact you notice | **FIX it** (verify first). Accuracy beats any score point. |

**Loosen toward inclusion.** The bar isn't "is this perfect prose" — it's "did I hit the ranges."
Apply every ❌ that's a real entity/place/condition/gear, include the plain generic words the brief
flags, and raise core ⚠ terms into range. Only skip mood-filler that would trip the ai-slop gate.
**If scoring in Surfer, use SURFER's panel ranges** — its competitor set (mobile, USA, incl. sites
we exclude) often demands MORE density than our tool's, and that panel is the number you're hitting.

**Done = re-run the tool and the ❌ list is only genuine non-applicables** (off-topic entities, facts
we can't verify), length is in range, and 0 HARD slop. Then gate + ship. No "I judged it was already
good enough" — if the brief flags real gaps, they get applied.

---

## Two modes (pick by what the user gives you)

- **Mode A — GAP-FILL (default).** User gives a Surfer *brief* (terms/headings/questions/
  AI-facts). You diff, classify, and surgically add only real gaps in our voice. Steps below.
- **Mode B — VERBATIM COPY.** User pastes Surfer's *optimized article text* and says "use
  this exactly / verbatim / just the copy changes." You apply that wording word-for-word as
  the prose, but **keep our structure and scaffolding** (see the Mode B procedure). The owner
  owns the copy decision; your job is to apply it without breaking the page or the gates.

---

## The model: two tiers of gaps (this governs everything)

Surfer surfaces two kinds of gaps, and they are NOT equal:

1. **Missing SUBTOPICS** — terms in the **Headings** tab that we score 0 on. This is the
   high-value tier: a missing heading = a section Google expects and we don't have.
   **Action: add or expand a section / re-headline existing content.**
2. **Missing TERMS** — words in the **All** tab we score 0 on. Lower value.
   **Action: weave a phrase where it fits — or skip.**

Work tier 1 first. Most ranking movement comes from covering subtopics, not words.

---

# MODE B — VERBATIM COPY (owner pasted Surfer's optimized text)

When the owner pastes Surfer's optimized article and says "use this exactly / verbatim /
just the copy changes," the copy decision is theirs. Apply the wording faithfully — **but
the prose is all that changes.** Structure, formatting, and every link/visual stay.

**The golden rule:** a copy-paste from Surfer drops the links, infographics, and tour cards
(they don't survive the clipboard) and may import bad formatting. **Pasting it wholesale
would delete the affiliate links, internal links, native infographics, and tour cards from
a live, monetized page — an objective regression, not a style choice.** Never do that. If the
owner literally insists on a wholesale replace anyway, STOP and confirm they accept losing
those, in writing, first.

## Mode B procedure (diff the prose, keep the scaffolding)

1. **Read the live post body** in `content/blog.ts`. It almost always already contains ~90%
   of the pasted copy (Surfer optimized *our* article), plus our scaffolding. So this is a
   **targeted diff**, not a rewrite.
2. **Diff the pasted copy against the live prose.** The real changes are usually: filler
   phrases inserted into existing sentences, a few reworded sentences, maybe a new close.
3. **Apply each change as a surgical `Edit`** to the existing sentence — so the surrounding
   `::infographic` / `::tour` directives, `[anchor](url)` affiliate + internal links, image
   embeds, and headings stay exactly where they are. **Do not replace the whole `body`.**
4. **Re-thread links onto matching phrases.** Where the pasted copy has plain text that the
   live post has as a link (e.g. "whale-watching tour", "Hawaii on a budget guide"), keep the
   link on that exact phrase — the *visible words* match the paste, and the income link survives.
5. **Where the pasted copy contains flattened infographic text** (e.g. a card's rows pasted as
   loose lines), do NOT transcribe it — keep the `::infographic <key>` directive, which renders
   that same content as the styled card. Same words on the page, better rendering, zero CLS.
6. **Hard rules still win over "verbatim":** keep place names ASCII in the body (don't import
   "Waikīkī Beach" — write "Waikiki"; diacritics outside parens fail our checker); keep the
   current brand name and author; no in-body Pexels. These are non-negotiable formatting rules,
   not copy choices — apply them silently.
7. **Run the gates** (Step 6 below). The filler often still passes our 0-HARD ai-slop gate, so
   no bypass is usually needed — but **report the SOFT tells and remind the owner the filler is
   unproven** (that's what the GSC baseline will measure). If the build ever fails the gate,
   STOP and flag it; don't silently bypass.
8. **Report + log baseline + commit, hold for "go live"** (Steps 7–8 below, shared).

> Mode B is how `best-time-to-visit-hawaii` was done (2026-06-09): ~23 surgical edits applied
> the owner's Surfer copy verbatim while all 5 affiliate links, the tour card, and the
> infographics stayed intact; Lighthouse held 97/100/100/100.

---

# MODE A — GAP-FILL (Surfer brief) — the steps below

## Step 0 — Tell the user EXACTLY what to grab (always do this first)

On invoke, before anything else, print this checklist and wait for the paste:

```
Open Surfer's Content Editor for <keyword> and copy these (screenshot is fine):
1. Headings tab → the entities scoring 0   ← MOST IMPORTANT (missing subtopics)
2. All tab → the entities scoring 0        ← missing terms
3. Questions tab → all of them             ← FAQ / body fodder
4. AI Search → "Info to cover" tab → the fact list   ← GEO; don't skip
5. The bottom bar: Words target, Headings target
Also tell me the post's current Google position (Search Console) so I can log a baseline.
```

If the user already pasted a brief, skip the ask and proceed. Save whatever they give
to `References/surfer/<slug>.md` (create the folder if needed) as the record.

---

## Step 1 — Load the post + check the freeze rule
- Read the post in `content/blog.ts`. Note current word count (`node scripts/post-stats.mjs <slug>`).
- **Freeze rule:** if the user says it ranks **top-3**, this is additive-only — fix/extend,
  never restructure a winner. If it's lower (ideally "striking distance," positions ~5–20),
  full enhancement is fair game. Posts stuck past ~page 4 are an authority/intent problem,
  not a term problem — flag that and keep the pass light.

## Step 2 — Diff the brief against the live post (stem-aware, not exact)
- For **headings**: which 0-score heading terms have NO matching `##`/`###` in the post?
- For **terms**: which 0-score terms are genuinely absent (check stems/synonyms — we may
  already say "prices" for "hotel rates", "whales" for "humpback whales migrate"). Exact-
  phrase absence is NOT a real gap if the concept is covered.
- For **questions**: which are not already answered in body or FAQ?
- For **AI-Search facts**: which factual points are missing (and verifiable)?

## Step 3 — Classify every real gap (this is the judgment, encoded)
- **Subtopic** (heading gap, or a term that names a real section) → **add/expand a section**,
  or **re-headline existing content** under the wording Surfer wants (preferred — no bloat).
- **Meaningful entity/descriptor that fits the topic** (Memorial Day, trade winds, ocean
  temperatures, a named festival, reef-safe sunscreen) → **weave a phrase** into the right spot.
- **Contentless mood-adjective** (wonderful/fantastic time, beautiful islands, good deal,
  expect plenty, pleasant conditions, clear skies, "start planning") → **SKIP, always.**
  Zero topical signal + reads like an ad + trips helpful-content. We lose no coverage.
- **Already covered by a synonym** → skip; do not duplicate.

## Step 4 — Make the edits, surgically, in our voice
- **Prefer re-headlining existing content** over writing new bulk — especially if the post
  is already at/over Surfer's Words target (longer isn't penalized, but don't pad).
- New sections must be genuinely additive (a *planning/logistics* angle, a quick-reference,
  a per-item breakdown) — never repeat what a month/section already says.
- Every woven term lands inside a real, useful sentence. If you can't add it without it
  reading as stuffing, it belongs in the skip list.
- **Heading hierarchy:** never skip a level (H2 → H3 → H4). Skipping levels fails the
  Lighthouse a11y "heading order" audit. Under an `##`, use `###`, not `####`.
- **Update the ToC** whenever you rename/add an H2 — the anchor id is derived from the
  heading text, so a rename breaks the old `#anchor`. Re-verify every ToC anchor resolves.
- Read `References/DanKennedyVoice.md` + `References/Humour.md`; keep the dry, straight-talk
  voice. Short paragraphs (≤150 words). One opinion / one story max — don't add a second.

## Step 5 — Guardrails (these override Surfer every time)
- **Positioning:** the picnic service stays a SOFT, secondary aside — never add Surfer's
  "how we help / book now" sections. Current brand name is **Hawaii Picnics & Beach Events**
  (never "by Wember").
- **Images:** no in-body Pexels (third-party-cookie audit tanks best-practices); native-visual
  cadence (1 infographic per ~500 words) still holds if you add length.
- **Numbers:** real only. Business numbers from `stats.md`; travel facts need a verifiable
  source. Never invent a figure to satisfy an AI-Search "fact."
- **Diacritics:** ASCII in headings/ToC/alt/meta; Hawaiian spelling in parens once on first
  mention only (per `BlogStructure.md` §3a).

## Step 6 — Gates (our QA, not Surfer's score)
- `npm run build` → `○ (Static)`, route prerendered.
- `node scripts/ai-slop-check.mjs <slug>` → **0 HARD tells** (pre-existing SOFT tells in the
  original body are not yours to fix here; just don't add new ones).
- `node scripts/post-stats.mjs <slug>` → length sane, visual cadence still ✅.
- **Lighthouse ≥ 95 / 100 / 100 / 100** (serve + run; re-check a11y after heading changes).
- ToC anchors: 0 missing. Built HTML contains each new heading term in an actual H-tag.

## Step 7 — Report + log the baseline (closes the measurement loop)
- Show a **diff** + a table: **terms/subtopics added vs deliberately skipped (with reasons).**
- Append to `References/surfer/<slug>.md`: date enhanced, the **baseline GSC position**, the
  Surfer SEO/AI-Search scores before, and what changed. This is the A/B record — revisit in
  **4–8 weeks** to see if enhanced posts climbed (if not, it's authority/intent, not terms).
- **Pair every pass with:** a 30-sec intent check (does our format match what's ranking?) and
  2–3 internal links *into* this post from relevant posts (on-page terms are one lever, not the
  only one).

## Step 8 — Commit, hold for "go live"
- Focused commit (post + `References/surfer/<slug>.md`), co-author trailer. **Do not push**
  until the user says "go live" (each push burns a Netlify build credit). One post = one build.

---

## Acceptance criteria

**Both modes:**
- All guardrails held (soft picnic, current brand, no Pexels, real numbers, ASCII place names).
- **Every affiliate link, internal link, infographic, and tour card that was on the live page is
  still on it** — nothing monetizing or visual deleted. Body was edited surgically, never replaced
  wholesale.
- Gates green: build static, 0 HARD slop (or flagged + owner-accepted), Lighthouse ≥95/100/100/100,
  ToC anchors resolve.
- Baseline GSC position logged to `References/surfer/<slug>.md` for measurement.
- Committed, not pushed (held for "go live").

**Mode A (gap-fill) additionally:**
- Additive only; nothing good removed; freeze rule respected for top-3 posts.
- Every missing **subtopic** worth having is a heading (re-headlined where content existed);
  meaningful terms woven naturally; **filler skipped with reasons reported.**

**Mode B (verbatim) additionally:**
- The owner's pasted copy is applied **word-for-word as the prose** (only ASCII/diacritic and
  brand-name formatting rules silently override it); changes were surgical `Edit`s, with links/
  directives re-threaded onto the matching phrases. SOFT tells + "filler unproven" noted in the report.
