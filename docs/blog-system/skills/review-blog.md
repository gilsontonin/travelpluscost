---
name: review-blog
description: >-
  RE-OPTIMIZE one existing blog post to the same bar as writing a new one: fresh
  SERP research + the in-repo scorer (scripts/serp-optimize.mjs) drive a
  deterministic upgrade — keyword-rich headings, terms into range, competitor-median
  length, facts, FAQ — to raw score ≥90, while keeping the house voice, humour,
  design system, and search intent intact. Queue is GSC striking-distance first
  (pos 8-20 with impressions, via scripts/gsc-rank.mjs --list), oldest-first as
  fallback. Protects winners: top-3 = SEO-frozen (technical only); 4-10 =
  additive-only (no heading/title changes). Logs score before→after + GSC baseline
  so every review doubles as a ranking experiment. One post per run. Use when the
  user says "review a blog post", "review the next post", "/review-blog", or names
  a post to review.
---

# Review Blog v2 — re-optimize to the new-post bar

Old posts predate the serp-optimize system: typically ~2K words vs 5-8K competitor medians,
generic H2s, no term targeting. Reviewing without measuring is a lint pass. **v2 = the
write-blog-post research pipeline pointed at an existing post**, gated by rank so winners
stay untouched. One post per run.

## Golden rules (read first)

1. **Don't touch a winning team.** Rank gate (Step 1) before ANY edit.
2. **The score is a gap-finder; stuffing is forbidden.** Apply every GENUINE gap; never
   mood-filler, never repeat-for-the-range (measured cost: SEO +5 / AI Search −31). Finishing
   below 90 with all genuine gaps applied is a legitimate outcome — **log the residual gap list
   verbatim** so we never quietly stuff our way to a number. **BlogPostChecklist 8.3a makes ≥90
   owner-override-only: when you stop below 90, present the residuals + the trade-offs and get the
   owner's explicit waive BEFORE commit/go-live** (precedent: hawaii-state-fish shipped at 86,
   waived 2026-06-12 — residual types: competitor chrome terms, hyphenation artifacts, SERP-skew
   ranges, identity-term overs vs much shorter competitor pages).
3. **Voice / humour / design untouched.** This adds COVERAGE in our voice and our native-visual
   format (`References/serp-optimize-system.md` STEP 5). Never a style rewrite.
4. **Honest freshness:** bump `dateModified` only if you actually changed something.
5. **One post per run** → always log to `Keywords/ReviewLog.md` → focused commit → **never
   `git push` until the user says "go live."**
6. **Visual cadence re-checks on the FINAL word count.** Two SEPARATE counts: **≥1 infographic
   per ~500w (HARD)** and **~1 vetted photo per ~500w (soft, quality over count)** — photos don't
   cover for the infographic count. A post that doubles needs new infographics, not just photos. If
   you add photos, **inspect every candidate (and the cover) for quality + location accuracy first**
   (Unsplash hotlink or self-host Pexels as WebP; descriptive alt + credit). Keep key answer phrases
   **bolded through the body** for skimmers. Owner spot-check: `References/SkimmabilitySpotCheck.md`.

## Reference files (the same bar as writing new)

`References/serp-optimize-system.md` (the engine — PART 1 runbook), `references/voice.md`,
`References/DanKennedyVoice.md`, `Humour.md`, `Opinions.md`, `Stories.md`, `stats.md`,
`BlogPostChecklist.md`, `WritingLessons.md`, `DESIGN.md`, `PassAISlopAndDetection.md`,
`Keywords/Used_Keywords.md`, `Keywords/ReviewLog.md`.

---

## Step 0 — Pick the post

1. **Named slug** (user said which) → use it. (The owner can always name the post to review.)
2. Else **`node scripts/review-backlog.mjs`** → the top **pre-SEO backlog** post: the oldest posts
   still carrying a pre-SEO tell (missing infographics / old "by Wember" byline / no TL;DR / thin),
   highest-priority first. This is the default picker for the baseline-revamp campaign — it reads
   the **"## Reviewed" table in `Keywords/ReviewLog.md`** (the source of truth) so nothing is
   re-reviewed. `--list` shows the full backlog; `--write` refreshes `Keywords/ReviewBacklog.md`.
3. Prefer a striking-distance win instead? `node scripts/gsc-rank.mjs --list` → top un-reviewed
   pos 8-20 post (one push from page-1 traffic). Use when GSC data is fresh and traffic is the goal.

**Cadence:** the owner aims for roughly 3 written : 1 reviewed, but it's a loose mental model, NOT a
tracked rule — don't enforce a ratio or block on it. They may review 3 in one sitting. Just do what's
asked: **"review next"** → review the `review-backlog.mjs` top pick; **"write next maui campaign"** →
write the next undone item in `Keywords/MauiCampaignQueue.md`. Naming a slug overrides either picker.

## Step 1 — Rank gate (automated — state the tier up front)

`node scripts/gsc-rank.mjs <slug>` (reads the newest GSC export folder in the repo; ask the
user for a fresh export if it's >2 weeks old):

- **TOP-3 → SEO-FROZEN.** Technical-only: 404 links, missing `alt`, broken schema, a genuinely
  missing visual. No content/meta/structure changes. → log `winning`, skip to Step 7.
- **4-10 → ADDITIVE-ONLY.** May grow: length, terms into range, new sections/FAQ/facts, internal
  links, visuals. May NOT: rename existing headings, change title/seoTitle/meta (year bump OK),
  trim/restructure anything that exists. The full loop below applies minus those moves.
- **11+ / no data → FULL re-optimization.** Everything, headings and all.

## Step 2 — Fresh SERP research (never reuse a saved list)

Per `serp-optimize-system.md` STEP 1: WebSearch the primary keyword → pick ~10 GENUINE
blog/guide URLs **by intent** (drop same-keyword-different-topic pages; keep relevant authority
guides). HARD-EXCLUDE .gov/Reddit/TripAdvisor/Wikipedia/YouTube/Yelp/news/vendor widgets.
**Read the Reddit/forum threads anyway** — mine the real questions and vocabulary for the FAQ;
cross-check live People-Also-Ask. Confirm our angle still matches today's search intent (if the
SERP flipped — e.g. informational → transactional — flag it to the user before re-angling).

## Step 3 — Baseline (the BEFORE numbers — these go in the log)

```
node scripts/serp-optimize.mjs "<keyword>" --draft <slug> --urls "u1,u2,..."
node scripts/post-stats.mjs <slug>
```
Record: **raw score, word count, visual count** + the GSC position/impressions from Step 1.

## Step 4 — The upgrade loop (deterministic — no discretion on "how much")

Work the brief exactly as `serp-optimize-system.md` STEP 4, in this order (biggest lever first):

1. **Headings:** build/rename H2-H3s around the brief's heading-gap keywords; exact primary
   phrase IN a heading; update ToC anchors. *(Additive-only tier: NEW sections only — no renames.)*
2. **Exact phrase** verbatim 1-3× in body (intro or an H2 lead).
3. **Entities** (places/roads/gear/conditions) — add each ❌/⚠ named entity, liberally.
4. **Core-term density** into range — proper nouns over pronouns; TRIM overs (stuffing is
   penalized). *(Additive-only tier: no trims — log overs instead.)*
5. **Facts:** every concrete, citable competitor fact we lack — VERIFY before stating; fix any
   stale fact you touch (prices vs `stats.md`, closures, reservations, fees).
6. **FAQ:** add the genuine leftover questions (from competitor headings + Reddit + PAA).
7. **Intent intro:** answer / what / who-for / why-it-matters, all four upfront.
8. **LENGTH to the brief's target** (competitor median — the #1 lever). Real coverage only:
   new sub-spots, seasons, logistics, local context. Never pad.
9. **Visuals:** new infographics to hold cadence on the GROWN word count (cards / stat-panel /
   compare / steps — per `DESIGN.md`).

Re-run `serp-optimize.mjs --draft` after each pass. **Iterate until raw ≥ 90** or every genuine
gap is applied (then Golden rule 2: log the residuals). Preserve ALL scaffolding throughout —
affiliate links, internal links, `::tour` cards, existing `::infographic`s.

## Step 5 — Voice / UI pass (READ it — don't just lint)

Re-read the edited post against `voice.md` anti-tells + `DanKennedyVoice.md` + `Humour.md` +
`Opinions.md`: one real opinion backed by a number, dry humour present, an honest "when NOT to",
soft brand mention, TL;DR = 3-5 genuine bold takeaways (not section labels). New copy must be
indistinguishable from the old voice. Then `node scripts/ai-slop-check.mjs <slug>` (0 HARD) as
the floor, not the whole check.

**Kill spell-checker hyphens (owner voice — standing rule).** Hyphenated compounds
("adults-only", "full-service", "family-friendly", "lava-tube") read as AI; the brand strips
them unless removal reads wrong. Run `node scripts/dehyphenate.mjs <slug>` (dry-run — review the
changes + any `UNCLASSIFIED`/`MANUAL` it surfaces), then `--apply`. Safe by design: `body` only
(never icon/slug/meta), a border guard that skips slugs/URLs/anchors/contractions, and auto-keeps
proper nouns (Kailua-Kona, Ritz-Carlton), acronyms/phonetic guides (G-C-E-A, ah-LOH-hah), and a
denylist (check-in, add-on, Wi-Fi). **Hand-rephrase every `MANUAL` flag** (`-wise`, `near-free`,
`Michelin-ambitious`). Despacing also feeds the scorer (its tokenizer keeps hyphens, so
"lava-tube" never matches `lava`/`tube`), so it's a coverage win too — re-run Step 7's gates after.

## Step 6 — Maintenance pass (kept from v1 — quick but mandatory)

- **Brand:** "Hawaii Picnics & Beach Events" (never "by Wember"); no "luxury"; "Journal" not "blog".
- **Meta/CTR:** title ≤60 · description ≤160; keyword leads; bump the year in `seoTitle` on
  time-sensitive posts (best-of/guides/itineraries) — not on "what is X" explainers.
- **Keyword sanity:** primary still right + searched; **cannibalization** vs `Used_Keywords.md`
  and newer posts — if two posts now fight, flag it, don't silently re-target.
- **Internal links:** 3-5 to existing routes incl. newer hubs (`/things-to-do/`, `/where-to-stay/`,
  `/services/`, siblings). **External:** fix 404s; leave 403/406/429 bot-blocks; URL-encode parens.
- **Schema:** FAQ/Breadcrumb/Person intact; **no ItemList/HowTo/Review** (removed 2026-06-10 —
  delete leftovers).

## Step 6b — Fable editor pass (FULL-re-opt tier only · auto when `ANTHROPIC_API_KEY` is set)

Protocol + authority rules: **`References/FablePlaybook.md` §5** — same as write-blog-post Step 8a.
**Tier gate: runs ONLY on FULL re-optimizations (pos 11+ / no data).** TOP-3 frozen and 4-10
additive-only posts NEVER get the pass — it rewrites existing prose, which those tiers protect.
Order matters: run it AFTER Steps 4-6 (all body-touching edits done), so the guard isn't tripped
by later legitimate edits. Sequence: delete any stale `content/drafts/<slug>.fable-pass.md` from a
previous run → `node --env-file=.env scripts/fable-pass.mjs <slug>` → read the Judgment flags →
`--apply` (script-spliced, never retyped) → then Step 7 re-runs every gate → `--verify` must print
`fable-guard: identical` (or drift acknowledged per the §5 allowlist). After --apply the prose is
Fable's — taste objections go in the ReviewLog line, not into edits. Key absent / call fails /
owner said **"no fable"** (any phrasing, anytime, no pushback) → note
`fable-pass: skipped — <reason>` and continue.

## Step 6c — Companion podcast: RETIRED (owner-disabled 2026-06-15)
**Do NOT add a podcast to a reviewed post.** The companion-podcast step was retired site-wide on
2026-06-15 (the Gemini multi-speaker TTS call was the priciest, lowest-engagement step; budget
redirected to the freshness audit — Step 6e). Do not generate one, even on a post that lacks it.
**Leave existing podcasts in place** (the ~150 already live + indexed) — don't strip them either;
this only stops new generation. Visual cadence is carried by native `::infographic` blocks plus vetted in-body photos (inspect every candidate for quality + location before placing).

## Step 6d — GEO FAQ gap check (answer-engine optimization)
**Primary source = real GSC demand:** `node scripts/gsc-fetch.mjs <slug>` lists the page's ACTUAL
Search Console question queries (live API, no CSV — first run does a one-time browser consent, then
headless). These beat any model's guesses — they're what people really type to reach this page. Two
outcomes, not one: **(a)** the query is genuinely unanswered → candidate for a new FAQ; **(b)** the page
already answers it but ranks pos ~8–15 for the query's exact wording → **rewrite the existing heading/FAQ
to the EXACT top-impression query wording and REPLACE it — do NOT add a duplicate.** Google's heading
match is literal; 1–2 synonym words change who it ranks for (e.g. "how high is the cliff jump" → "How
tall is Black Rock Maui?" to match `how tall is black rock maui`). Match the highest-impression variant
verbatim, normalize only casing/spelling (no typos / lowercase / "today" in an H3), and keep any
secondary-query terms in the ANSWER body, not the H3. Ignore 1-impression / off-intent noise.
Then OPTIONALLY supplement with `node scripts/paa-suggest.mjs <slug> --kw "<primary>"` — Gemini lists
**candidate** PAA-style questions, but **do NOT trust the list as "gaps."** In a 156-post sweep it was
~80% wrong: it routinely suggests questions the body *already* answers (passport, hiking, food,
footwear, facilities, …). So every candidate (GSC or Gemini) must clear this gate before it can be added:

1. **GREP the body for the gap's keywords** (the mechanical leftover check — not a vibe re-read):
   slice the post block from `content/blog.ts` and count the gap's key terms. If they're present,
   it's a **body dupe → drop it** (checklist 3.4). This single step is what kept the sweep from
   padding 100+ posts with duplicate FAQs.
2. **Groundable-in-fact only** — you must be able to state the answer from the post / `stats.md` /
   solid general knowledge. If it needs an invented number (cost, hours, "average price"), an
   uncertain fact (a specific operator's pet/cancellation policy, a restroom status you can't
   verify), or names that go stale (specific restaurants/operators) → **drop it**. Never invent.
3. Only what survives both gates gets added (~0–3, often **zero**) as `### <question>` H3s under
   `## FAQ`, with crisp **~40–55-word, bold-led, quotable** answers in the house voice (see the
   **`/geo-faq`** skill).

**Under-adding beats padding — most well-built posts correctly yield zero adds.** Known no-op
patterns: single-property hotel posts (gaps are unverifiable logistics), map/orientation posts
(activity/route suggestions = scope creep), and any post that already covers the topic in a body H2.
`ai-slop` 0 HARD. Skip if the FAQ is already strong or the key/quota is unavailable
(`geo-faq: skipped — <reason>`). FAQPage schema is automatic; FAQ H3s carry heading weight, so
re-run the gates (Step 7) after.

## Step 6e — Freshness / accuracy check (`check:freshness --slug`)
Run `node --env-file=.env scripts/freshness-audit.mjs --slug <slug>` — Gemini Flash + Google
Search grounding checks the post's perishable facts (prices, hours, days open, reservation/permit
rules, fees, open/closed status) against the live web and flags what's drifted. This is the
mechanical, automated version of Step 4 #5 / Step 5's "fix any stale fact you touch."

- **It's a detector, not an editor.** For every STALE flag, **verify the new value yourself
  against the primary/official source** (WebFetch the cited URL) before changing anything — Gemini
  grounding is ~80% reliable (same skepticism as the `paa-suggest` gate in Step 6d). Never paste
  Gemini's wording; never trust a single flag blind.
- Apply confirmed corrections in the house voice, **bump `dateModified`** (sitemap lastmod
  re-crawl signal — and now a real change, satisfying Golden rule 4), then **re-run on the slug**
  to confirm the flags clear. Keep all affiliate/internal links + infographics intact.
- Note stale facts in the ReviewLog line (Step 8). If the key/quota is unavailable, note
  `freshness: skipped — <reason>` and fall back to the manual fact-check in Step 4 #5.

## Step 7 — Gates (all green or it doesn't ship)

1. **Print the live checklist:** `node scripts/post-checklist.mjs <slug> --kw "<primary>"` —
   AUTO rows must ALL pass (script exits 1 otherwise); answer every 👁 row with a one-line
   verdict. **Paste the full printed table for the owner** (CLAUDE.md mandatory rule — applies
   to editing, not just writing).
2. `npm run build` (every route `○ Static`) + `npm run check`.
3. `node scripts/ai-slop-check.mjs <slug>` → 0 HARD, 0 stray diacritics.
4. `node scripts/post-stats.mjs <slug>` → length + cadence on FINAL count.
5. `npm run check:lh /blog/<slug>/` → **≥ 95/100/100/100**.
6. ToC anchors resolve (esp. after heading renames) + view-source: rendered content + JSON-LD present.
7. Re-run `serp-optimize.mjs --draft` once more — record the AFTER score.
8. If a Fable pass was applied this run: `node scripts/fable-pass.mjs --verify <slug>` →
   `fable-guard: identical` (or acknowledged drift) on the status board.

## Step 8 — Log it (always) + feed the loop

**Append a row to the `## Reviewed` table in `Keywords/ReviewLog.md`** (the source of truth the
backlog picker reads — this is what makes the slug drop off `review-backlog.mjs`):
`| <slug> | <today> | <status> | score <before>→<after> · <words before>→<after>w · GSC <pos>/<impr> · <one-line what changed; residual gaps if <90> |`
Status: `winning` · `re-optimized` · `improved` · `already-good` · `safe-fixes`.
Then `node scripts/review-backlog.mjs --write` to refresh `Keywords/ReviewBacklog.md` (the slug
should no longer appear). The detailed legend/notes can still go in the prose above the table.

Also prepend a row to `Keywords/GSC-Reindex-List.md` (unticked checkbox, score before→after, full
live URL in both the table and the bare-URLs block) so the owner can request re-indexing in
Search Console after go-live.

**Every review is a ranking experiment:** the GSC baseline + 4-8-week re-check is what validates
the scorer now that Surfer is gone. If a miss is *systemic* (would recur in new posts), append
one line to `References/WritingLessons.md`.

## Step 9 — Commit, hold for go-live

Focused commit: `Review <slug>: score <before>→<after>, <one-line>`. **Do not push** until the
user says "go live."
