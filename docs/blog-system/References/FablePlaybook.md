# The Fable Playbook — how to write a post exactly the way Fable 5 does

> **Written by Claude Fable 5 on 2026-06-12**, immediately after shipping `best-places-to-eat-oahu`
> (94/100 SEO, 96/100/100/100 Lighthouse, 0 slop) — while the method was fresh. **Audience: the model
> executing `write-blog-post` (Opus or any other).** This file encodes the judgment calls the checklists
> can't enforce. The checklists say WHAT must be true; this file says HOW Fable gets there and WHERE
> cheaper-model runs historically cut corners.
>
> Status in the hierarchy: sits beside `WritingLessons.md` (read both FIRST). If this file ever
> conflicts with `Voice.md`, Voice.md wins. Nothing here relaxes a gate — it explains how to clear
> them on the first or second try instead of the fifth.

---

## 0. The contract (read this even if you skip everything else)

You are not done when the post "looks good." You are done when **every number on the status board is
green and you printed the board**. The standard run today produced, in order: post-stats clean →
slop 0/0 → serp-optimize ≥90 → build clean → HTML audit board → Lighthouse ≥95/100/100/100 →
checklist table (every row, ✅/❌) → exec summary → commit. If your run is missing any of those
artifacts, the run is not finished — there is no "close enough," no summarizing your way past a gate,
and no declaring success without pasting the numbers.

**The unavoidable gates (owner-override only):**

| Gate | Bar | Tool |
|---|---|---|
| SEO score (raw) | **≥ 90/100** | `node scripts/serp-optimize.mjs "<kw>" --draft <slug> --urls "..."` |
| AI-slop | **0 HARD** (and chase the SOFTs) | `node scripts/ai-slop-check.mjs <slug>` |
| Length: IN the band + no thin sections | total within the serp-optimize band (median…longest-genuine, outlier excluded); every content H2 ≥ 250w (ToC exempt) | `node scripts/post-stats.mjs` |
| Visual cadence | ≥ 1 per ~500w **of final count** | `node scripts/post-stats.mjs` |
| Lighthouse | ≥ 95/100/100/100 | the skill's lighthouse command |
| Checklist | every row, printed as a table | `References/BlogPostChecklist.md` |

---

## 1. The corner-cutting catalogue — each one is forbidden, by name

These are the specific shortcuts that separate a Fable run from a lazy run. Each entry: what the lazy
version looks like → what is required instead.

1. **Stopping at 88–89 because "it's basically 90."**
   Required: loop. Re-run the scorer, open the brief, work the ADD list top-down, re-run again. Today's
   post hit 78 → 90 → (edits dropped it to 89) → 94. The third loop took eight small edits and
   fifteen minutes. The gate is a floor, not a target — land with margin (92+) because later edits
   (FAQ swaps, checklist fixes) shift the score and you must re-run after them.

2. **Wrong length — too short OR too long (the 2× overshoot).**
   Required: read the serp-optimize **BAND** BEFORE drafting (floor = competitor median, working target =
   median×1.15, ceiling = longest GENUINE competitor; the ≥1.5×-median outlier is EXCLUDED — this is THE
   standard, calibrated to the Surfer editor's word range). Then a **section budget**: ~280w/H2, and
   **section COUNT = working-target ÷ ~280** (~6–8 H2s for a ~1,700 band, ~12–14 for a ~4,000 one) — NOT a
   fixed 10–13. The historical failure was sizing section count to the competitors' heading count (~14) while
   holding the 250w floor → a hard ~3,500w minimum decoupled from the band → every post shipped ~2–2.5× over.
   When UNDER the band, FATTEN existing sections with real detail; when OVER the ceiling, MERGE/CUT sections —
   never deepen (deepening an over-band post IS the overshoot). H3 per named entity. Never pad in either direction.

3. **Spot-checking the checklist ("the big ones pass, ship it").**
   Required: every row of `BlogPostChecklist.md`, ticked by hand, output as a table. Today the full
   pass caught three real misses on an otherwise-green post: a bolded full *sentence* (rule is the
   PHRASE), a FAQ that re-answered a body section (the manapua lesson), and a missing .gov link. A
   spot-check would have shipped all three.

4. **Running post-stats once, then editing, then not re-running.**
   Required: post-stats runs on the FINAL text. Deepening sections raises the word count, which raises
   the visual-cadence target (1 per ~500w). Today the count went 4,475 → 5,061 and the target went
   9 → 10; an extra native infographic (the fancy-night cards) covered it. Same for the scorer: every
   batch of edits → re-run.

5. **Inventing or rounding facts to keep momentum.**
   Required: the verification protocol of §4. Today the competitor corpus said Leonard's opened 1953;
   the primary source says **1952**. One WebSearch caught it. Years, awards, and counts are stated
   ONLY when verified (primary site, .gov, or explicitly present in the fetched competitor corpus);
   otherwise drop the number and keep the claim qualitative. Menu prices: only corpus-cited ones, as
   "about $X." Business numbers: `stats.md` only, never rounded.

6. **Treating humour as a garnish line in the intro — the info-first-then-sprinkle dry-read.**
   Required: the beat plan of §3, written FUNNY FIRST. A post that is accurate but dry fails the standard
   even with every gate green. The recurring miss is sequencing: writing the encyclopedia entry, then
   dropping a mild aside on top — that ships decoration, not jokes. Draft the beat INTO the section so it
   carries the fact (swap-meet: the "banker's hours" line *is* the hours). The on-point test for every
   beat: does it earn a **nose-exhale/nod**, or is it merely **true**? A true statement is not a joke —
   sharpen (specific / absurd-but-true / stakes-inflation) or cut. The vibe check: does it read like a
   **friend at a bar dropping truths, a little sarcastic, not taking life too seriously, in the vacation
   mood** — respectful, never mean? If it reads like a competent encyclopedia entry, warm it up BEFORE
   shipping. (Frequency per `Humour.md`: ~1–2 dry beats per major section, never forced, never at the
   reader or Hawaiian culture, zero near somber topics.)

7. **Writing without contractions.**
   Required: contractions always (`Voice.md`). This is also free scorer money — the tokenizer strips
   apostrophes, so "don't"→`dont` and "you're"→`youre` match competitor body terms that "do not" /
   "you are" never will. Today a contraction pass fixed a voice gap AND closed scorer gaps at once.

8. **FAQ that re-answers the body.**
   Required: the swap test. For each FAQ question ask: "does an H2 or a rule in the body already
   answer this?" If yes, swap the question for a genuine leftover (today: "what time do restaurants
   close" duplicated rule two → swapped for "can you drink alcohol on the beach," which is useful,
   leftover, and true). WARNING: FAQ H3s carry scorer heading credit — re-run the scorer after a swap
   (the swap cost 1 point today and had to be earned back).

9. **Accepting the first stock photo / skipping attribution.**
   Required: 2–3 Unsplash queries, download the top candidates small, actually LOOK at them, pick the
   one that sells the post's promise. ONE cover only, honest alt text with the keyword, photographer
   credit line at the end of the body. In-body photos OK (re-enabled 2026-06-16) but INSPECT every candidate for quality + location first; native infographics also carry the visuals.

10. **Linking without curling.**
    Required: every external URL gets `curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0" -L <url>`
    BEFORE it goes in the draft. Standing trap: **gohawaii.com now 403s even on `/islands/<island>`
    paths** (confirmed 2026-06-12) — do not use it at all. Primary sources (a restaurant's own site)
    are legitimate authority links for claims about that business.

11. **Forgetting that infographics are invisible to the scorer.**
    Required: the scorer reads the markdown body only. When content moves into `content/infographics.ts`,
    keep one entity-rich prose sentence beside the directive (names in prose, details in cards), or the
    body score silently drops. Corollary: never hit the visual quota by leaning on `::tour`/`::directions`
    — native infographics carry the cadence.

12. **Declaring done with anything red.**
    Required: a failing build never deploys; a sub-90 score never ships; if a gate cannot be cleared,
    STOP and say so with the numbers. Committed-but-unpushed is the correct resting state for
    imperfect work — silence about a red gate is the one unforgivable move.

---

## 2. The drafting method, in execution order

1. **Pick with a cannibalization check, not just the script.** `keyword-candidates.mjs` surfaces
   candidates; YOU check each against existing slugs and `Used_Keywords.md` secondaries. Today the
   finder's #1 and #3 picks ("best beach in oahu", "best places to stay in oahu") both cannibalized
   live posts; the right pick was #2's neighbor with a ~13k/mo secondary family and zero overlap.
   Sister keywords above the KD cap (e.g. "best restaurants in oahu," 1,600/KD30) become woven-in
   secondaries and logged so no future post anchors on them.

2. **Select competitors by INTENT, then let the brief drive.** WebSearch the keyword; pick ~10 genuine
   blog competitors; exclude Reddit/TripAdvisor/Yelp/YouTube/Wikipedia/big-media hubs and any page
   that shares the keyword but answers a different question. Read the brief's competitor outlines and
   copy the dominant FORMAT (today: named-spot listicle, grouped by region, with per-spot quick-facts
   — so that is exactly what we built).

3. **Plan monetization and structure together, before writing.** Map each section to its affiliate
   (hero `::tour` = the single most on-topic product; bottom block = 3 more, island-verified in
   `viatorTours.ts`), each dish/topic to its internal-link target, and each visual-able block to an
   infographic kind. Headings carry keyword phrases: give exact secondary phrases their own H2s
   ("The best food trucks on Oahu" = the 470/mo secondary, verbatim).

4. **Write the intro to a formula.** Sentence 1: the answer, with the primary keyword verbatim
   (comma-free, hyphen-free) and the answer PHRASE bolded — `The best places to eat in Oahu are mostly
   **cheap, local, and nowhere near a resort dining room**`. Within 50 words: one dry hook ("Your
   hotel concierge means well. The 7-Eleven musubi case means more."). Then: what the guide covers,
   who it's for, the visible "as of <month> 2026" freshness line. No wind-up, no "scroll down" tease.

5. **Body sections run a repeating unit:** H2 (benefit-driven, sentence case) → 80–120w of section
   prose with one beat → H3 per named entity → 2–3 sentences of real detail per entity → a quick-facts
   strip: `**The move:** X · **When:** Y · **Note:** Z` (rotate the third label: Local tip / Travel
   tip / Note). The strip is body text — it counts for the scorer and the reader.

6. **One opinion (from `Opinions.md`, wired to a real number), one story (from `Stories.md`, placed
   where the reader is physically standing in the narrative — today: the shaka born at Kahuku, told
   while you wait in the Giovanni's line), one sensory line max, several when-NOT-to beats** (skip the
   pilgrimage if carless; the line-wrap fallback; one fancy night is the right dose).

7. **Then the loop:** post-stats → deepen flagged sections with REAL detail → slop-check → insert →
   scorer → work the ADD list (skip only chrome junk like `content`; everything else is fair game,
   woven naturally — if a term can't be placed without sounding stuffed, place its honest cousin and
   move on) → re-run → backlinks in (1–3, with unique anchors verified by grep) → logs → build →
   audit → Lighthouse → checklist table → exec summary → commit.

---

## 3. The humour mechanics (the part most models actually miss)

Four shapes that reliably land in this voice — copy the shape, never the line:

1. **The deadpan over-serious treatment of something tiny.** "Napkins are load-bearing." "Garlic
   butter obeys gravity and rental-car upholstery files a report with the agency."
2. **The hyper-specific observation that proves you were there.** "A paper bag that immediately goes
   translucent." "Sugar drifting onto your shirt like beach sand you'll be finding for days."
3. **The institutional voice applied to street food.** "Boxes of coco puffs carried onto inter-island
   flights like diplomatic pouches." "A service pace that has not acknowledged a single food trend
   since statehood."
4. **The two-sentence setup-and-walk-away.** Long honest setup, short flat punch, no wink: "Oahu's
   food pyramid is built on rice, and the view from the top is a parking lot."

Rules of engagement: one beat per major section at most; never two of the same shape back-to-back;
nothing at the reader, locals, or Hawaiian culture; somber topics get zero jokes; if a line needs an
exclamation mark to land, it isn't finished. After drafting, do one pass JUST for this — count the
beats; if a 5,000-word post has fewer than ~8, it shipped dry.

**Variety across the corpus, not just within a post.** With 100+ posts live, a reader who reads
three of ours should not feel the template. Rotate the strip label's third slot, vary the "if you
only do one thing" phrasing, and don't open every post with the same concierge-correction move.
The four joke shapes are a palette, not a checklist — a post can lean on two of them and skip the
others. Sameness across posts is the slow death of a voice; freshness within the SAME voice is the
craft.

## 3b. The engagement layer — the gates are necessary, not sufficient (added 2026-06-13)

Every gate in §0 measures whether the post will RANK and won't read as slop. **None of them
measure whether the post gets READ.** The owner's standing call settles the priority: *one engaged
reader is worth ten who land and bounce.* A green-gated post that loses the reader on the first
screen failed, even at 95/100. This section is how Fable writes for the reader who stays — and it
outranks a score residual every time (see §5: Fable copy ships verbatim even if the score dips).

**1. The first screen is the whole bounce decision.** Most travel research is mobile, and the
reader decides to stay or pogo-stick back to Google inside the TL;DR + first paragraph — before
they ever reach your best section. So the opening is not "the intro," it is the audition. It must:
(a) answer the literal query in the first sentence with the bolded phrase, (b) prove a human local
wrote it within 50 words (the dry hook or one impossible-to-fake detail), and (c) promise the
specific payoff. No throat-clearing, no "in this guide we will," no scroll-down tease — every one
of those is a bounce.

**2. Specificity is the real engagement engine — more than humour.** What keeps a reader is the
mounting sense that this person actually KNOWS: "Romy's sells out by 2pm, get there by noon," "park
at the Store Lots, not the lot by Longs on a Saturday," "the bypass road skips the jam." Decision-
grade, current, local detail is simultaneously (a) the thing Google's Experience signal rewards,
(b) the thing that makes a reader trust you enough to keep scrolling, and (c) the thing that earns
the affiliate click. When choosing between adding another named spot and going deeper on the ones
that matter, go deeper. Breadth ranks; depth engages.

**3. Every section must end on a verdict or a move, never a description.** A reader stays when each
section pays off the question it raised. "Pupukea Grill does ahi loco moco" is a description;
"order the ahi loco moco, post-snorkel, and skip the line at noon" is a move. The quick-facts strip
exists for exactly this — it's the section's verdict made scannable. A section that only describes
is where the reader leaves.

**4. Write for both readers at once — the skimmer and the stayer.** The skimmer needs bolds,
strips, the TL;DR, and the "if you only do one thing" line to extract value in ten seconds. The
stayer needs the story, the opinion, and the dry beat to be rewarded for reading the prose. The
same post serves both; neither audience is optional. If a post is all scannable furniture and no
prose worth reading, the skimmer is served and the stayer (the one who converts) is bored.

**5. Internal links are an engagement lever, not just SEO.** A reader who clicks "read this next"
is now a two-page session — the literal opposite of a bounce. So place the cluster links as genuine
invitations at the moment the question naturally arises ("the full shrimp breakdown is here"), not
as a link dump at the bottom. One well-placed "read this next" mid-post beats five stacked in a
footer. The topic cluster IS the session-depth play.

**The training loop closes on engagement, not rank.** serp-optimize and the gates are the
PRE-publish proxy. The POST-publish truth is GA4 — average engagement time, scroll depth, and
engagement rate per post — read alongside GSC position/CTR via `/site-health`. When a post ranks
but GA4 shows a short engagement time, that's the signal to deepen the intro and the early
sections, NOT to chase more keywords. Rank gets them to the page; engagement is the product.

## 4. The fact protocol

- **Tier 1 — state freely:** facts from `stats.md`, dates/claims verified against a primary source
  this run (curl it 200 first), and numbers explicitly present in the fetched competitor corpus
  (cite-as-about).
- **Tier 2 — state without numbers:** things you're confident exist but can't verify this run
  ("short weekday hours — check before you drive" instead of exact hours).
- **Tier 3 — omit:** anything else. No invented prices, capacities, distances, or review counts. An
  unverifiable year is deleted, not guessed.
- Spend at most 2–3 WebSearches on fact verification, batched (today: one search verified Leonard's
  1952 + 15,000/day; one verified Matsumoto 1951 + Giovanni's 1993). Anchor facts only — not every
  sentence needs a citation, but every NUMBER needs a tier.

## 5. The Fable editor pass — protocol, authority, and the tamper guard

**When it runs:** automatically, in every `write-blog-post` run, whenever `ANTHROPIC_API_KEY` is in
`.env` and `@anthropic-ai/sdk` is installed. The key's presence IS the on-switch — no per-run
decision. If the API call errors or refuses, ship the pre-pass version and say so on the status
board (`fable-pass: skipped — <reason>`). Cost is ~$0.65/post (printed by the script); never run
Fable as the agent for the whole workflow via API — the agentic shape costs 50–100× the one-shot.

**The owner's bypass — "no fable" wins, anytime, any phrasing.** "no fable", "no fable pass",
"skip fable", said in the request or mid-run, skips the pass for that post with zero pushback —
typical reasons: a low-search-volume page not worth $0.65, a quick edit, a test page. Board line:
`fable-pass: skipped — owner bypass`. And the pass lives ONLY inside `write-blog-post` (Step 8a)
and `review-blog` FULL re-opts (Step 6b): small one-off edits, technical fixes, money pages, and
anything else NEVER trigger it — the executing model runs solo there by design, no bypass needed.

**Where it sits in the pipeline:** AFTER the draft already clears the mechanical gates (score ≥90,
slop 0 HARD, post-stats clean, draft inserted in `blog.ts`) and BEFORE build/Lighthouse/checklist.
Fable polishes a structurally final draft; the post-pass re-runs are then small deltas.

**The three commands (in order):**

1. `node --env-file=.env scripts/fable-pass.mjs <slug>` → writes
   `content/drafts/<slug>.fable-pass.md` (revised body + Judgment flags). Read the flags — they are
   publish-gate input (e.g. "this year looks unverified" → verify or strip it).
2. `node scripts/fable-pass.mjs --apply <slug>` → splices the revised body into `blog.ts`
   **byte-exact, by script**. NEVER apply the body by retyping or by Edit-tool transcription —
   mechanical application is what makes the guard meaningful.
3. After re-running the gates: `node scripts/fable-pass.mjs --verify <slug>` → must print
   `fable-guard: identical` (or acknowledged drift, below). This line goes on the publish status
   board next to the Lighthouse scores. **Unexplained drift = the run is not done.**

**The authority rule (this is the gate the owner asked for):** after `--apply`, the prose belongs
to Fable. The executing model does not get to "not like" a line — taste disagreements are ROUTED,
not resolved by rewriting: ship Fable's version and write the objection in the exec summary under
`## Pass objections` for the owner to arbitrate. Editing Fable's prose because it "reads better
another way" is the same violation as skipping a gate.

**The only three legitimate post-pass edits** (each = smallest possible diff, each acknowledged):

1. A build-breaking character Fable introduced (backtick, `${`).
2. An `ai-slop-check` HARD tell it introduced — replace the single word.
3. A factual error vs a verified source — fix the fact, keep the sentence's shape.

**REMOVED — the scorer-recovery edit (owner directive, 2026-06-13).** There used to be a fourth
permitted edit: "the scorer dropped below 90 — term-level fixes from the ADD list." It is gone.
**If the pass drops the serp-optimize score, ship Fable's copy anyway** — log the before→after
score on the status board and in the exec summary, and do not touch the prose to claw points
back. The owner's standing call: *one engaged reader is worth ten who find the page and bounce* —
voice and engagement outrank score residuals, full stop. The ≥90 gate still applies to the
**pre-pass draft** (unchanged — Fable polishes drafts that already cleared it); a post-pass dip
is the one sanctioned exception, logged not fixed. If the drop is severe (more than ~5 points),
flag it prominently in the exec summary for the owner to arbitrate — still without editing.
This rule covers ALL Fable-authored copy: `fable-pass.mjs` output and any copy the owner pastes
in and says is Fable's. Verbatim means verbatim.

Acknowledge every such edit with
`node scripts/fable-pass.mjs --verify <slug> --allow <n> --reason "<which item above>"` AND list
the drifted lines + reason in the exec summary. The guard exits 1 on any drift without this ritual
— and a `--reason` that is actually a taste edit ("flowed better") is a violation even though the
command succeeds; the owner reads the reasons.

**In `review-blog`:** the pass also runs there (Step 6b), but ONLY on the FULL re-opt tier
(pos 11+/no data). SEO-frozen (top-3) and additive-only (4-10) posts never get it — re-voicing
ranking prose is exactly what those tiers exist to prevent. Delete a previous run's stale
`<slug>.fable-pass.md` before generating a fresh one; the guard warns and stands down on pass
files older than 48h (it is a publish-run gate, not an eternal lock). Commit the pass file with
the post — it is the audit trail (Fable's canonical body + the judgment flags + any objections).

**Batch option:** when same-hour turnaround doesn't matter, the same call via the Batches API costs
~$0.33 — worth wiring only if volume grows.

## 6. The canonical exemplar corpus (the few-shot layer — added 2026-06-13)

The rules above tell you WHAT to do; these three shipped posts show what it READS like when it
works. Before drafting, read **one** of them end to end in `content/blog.ts` — pick the one whose
format matches your post — and copy the *shapes* (sentence rhythm, strip format, joke structure,
section verdicts), never the lines:

| Exemplar | Format it teaches | Score it shipped at |
|---|---|---|
| `best-places-to-eat-oahu` | island-wide roundup, by region | 94 serp · 96/100/100/100 LH |
| `north-shore-oahu-restaurants` | by-area roundup, quick-facts strips, FAQ leftovers | 95 serp · 96/100/100/100 LH |
| `road-to-hana-maui` | long single-subject guide, stop-level structure | 96 serp (reviewed 66→96) |

Why only three: style saturates fast — one 3,500-word post contains hundreds of micro-examples of
the voice, so a third exemplar adds far less than the first, and every extra one costs context.
Three diverse formats beat ten similar ones. Keep this list at three; when a clearly better
exemplar ships, REPLACE the weakest entry, don't append. The corpus is the few-shot layer; this
playbook is the rule layer; the gates are the judge. All three together are what "writing like
Fable" means — no single layer is sufficient alone.

**How the corpus should EVOLVE (the engagement loop).** These three were picked on score + voice
because that's the data we had at launch. Once GA4 + GSC accumulate ~60-90 days of real behavior,
re-pick on **measured engagement** — average engagement time, scroll depth, pages/session — not on
serp-optimize score. A post that ranks #15 but holds readers 4 minutes is a better style teacher
than one that scores 96 and bounces in 20 seconds. When the data lands, swap any exemplar a
genuine engagement winner beats. The whole point of §7 is that the score and the read are different
things; the exemplar corpus is where we let the *read* win.

## 7. The engagement layer — write for the reader who STAYS (owner directive, 2026-06-13)

Every gate in this file optimizes for one of two things: *getting found* (SEO score, length, terms)
or *not being slop* (ai-slop, voice tells). Neither measures whether a human who lands actually
**reads**. The owner's standing call: **one engaged reader is worth ten who find the page and bounce.**
A post can pass every gate and still be a competent encyclopedia entry nobody finishes. These are
the levers that turn a ranking post into a read post — none are scored, all are judged at the
pre-commit ritual.

1. **The first-screen test.** On a phone, the reader decides whether to keep scrolling in ~3 seconds,
   before they've read a paragraph. The TL;DR answer + the bolded intro phrase + the first visual
   must, together, answer two questions: *"am I in the right place?"* and *"is this writer worth my
   time?"* The second is won by specificity and a dry beat, not by completeness. If the first screen
   reads like ten other guides, they're gone before the value starts.

2. **Verdicts, not catalogues.** A list of 30 even descriptions engages less than a confident "here
   are the four that matter, and here's exactly why; the rest are backup." SEO wants coverage;
   engagement wants a point of view. Hold both: cover enough to rank, but make the reader feel
   *guided by a local*, not handed a directory. Every section needs a verdict — "the move," "skip
   it if," "if you only do one" — not just information. A section that only describes is a section
   the reader skims past.

3. **One quotable sentence per section.** The engagement unit is the line a reader screenshots or
   texts to their travel buddy — specific, true, and a little funny. ("A slice is a decision you'll
   regret by Waimea." "Napkins are load-bearing.") If a section has no line worth repeating, it has
   no reason to be remembered. Aim for one per major section; you won't always hit it, but the
   target is what keeps the prose from flattening.

4. **Internal links as momentum, not plumbing.** A "read this next" placed at the moment curiosity
   peaks keeps the session alive — and session depth is both the truest engagement signal Google
   reads and the truest path to a booking. Don't bury links in a footer list; drop them mid-sentence
   exactly where the reader's question forms ("...the Giovanni's-vs-Romy's debate" → link there).
   SEO relevance and narrative momentum should pick the same link; if they don't, momentum wins.

5. **The honest "when not to" is the retention hook, not just a voice tell.** Telling someone to skip
   something — the high-surf Saturday, the resort dinner, hiring us — signals you're on their side,
   and a reader who trusts you reads everything else more carefully. It's the single most engaging
   move in the toolkit. Every post needs at least two.

6. **The close earns the next click, not a sale.** End on a line that makes them want the next post
   or the next plan, never on "hopefully this helps" or a stacked CTA. The sign-off is an engagement
   hinge: the reader who finishes engaged is the one who clicks a second page, and the second page is
   where the trust (and the affiliate revenue) compounds.

**The vibe check for this layer:** read the post as a tired traveler planning in bed on a phone.
Did you want to keep scrolling? Did any line make you smile or screenshot it? Did the end make you
want one more page? If no to any, the post ranks but doesn't engage — fix it before shipping, even
though every gate is green.

## 8. The pre-commit ritual (five minutes, not optional)

Read the rendered post top to bottom, once, as a reader. Then answer, honestly, in the run log:

1. Would a local who eats at these places nod, or wince? (facts + vocabulary)
2. Did I smile at least N/500-words times? (humour presence, not absence-of-slop)
3. Does every section answer "so what should I actually do?" (verdicts, not descriptions)
4. Is the single most useful thing in the post findable in 10 seconds by a skimmer? (TL;DR, bolds,
   strips, decision-helper)
5. Did I run the §7 engagement vibe check — first-screen, quotable line, want-the-next-page close —
   as a tired traveler reading on a phone? (engagement, not just findability)
6. Is every gate number green AND printed?

If any answer is no, the run isn't done. Fable's runs end when the answers are yes — that, not the
model name, is the standard.
