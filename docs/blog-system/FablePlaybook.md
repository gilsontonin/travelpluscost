# The travelpluscost Playbook — how to write a where-to-stay post the right way

> **Adapted for travelpluscost** from the Fable Hawaii playbook (Claude Fable 5, 2026-06-12), translated
> to our stack and our brand. **Audience: the model executing `write-blog-post` (Opus or any other).**
> This file encodes the judgment calls the checklists can't enforce — the checklists say WHAT must be
> true; this file says HOW to get there on the first or second try, and WHERE cheaper runs cut corners.
>
> Hierarchy: the **governing manual is `BLOG-PLAYBOOK.md`** (voice, the corner-cuts, the process,
> the pre-publish ritual) + **`TheBible.md`**; the inventory program is **`References/InventoryPosts.md`**;
> brand/compliance is **`docs/POSITIONING.md`** (non-negotiable). This file sits beside `WritingLessons.md`
> — read both first. If anything here conflicts with `Voice.md`, Voice.md wins. **Nothing here relaxes a
> gate.** The one rule that overrides everything: **never reveal the net cost or the exact markup %, claims
> are exactly true, no fake scarcity** (POSITIONING.md).

---

## 0. The contract (read this even if you skip everything else)

You are not done when the post "looks good." You are done when **every number on the status board is
green and you printed the board.** A finished run produces, in order: `blog:stats` in band → `blog:slop`
0 HARD → `blog:serp` ≥ 90 → `blog:cta` 0 leaks → `blog:checklist` 25/25 → typecheck/lint/build clean →
**`npm run check` 2/2** → `blog:lh` ≥ 90/100/100/100 → the checklist table → exec summary → commit. Missing
any artifact = the run is not finished. No "close enough," no summarizing past a gate, no success without
the numbers.

**The unavoidable gates (owner-override only):**

| Gate | Bar | Tool |
|---|---|---|
| SEO score (raw) | **≥ 90** — floor, not target; land 92+ and squeeze higher | `npm run blog:serp -- "<kw>" --draft <slug> --urls "<real rankers>"` |
| AI-slop | **0 HARD** (chase the SOFTs) | `npm run blog:slop -- <slug>` |
| Length | IN the serp band; every content H2 ≥ ~250w | `npm run blog:stats -- <slug>` |
| Visual cadence | ≥ 1 visual per ~500w of final count | `npm run blog:stats -- <slug>` |
| CTA / leaks | **0 leaks**; every named hotel carded or linked; a CTA per section | `npm run blog:cta -- <slug>` |
| Checklist | **25/25 AUTO**, printed as a table | `npm run blog:checklist -- <slug> --kw "<kw>"` |
| **Claims integrity** | **`check: 2/2`** — the silent Netlify deploy gate | `npm run check` |
| Lighthouse | **perf ≥ 90 · a11y/BP/SEO = 100** (inventory-heavy pages may run perf ~84–90; SEO must be 100) | `npm run blog:lh -- /blog/<slug>` |
| Internal links | de-orphaned (≥1 inbound) + a cluster cross-link | `npm run blog:internal -- --page <slug>` |

**Run `npm run check` before every push.** It is the Netlify build gate (ai-slop + claims-integrity); a
failing `check` makes `git push` succeed but the deploy silently fail. Unverifiable superlatives
("most-reviewed", "world-class", "lowest price") fail it — rephrase to a verifiable fact.

---

## 1. The corner-cutting catalogue — each one is forbidden, by name

1. **Stopping at 88–89 because "it's basically 90."** Loop. Re-run `blog:serp`, open the brief, work the
   ADD list top-down, re-run. The gate is a floor — land with margin (92+) because later edits (FAQ swaps,
   checklist fixes) shift the score and you must re-run after them. This session: St. Augustine 43→91,
   Charleston 67→91, Savannah 55→93. None shipped at 89.

2. **Wrong length — too short OR too long.** Read the serp **band** BEFORE drafting (floor = competitor
   median, ceiling = longest genuine competitor, the ≥1.5×-median outlier excluded). Section budget:
   ~280w/H2, **section count = working-target ÷ ~280** — NOT a fixed number. **Deep SERP (Savannah band
   ~4,500w) → fill with genuinely helpful info, never padding** ("inventory first, then helpful, helpful,
   helpful"). Under the band → fatten existing sections with real detail; over the ceiling → merge/cut.

3. **Spot-checking the checklist.** Every row of `blog:checklist`, as a table. The full pass catches the
   bolded-full-*sentence* (rule is the PHRASE), the description > 160, the missing inbound link.

4. **Running a gate once, then editing, then not re-running.** `blog:stats`/`blog:serp` run on the FINAL
   text. Deepening sections raises the count → raises the visual-cadence target. Every batch of edits → re-run.

5. **Inventing or rounding facts.** §4. Years, counts, distances stated only when verified (primary site,
   .gov, or in the fetched competitor corpus). **Never a price** — POSITIONING forbids stamped prices;
   say "search current prices" / market ranges only.

6. **Treating humour as a garnish.** §3, written FUNNY FIRST. An accurate-but-dry post fails even with
   every gate green. Draft the beat INTO the section so it carries the fact.

7. **Spell every word out — no contractions, no dashes, no prose colons/semicolons** (owner rule 2026-06-28).
   Write "do not" / "we will" / "it is", split with `.` and `,`. Expanding to full words also matches the "do
   not" / "we will" tokens competitors use, so the scorer does not suffer. Run `npm run blog:style` (a `check`
   gate) to auto-fix and verify; titles and the `**The move:**` strips keep their colon.

8. **FAQ that re-answers the body.** The swap test: if an H2 already answers it, swap for a genuine
   leftover. FAQ H3s carry scorer heading credit — re-run `blog:serp` after a swap.

9. **Accepting the first cover / skipping inspection.** The cover is a **real cupid hotel photo**
   (`static.cupid.travel/hotels/<imgid>.jpg`) — `curl` it to the scratchpad and **Read it** before using;
   never pick a URL blind (that is how a grey cover ships). Honest alt text with the keyword. **The cover
   hotel is NOT carded** (no duplicate of the same photo).

10. **Linking without curling.** Every external URL gets a `curl` 200 check before it goes in. Internal
    links (`/hotels/<city>`, sibling posts) must resolve — the hub, not `/search` (the hub is indexable).

11. **Forgetting infographics are invisible to the scorer.** `blog:serp` reads the markdown body only.
    When content moves into a `::infographic`, keep one entity-rich prose sentence beside the directive,
    or the body score silently drops. Never hit the visual quota by leaning on `::priceproof`/`::cta`.

12. **Declaring done with anything red.** A failing build/`check` never deploys; a sub-90 score never
    ships. Committed-but-unpushed is the correct resting state. **HOLD the push until the owner says "go
    live."** Silence about a red gate is the one unforgivable move.

---

## 2. The drafting method, in execution order

1. **Pre-flight + scaffold:** `npm run blog:next -- "<city>"` — checks ≥8 rate-verified hotels (or skip
   the city), prints the runbook, emits the scaffold. No inventory, no post.

2. **Research SERP-first (no Semrush — dropped, too expensive).** WebSearch `where to stay in <city>` →
   take the genuine ranking guides as the `blog:serp --urls` (exclude Reddit/TripAdvisor/Yelp/OTA
   listings/big-media). WebSearch the People-Also-Ask → the FAQ + a section. `blog:serp` gives the band +
   the ADD list. **The SERP tells you what to cover so you cover it more completely** — the depth signals
   how much helpful content the keyword demands.

3. **Cannibalization check, then LOG the cluster.** Check the city against `content/keywords.json` and
   existing slugs. After the post ships, **write the locked cluster to `content/keywords.json`** (primary +
   secondary[] + volume/kd/intent/database/researched/status) — non-skippable; it is the
   cannibalization ledger.

4. **Plan structure + INVENTORY together (we are cost-plus, not affiliate — there is no `::tour`).** Map
   each area to its hotels (`::hotel <id>` for rate-verified, `::rail <area>` for an area rail), each
   value-able block to an `::infographic`, the pricing block to `::priceproof`, the close to `::cta
   <dest>`. Headings carry keyword phrases (the area names, "best time to visit", "is it walkable"). The
   "money" is the **booking funnel to `/hotels/<city>`**, not an affiliate click.

5. **Intro to a formula.** Sentence 1: the answer, primary keyword verbatim (comma-free so it tokenizes),
   the answer PHRASE bolded (the phrase, not the whole sentence). Within 50 words: one dry hook. Then:
   what the guide covers, who it's for, a visible "as of 2026". CTR title: **`Where to Stay in <City>, <ST>:
   Best Areas & Hotels (<year>)`**. No `· travelpluscost` brand suffix (it overflowed titles — removed).

6. **Body sections run a repeating unit:** H2 (benefit-driven, the area) → 80–120w of section prose with
   one beat → the hotels (`::hotel` cards / named-and-linked) → a quick-facts strip: `**The move:** X ·
   **Best for:** Y · **Watch:** Z`. **Inventory-first, then exhaustive helpful info** — areas + hotels
   lead, then things-to-do, food, walkability, when-to-visit, history, day trips.

7. **Then the loop:** `blog:stats` → deepen flagged sections with REAL detail → `blog:slop` → `blog:serp`
   → work the ADD list (heading lever first; never stuff) → re-run → `blog:cta` (0 leaks) →
   `blog:checklist` → de-orphan (`blog:related` + an inbound link from a sibling) → cluster cross-link →
   typecheck/lint/build → **`npm run check`** → `blog:lh` → log `content/keywords.json` → commit → **HOLD**.

---

## 3. The humour mechanics

Four shapes that land in this voice (copy the shape, never the line; full set in `Humour.md`):
1. **Deadpan over-serious treatment of something tiny** ("downtown parking is the real headache").
2. **The hyper-specific observation that proves you were there** ("Romy's sells out by 2pm").
3. **The institutional voice applied to small things.**
4. **The two-sentence setup-and-walk-away** — long honest setup, short flat punch, no wink.

Rules: one beat per major section at most; never two of the same shape back-to-back; nothing at the
reader or a culture; somber topics get zero jokes; if a line needs an exclamation mark, it isn't
finished. After drafting, do one pass JUST for humour. **Variety across the corpus, not just within a
post** — a reader who reads three of ours should not feel the template.

## 3b/7. The engagement layer — the gates are necessary, not sufficient

Every gate measures whether the post will RANK and won't read as slop. **None measure whether it gets
READ.** The owner's standing call: **one engaged reader is worth ten who land and bounce.** A green-gated
post that loses the reader on the first screen failed, even at 95.

1. **The first screen is the whole bounce decision.** Mobile reader decides in ~3 seconds. The opening
   must (a) answer the query in sentence 1 with the bolded phrase, (b) prove a human wrote it within 50
   words (a dry hook or one impossible-to-fake local detail), (c) promise the specific payoff. No
   throat-clearing, no "in this guide we will," no scroll-down tease.

2. **Verdicts, not catalogues.** A confident "here are the areas that matter and exactly why" engages
   more than 30 even descriptions. Every section ends on **a move, not a description** — that is what the
   `**The move:**` strip is for. A section that only describes is where the reader leaves.

3. **One quotable line per section** — specific, true, a little funny; the line a reader texts their
   travel buddy. If a section has none, it has no reason to be remembered.

4. **Two readers at once.** The skimmer needs bolds, strips, the TL;DR, the "if you only do one thing".
   The stayer needs the prose, the opinion, the dry beat to be rewarded. Both are served; neither optional.

5. **At least two honest "when not to."** Telling someone to skip the resort dinner / the carless
   pilgrimage signals you are on their side — the single most engaging move. A reader who trusts you reads
   everything else more carefully.

6. **Internal links are momentum, not plumbing.** A "read this next" placed where the question forms keeps
   the session alive — and session depth is both Google's engagement signal AND the path to a booking.
   Drop the cluster link mid-sentence where curiosity peaks, not in a footer dump.

7. **The close earns the next click, not a sale.** End on a line that makes them want the next plan, never
   "hopefully this helps."

**The loop closes on engagement, not rank.** `blog:serp` + the gates are the PRE-publish proxy. The
POST-publish truth is GA4 engagement time + scroll depth, read alongside GSC position/CTR via
**`/run-site-health`**. When a post ranks but engagement is short, deepen the intro and early sections —
do NOT chase more keywords. (Folding GA4/GSC into `/run-site-health` is the open enhancement that closes
this loop.)

## 4. The fact + compliance protocol

- **Tier 1 — state freely:** facts verified against a primary source this run (curl 200 first) or present
  in the fetched competitor corpus.
- **Tier 2 — state without numbers:** confident-but-unverified ("short weekday hours — check before you
  drive").
- **Tier 3 — omit:** invented prices, capacities, distances, review counts. An unverifiable year is
  deleted, not guessed. ≤ 2–3 batched WebSearches on verification.
- **POSITIONING compliance (non-negotiable, overrides everything):** never publish the net/wholesale cost
  or the exact markup %; **never a stamped price** — market ranges only, "search current prices"; claims
  **exactly true** (FTC) — no "lowest price", no unverifiable superlatives (they also fail `npm run
  check`); **no fake scarcity/discounts** ("1 left", "$X off"). Public pages show the SSP; below-SSP is
  member-gated only.

## 5. The blog:fable editor pass

`npm run blog:fable -- <slug>` sends the post body to Claude for a line-edit toward the house voice
(tighter, dry-funny, no AI tells) **without changing facts, structure, links, or `::` directives**. It
**prints a suggested rewrite + a rationale for you to review and apply by hand** — there is no auto-splice
in our version. Workflow: run it after the draft already clears the mechanical gates (≥90, 0 slop, stats
clean); read the rationale; apply the changes that genuinely sharpen the voice; **re-run the gates after**
(an edit can move the score). The spirit of the original still holds: **voice and engagement outrank a
score residual** — if a voice improvement costs a point, log the before→after and keep the voice, do not
claw points back by un-doing the edit. (The fuller byte-exact apply + tamper-guard governance from the
Hawaii system is a possible future build; today the pass is advisory.)

## 6. The exemplar corpus (the few-shot layer)

Before drafting, read **one** of these end to end in `src/lib/posts.ts` — pick the one whose SERP depth
matches yours — and copy the *shapes* (section rhythm, the move/best-for/watch strip, the inventory-first
order, the FAQ leftovers), never the lines:

| Exemplar | Format / SERP it teaches | Score it shipped at |
|---|---|---|
| `where-to-stay-in-charleston` | moderate SERP, sub-area H3s (French Quarter / King St), ~14 cards | 91 |
| `where-to-stay-in-savannah` | **deep SERP** (~4,500w competitors) — fill with helpful sections, not padding | 93 |
| `where-to-stay-in-scottsdale` | shipped at the floor cleanly + the AZ cluster cross-links | 90 |

Keep this list at three; when a clearly better exemplar ships, REPLACE the weakest, don't append. Once
GA4 + GSC accumulate ~60–90 days, re-pick on **measured engagement**, not serp score — a post that ranks
#15 but holds readers 4 minutes is a better style teacher than one that scores 96 and bounces in 20s.

## 8. The pre-commit ritual (five minutes, not optional)

Read the rendered post top to bottom, once, as a tired traveler planning in bed on a phone. Then answer
honestly in the run log:
1. Would a local who knows this city nod, or wince? (facts + vocabulary)
2. Did I smile at least ~once per 500 words? (humour presence)
3. Does every section answer "so what should I actually do?" (verdicts, not descriptions)
4. Is the single most useful thing findable in 10 seconds by a skimmer? (TL;DR, bolds, strips)
5. First-screen test, one quotable line, want-the-next-page close — did the engagement vibe check pass?
6. Is every gate number green AND printed — including `npm run check`?

If any answer is no, the run isn't done. The standard is the answers being yes — that, not the model
name, is "writing like Fable."
