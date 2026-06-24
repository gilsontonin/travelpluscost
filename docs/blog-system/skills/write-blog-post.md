---
name: write-blog-post
description: >-
  Write one SEO-optimized, on-brand blog post for the Hawaii Picnics & Beach Events
  site. Picks the next unused primary keyword from the cluster plan, researches
  the top 3 ranking Google pages, drafts in the house voice with real numbers,
  sources images (Unsplash first, Pexels fallback), adds the post to content/blog.ts, and verifies the
  on-page SEO + Lighthouse rules, then WRITES AND PUBLISHES it in one run —
  auto-deploying on green QA (build static + checklist all pass + Lighthouse
  >=95/100/100/100), or stopping at a committed draft only when you say "draft
  only / hold it". Publishing is merged in (publish-post is retired). Use when the
  user says "write a blog post", "write and publish", "create a post",
  "/write-blog-post", or names a keyword cluster to write.
---

# Write Blog Post — Hawaii Picnics & Beach Events

> **CORE UPGRADES — read first, apply to every post. These supersede the matching rules below.**
> (Adopted 2026-06-08 after an A/B test: the version using these won decisively on a human read —
> "easy to find answers, funny, helpful, made me want to read more.")
>
> **Research & gaps**
> 1. **Analyze the top 3–5 GENUINE competitor articles only.** Exclude the giants you can't
>    out-rank and that skew the read — Reddit, Wikipedia, TripAdvisor, YouTube, Yelp, big news,
>    and Google's own boxes (AI Overview / PAA widget). Benchmark length/angle against sites you
>    can realistically beat.
> 2. **Find the gap against four reference points:** (a) the topics ALL competitors cover (the
>    must-haves), (b) People-Also-Ask + related searches, (c) the practical "a friend would tell
>    you" details thin posts skip (parking, cost, timing, difficulty, is-it-worth-it), (d)
>    freshness/accuracy (closed spots, changed fees). A gap = clearly asked, poorly answered.
>
> **Length**
> 3. **Target = the serp-optimize BAND, calibrated to the Surfer editor (THE standard, it matched Surfer
>    closely). Surfer outputs a word RANGE, so we do too: floor = competitor MEDIAN (never below it),
>    working target = median×1.15, ceiling = the longest GENUINE competitor.** A competitor **≥1.5× the
>    median is an OUTLIER and is EXCLUDED** — match its coverage, not its length (do NOT "never come in
>    shorter than #1" — that re-imports the outlier the band drops). **Land IN the band; over the ceiling
>    = trim/merge, never deepen.** `post-stats.mjs` prints the band + the section budget. Every word earns its place.
>
> **Structure & answers**
> 4. **Answer the main questions IN THE BODY, narratively** — fold each PAA/related question into
>    the section where it reads naturally (this wins featured snippets). Reserve the **FAQ** for
>    leftover/long-tail questions + the FAQPage schema. **Never answer the same question identically
>    in both places.**
> 5. **Bold the direct answer to the primary keyword — ONE phrase, not a sentence — in the intro.**
>    Bold the **lead answer phrase** at the start of each FAQ answer too (just the phrase; rest clean).
> 6. **Match the featured-snippet FORMAT Google currently shows** for the keyword: paragraph box →
>    a 40–55-word paragraph answer; list box → a clean list; table box → build the table.
>
> **The first paragraph (put real effort here)**
> 7. **Answer first (with the bolded answer), THEN hook** — earn the next scroll with one vivid,
>    true, dry-funny line. **NEVER a "scroll down to find out" tease** — withholding the answer
>    backfires (readers pogo-stick back to Google). The TL;DR still leads with the answer but gets
>    a touch of voice.
>
> **Make it genuinely helpful & engaging (every post)**
> 8. **First-hand local knowledge — 2–3 genuine local details no competitor has** (the lot that
>    fills by 7am, the local name, the food truck nearby). The unfair advantage; it's what Google's
>    "Experience" rewards. Real, specific, current.
> 9. **A "quick facts" mini-box per spot/item** — one scannable strip: *Cost · Time · Difficulty ·
>    Best for* (a short bold-led line or a small table).
> 10. **Anticipate the next question** after every answer (answer → the natural follow-up, e.g.
>     "but is it worth the climb?"). Keeps momentum; reads like a conversation.
> 11. **One decision-helper line:** "If you only do one, do X" — a confident, reasoned pick that
>     removes choice paralysis.
> 12. **One vivid sensory line** per post to sell the experience — sparingly (one or two, never purple).
> 13. **Comparison tables for any X-vs-Y**, and a **map / "where is it"** orientation (distance +
>     direction from Waikiki, grouped by area) for location posts. For the directions/orientation,
>     use the **`::directions <destination> | <keyword heading>`** directive near the top — a
>     lightweight Google Maps deep link (opens the Maps app on mobile), NEVER a heavy iframe embed.
>     The heading carries the ranking keyword ("Getting to <Spot>"); the destination can differ
>     (e.g. park here, hike there).
> 14. **Freshness, visibly** — current fees/hours + an "as of 2026" signal.
> 15. **Topic clusters** — link related posts tightly, with a clear "read this next."

# Write Blog Post — Hawaii Picnics & Beach Events

Produces ONE complete, build-passing, SEO-optimized blog post that matches the
house voice and this repo's conventions.

**Argument (optional):** a primary keyword or cluster name. If omitted, auto-pick
the next cluster (see Step 1).

---

## Positioning & monetization (read first — this governs everything below)

**This is a travel/information site first, monetized primarily by affiliate links.**
The goal is genuinely useful, rank-worthy content that builds an audience and earns
affiliate revenue (Viator tours, Expedia/Booking lodging, Amazon gear, etc. as
programs come online).

- **Affiliate links are a primary goal, not an afterthought.** Plan them while you
  outline: every monetizable intent in the post — where to stay, tours/experiences,
  gear / what to pack, transport — should map to a relevant affiliate link if one
  exists (see Step 3b). Useful first, monetized second — never spammy.
- **The picnic service is a SOFT, secondary mention.** One light, honest aside or a
  single low-key line at most — the post is **not** a picnic sales letter. Do not
  build the article around `/#packages`; mention it once where it's genuinely
  relevant and move on. Lead with being helpful.
- **Stay informational; don't lean on brand claims to sell.** Don't anchor a post on
  the business's authority/credentials (permits, registrations, "we handle X"). Keep
  numbers honest (still only from `stats.md`), but the article's value is the travel
  information, not the pitch.
- **Build audience first:** comprehensive coverage, strong internal linking between
  posts (build a topical hub), real usefulness. Traffic and trust now; conversion later.

---

## Hard rules (read first, never break)

1. **Read the reference files before writing a sentence** (table below).
2. **Never reuse a primary keyword** already in `Keywords/Used_Keywords.md`. Log every use.
3. **Never invent numbers.** Every price/stat/rating comes from `References/stats.md`.
   If a figure is only in that file's "Confirm / TODO" section, do not state it.
4. **Never link to a route that isn't built.** Internal links go to existing
   destinations only: `/`, `/blog/`, and on-page anchors `/#packages`, `/#contact`,
   `/#about`, `/#add-ons`. Location pages like `/ko-olina-picnic` do NOT exist — for
   picnic CTAs use `/#packages` or `/#contact`.
5. **Run autonomously and AUTO-DEPLOY on green QA (write+publish default).** Run the entire
   workflow end to end on your own judgment: pick keyword → research → draft → images/affiliates
   → insert into `content/blog.ts` → build → verify → exec summary → **commit + push**, without
   pausing for sign-off. The "checkpoints" below are **reporting milestones, not stop gates** —
   emit the status and keep going.
   - **Report every check as a compact keyword/status line, not prose** — `keyword:
     value`, `build: pass`, `lighthouse perf/seo/a11y/bp: 98/100/96/100`, `voice:
     pass`, etc. The user wants to skim a status board, not read a report.
   - **The gate is QA-green, not a human ask.** "Write a blog post" = write AND deploy (standing
     authorization, 2026-06-08). Auto-push ONLY when build is `○ (Static)`, the
     `BlogPostChecklist` is all ✅, and **Lighthouse ≥ 95/100/100/100**. If anything fails, STOP —
     fix it or leave it committed-but-unpushed; a failing build never deploys. **Draft-only mode**
     (only when the user asks to hold it) commits the draft and stops — no push.
6. The brand is a beach picnics & events service on Oahu (picnics are the entry product; also proposals, elopements, vow renewals, bachelorette, small weddings), but per **Positioning** above
   it's now a **soft, secondary** mention — translate the voice/humour reference
   examples (which use a plumbing business) into a helpful **Hawaii-travel** voice,
   not a hard picnic pitch.

## Reference files to read

| Purpose | File |
|---|---|
| **Lessons from past reviews (read FIRST — stop repeating caught mistakes)** | `References/WritingLessons.md` |
| **The Fable Playbook (read FIRST, alongside the lessons) — the execution standard this run is held to: the corner-cutting catalogue (each lazy shortcut forbidden by name), drafting order, humour mechanics, fact tiers, pre-commit ritual, and the optional one-shot Fable editor pass** | `References/FablePlaybook.md` |
| Brand voice | `References/DanKennedyVoice.md` |
| Humour rules (mandatory) | `References/Humour.md`, `References/FunnyHumor.md` |
| Real numbers | `References/stats.md` |
| Opinions (max 1/post) | `References/Opinions.md` |
| Stories (max 1/post, adapt — don't invent) | `References/Stories.md` |
| Format strategy | `References/BlogStructure.MD` |
| On-page SEO checklist (pass every item) | `References/OnPageSEOCheckList.md` |
| Lighthouse rules (images/contrast) | `LightHouseBestPractices/LighthouseBestPractices.md` |
| Keyword bank — source of truth (Semrush CSVs, one per region) | `Keywords/*.csv` |
| Keyword candidate finder (run this in Step 1) | `scripts/keyword-candidates.mjs` |
| Draft length gate (run after drafting, before build) | `scripts/post-stats.mjs` |
| Strategy OS / theme map (which cluster, which island next) | `Keywords/ContentCampaign.md` (start at `Keywords/README.md`) |
| Used keywords (never reuse) | `Keywords/Used_Keywords.md` |
| Affiliate links registry | `References/AffiliateLinks.md` |

## Workspace facts

- **Node:** prepend `~/.local/node/bin` to PATH. Build: `npm run build` (static
  export → `out/`). Preview: `npm run serve` (localhost:3000).
- **Posts live in `content/blog.ts`** as `Post[]`. Add new posts to the TOP
  (newest first). The blog index renders in array order (no date sort), so the
  array order IS the display order — top of array = newest. Type:
  ```ts
  { slug, title, seoTitle?(≤60 chars — blog posts carry NO brand suffix), description(≤160), excerpt, date(YYYY-MM-DD),
    dateModified?, author: "Hawaii Picnics & Beach Events", category, icon (IconName),
    coverImage?{src,alt,width,height}, tldr?{answer,points[]}, body (Markdown) }
  ```
- **TL;DR box (write one on EVERY post — it's a snippet/skimmer win).** Set the
  `tldr` field; the `app/blog/[slug]/` template auto-renders a styled "TL;DR" box at
  the top of the post (above the ToC), so do NOT also write a TL;DR in the body.
  SEO best practices, follow exactly:
  - `answer`: a direct, **keyword-first** answer in **~40–55 words** (the length Google
    lifts for *paragraph* featured snippets). Lead with the primary keyword; in the
    house voice; do not copy the intro paragraph verbatim.
  - `points`: **3–5** concise, **bold-led** bullets (the format Google lifts for *list*
    snippets), e.g. `"**English** — the everyday language."`. Inline `**bold**`/`*italic*`
    render; the renderer escapes HTML. Keep each to one line.
- **FAQ schema is automatic:** write a `## FAQ ...` section with `### Question` H3s;
  `lib/markdown.ts` (`extractFaqs`) emits `FAQPage` JSON-LD. The `app/blog/[slug]/`
  route already renders ToC, breadcrumbs, author bio, BlogPosting + Breadcrumb +
  FAQ JSON-LD, and back-to-top. Don't rebuild those.
- **Do NOT add ItemList schema to a blog post (REMOVED 2026-06-10).** The post's "items" are on-page
  sections, not separate pages, so each ListItem lacks a required `url` → Google/Ahrefs flag it as an
  **invalid Carousel** (4 posts failed). It earned no rich result for on-page best-of lists anyway.
  There is no `itemList` field anymore — don't reintroduce one. (Only the `/best-beaches/` HUB keeps a
  valid ItemList, because its items are real post URLs.) **Also do NOT** add HowTo schema (Google removed
  the rich result) or Review/AggregateRating (self-rating without real third-party reviews violates guidelines).
- **Markdown renderer** auto-adds `rel="noopener noreferrer" target="_blank"` to
  external links, makes the first image eager + `fetchpriority=high`, and reads
  `?w=&h=` for width/height. Use WebP URLs (Unsplash or Pexels — see Step 4).
  The renderer's responsive-srcset builder works on **both** hosts unchanged
  (Unsplash raw URLs honor the same `w`/`h`/`fit=crop`/`fm=webp` Imgix params).
- **Visual cadence (retention):** humans bail on walls of text. **At least 1 infographic
  per ~500 words — a HARD count on its OWN** (native HTML `::infographic`:
  cards/stat-panel/compare/steps/graph), **PLUS ~1 vetted photo per ~500 words as a separate, softer
  target** (quality over count). Photos do NOT cover for the infographic count and vice-versa —
  `post-checklist.mjs` 6.5a (infographics, hard) and 6.5b (photos, soft) score them separately, after
  a 2,400w post once shipped with only 3 infographics. Keep bolding key answer phrases through the
  body too (eye-direction for skimmers, ≥1 per section — `post-checklist.mjs` 2.2b). `scripts/post-stats.mjs`
  reports the per-500-words target; don't ship a text-heavy post that it flags.
- **Inline infographics:** a `::infographic <key>` directive renders a native
  HTML/CSS visual (data in `content/infographics.ts`, `renderInfographic` in
  `lib/markdown.ts`, `.ig-*` styles in `app/globals.css`). Kinds: island-selector,
  season-timing, cards, steps, compare, **stat-panel** (big scannable numbers — a
  strong text break). Use to lift dwell time — text stays real and crawlable.
- **AI scene images (bridge while real photos are scarce):** `scripts/gen-image.mjs`
  (FLUX via fal.ai, needs `FAL_KEY`) generates bespoke on-brand scenes (e.g. a styled
  sunset beach picnic) → WebP in `public/images/posts/`. **Representative only — never
  pass off as a real client event or a specific real property/person.** Review each.
- **Images — Unsplash first, Pexels fallback** (see Step 4). Both image hosts
  (`images.unsplash.com`, `images.pexels.com`) are already whitelisted in the CSP
  `img-src` in `netlify.toml` / `vercel.json` / `public/serve.json` — if you ever
  add a third image host, add it to all three or it's silently blocked.
- **Unsplash (primary):** `UNSPLASH_ACCESS_KEY` is in `.env`. Search via
  `https://api.unsplash.com/search/photos?query=...&per_page=6&orientation=landscape`
  with header `Authorization: Client-ID <key>`. Build the image URL from the
  result's `urls.raw` + Imgix params (e.g. `&fm=webp&fit=crop&w=1200&h=800&q=80`).
  Attribution is **required**: caption each image `*Photo: [Name](profile-url) on
  [Unsplash](https://unsplash.com)*`. Note: Unsplash's Hawaii-niche search is thinner
  than Pexels for obscure spots — if a query returns few/irrelevant results, fall back.
- **Pexels (fallback):** `PEXELS_API_KEY` is in `.env`. Search via
  `https://api.pexels.com/v1/search?query=...&per_page=10` with header
  `Authorization: <key>`. Use the returned `src.large`/custom-sized URLs.
- Icons: choose from the `IconName` union in `components/Icon.tsx`
  (e.g. sun, heart, camera, sparkle, leaf, droplet, pipe, flame, bolt, home,
  wrench, shield-check, clock, star, check, map-pin, users, utensils, waves).
- **Canonical domain:** the live site + Google Search Console property is
  **`https://www.hawaiipicnics.com`** (with `www`). It is set once in
  `content/site.ts` (`SITE.url`) and drives all canonical tags, the sitemap,
  robots, Open Graph and JSON-LD. Never hardcode a URL — let it flow from there.
- **Redirect collision (important):** `public/_redirects` 301s ~60 retired
  old-site paths, including several old `/blog/...` slugs (e.g.
  `oahu-vs-maui-beach-picnic`, `anniversary-picnic-beach-hawaii`,
  `hawaiian-charcuterie-board-guide`, `birthday-picnic-ideas-oahu`,
  `oahu-beach-picnic-permit-guide`, `oahu-beach-bachelorette-picnic-setup`,
  `kapolei-bachelorette-group-activities`). **Do not give a new post a slug that
  a redirect already claims** — the redirect wins and the post becomes
  unreachable. Check `public/_redirects` before finalizing the slug.
- **Keyword bank:** `Keywords/*.csv` are Semrush exports, `;`-delimited
  (`Keyword;Intent;Volume;Keyword Difficulty;CPC;SERP Features`). Mine them with
  `node scripts/keyword-candidates.mjs "<topic>" --prune` (no API key needed; reads
  CSVs only). It writes the shortlist to `scripts/keyword-suggestions.md` (gitignored)
  and moves junk to `Keywords/_irrelevant/`. See Step 1.

---

## Workflow

> ## ⚙️ How this skill runs — WRITE *and* PUBLISH in one go (default) — merged 2026-06-08
> This skill now does the whole job in one run: research → draft → insert into `content/blog.ts`
> → build → QA → **deploy live**. No more drafting ahead and publishing later — the research is
> freshest the moment it ships (no SERP drift), and review happens **downstream** (the
> `review-blog` evergreen skill), not as a pre-publish wall. (`publish-post` is retired into this.)
>
> **Modes:**
> - **Write + publish (DEFAULT)** — "write a blog post" / "write and publish" → run Steps 1–9 end
>   to end and **auto-deploy on green QA**. Standing authorization: "write a blog post" = write AND deploy.
> - **Draft-only (OPTIONAL, only when asked)** — "just draft / don't publish / I'll review first" →
>   author to `content/drafts/<slug>.md` + `QUEUE.md`, commit, and **STOP** (no insert, no deploy).
>
> **The single gate is `References/BlogPostChecklist.md`** — run it top to bottom before deploy;
> every box ✅ (or N/A with a reason) or you do not push. It is the source of truth for every check.

### Step 1 — Pick the keyword (from the CSV keyword bank)
- **"Write next <island> campaign" → the curated head/mid queue is the source of truth.** For Maui
  that's `Keywords/MauiCampaignQueue.md` (ordered list; pick the **next item with no matching post**).
  As of 2026-06-17 the next is **`big beach maui` (Makena)**, then `nakalele blowhole maui`, then pivot
  to GSC long-tail. `node scripts/campaign-next.mjs <island>` is the cluster-level helper (it now skips
  topic-duplicates) — but ALWAYS run the §4.1 cannibalization check vs existing slugs before drafting.
- The `Keywords/*.csv` files (Semrush broad-match exports, one per Oahu/Hawaii
  region) are the **keyword source of truth** for non-campaign picks. The strategy/theme map is
  `Keywords/ContentCampaign.md`; `Keywords/README.md` is the index to the whole tracking system.
- Run the candidate finder — it **auto-picks one CSV by topic/region** (one CSV per
  post), filters **KD < 30 & Volume > 100**, drops already-used keywords, clusters
  near-duplicates, ranks by volume × intent, and writes `scripts/keyword-suggestions.md`:
  ```
  node scripts/keyword-candidates.mjs "<topic or region>" --prune
  ```
  - `--prune` MOVES high-confidence junk (airlines, bbq, jobs, real estate, …) to
    `Keywords/_irrelevant/` — **reversible, never deletes**. Always pass it so the
    bank stays clean.
  - `--file <name>` forces a specific CSV; `--list` shows candidate counts per file.
- From the shortlist, choose an **unused** primary keyword (KD<30, Vol>100). Its
  cluster siblings become your **secondary keywords**; a ✦ flag means the live SERP
  has People-Also-Ask (FAQ seeds — confirm them in Step 2).
- **Relevance is human-judged:** the script surfaces candidates, you decide. Skip
  off-topic matches (e.g. "kailua kona vacation rentals" is Big Island, not Oahu).
  If clear junk slipped the stoplist, extend the `STOP` array in the script.
- Plan the affiliate angles for the chosen keyword up front (Step 3b): which lodging
  (Expedia), tours (Viator), or gear links the topic supports.

### 🔶 MILESTONE 1 (report, don't stop) — emit a status line: the auto-picked CSV, the
chosen primary keyword (with volume + KD) + secondary cluster siblings, the post
angle/format, the planned **affiliate angles**, and the single soft picnic mention.
**Then continue straight to research — do not wait for approval.**

### Step 2 — Research the SERP (do not skip)
- **Run `scripts/serp-optimize.mjs` — this IS the SERP-research method now (replaces hand-analysis).**
  WebSearch the keyword and pick the **top ~10 GENUINE blog competitors**. **EXCLUDE** .gov/official
  pages, Reddit, TripAdvisor, Wikipedia, YouTube, Yelp, big news, and vendor/booking widgets — they
  skew the targets toward content you can't/shouldn't match (this is the relevance edge over Surfer).
  **Select by INTENT, not keyword/domain:** drop pages that share the keyword but cover a different
  topic (e.g. "Kauai shipwrecks" maritime history ≠ "Shipwreck Beach"), and DO keep genuinely-relevant
  authority guides (e.g. hawaii-guide) — relevance decides, not domain size. (Surfer grabs by domain
  authority + keyword string, so it pulls Reddit/vendor/wrong-topic pages and drops the best guides.)
  **Reddit/forums = a QUESTION source, not a scored competitor:** keep them OUT of the `--urls` corpus,
  but DO read the thread(s) in the SERP and *copy the real questions/vocabulary for relevance* into the
  FAQ + coverage. Mine them for intent; don't try to outrank them.
  Then: `export PATH="$HOME/.local/node/bin:$PATH"; node scripts/serp-optimize.mjs "<keyword>" --urls "u1,u2,..."`
  (no `--draft` for a brand-new post). **No pinning — pass today's competitors fresh each run** so
  you never optimize against a stale SERP. The brief `scripts/serp-brief-<kw>.md` gives: length target, term/phrase
  must-haves, **structure**, **questions** (FAQ seeds), **fact candidates** (the GEO/AI-Search facts
  to state), and per-competitor **outlines** (model the dominant format; ignore chrome flagged ⟵).
- Read the brief: note the **format** (from the outlines) and the shared topics/entities all cover.
- **LENGTH = LAND IN THE BAND (median … longest-genuine competitor).** When the median is genuinely high
  (a 4,000–8,000-word SERP), writing ~2,000 scores low — that gap IS the score, so write UP to the median.
  But the inverse is equally a miss: when the median is ~1,500, writing 4,000 is the **overshoot bug**, not
  depth — Surfer/serp-optimize EXCLUDE the bloated outlier, so don't chase it. Write to the brief's `Target
  band`: at least the median, never past the genuine ceiling. Real comprehensive depth, never padding.
- **🚦 HARD SCORE GATE — local SEO SCORE ≥ 90 is UNAVOIDABLE (owner-override ONLY).** After drafting +
  inserting into `content/blog.ts`, re-run the tool **with `--draft <slug>`** to get
  **`🎯 SEO SCORE: N/100`**. **A post does NOT publish below raw 90.** Keep iterating until achieved —
  this is not optional and not a judgment call; only the owner may override it. Work the points-ranked gaps
  top-down every loop: **lengthen to the competitor word count** (the #1 lever — match Surfer's word/paragraph/
  heading targets), put **every heading phrase in an H2/H3**, **fill every under-range term + trim every over**,
  add every entity. Re-run, repeat, until ≥ 90. Sits alongside Lighthouse ≥95 + 0 HARD slop as a blocking gate.
  AI-Search comes free from facts/intent. (Copy Surfer's spec — don't reinvent past it.)
  Then plan + write per the **Apply checklist** in `enhance-with-surfer` (Mode C) so coverage is
  *complete by rule*, not by discretion — fill every genuine gap, skip only the flagged filler.
- **Length = the serp-optimize BAND (record the numbers; they go in the exec summary).** This is THE
  standard — it's calibrated to the Surfer editor, which outputs a word RANGE, so we do too. The brief
  prints it as `Target band: <lo>-<hi>`:
  1. **Floor = the competitor MEDIAN** — never write below it ("hit their word count").
  2. **Working target = median × 1.15** (the brief's headline number).
  3. **Ceiling = the longest GENUINE competitor.** A competitor **≥1.5× the median is an OUTLIER and is
     EXCLUDED** from the band — match its *coverage*, not its length. (Do NOT set target = the outlier's
     length; that backwards rule is what caused the 2× overshoots.)
  4. **Section COUNT scales with the band: working-target ÷ ~280** → ~6–8 H2s for a ~1,700 band, ~12–14 for
     a ~4,000 one. State the band + section budget explicitly (e.g. "band 1,490–1,760, ~6–7 H2 sections").
  5. **`post-stats.mjs` auto-loads the band and flags BOTH ends** — under the floor *or* over the ceiling.
     Over the ceiling → MERGE/CUT sections, never deepen. Land IN the band.
- **If the keyword cluster can't support the target length**, pull more **related
  keywords** (re-run the finder / sibling clusters) or extract live **Google "People
  Also Ask"** questions and fold them into sections and the FAQ — do not pad with fluff.
- Plan to: match the format, hit the target, cover every shared topic, **add 1–2** the
  competitors missed, answer the query in the first paragraph (featured-snippet), and
  build the FAQ from PAA + the cluster's question keywords.

### Step 3 — Draft in the house voice
- Apply `DanKennedyVoice.md` **and both humour files** (`Humour.md` + `FunnyHumor.md`).
  The brand wants posts that are genuinely funny, not just informative — recent posts
  have read accurate-but-dry, so **lean harder into the jokes.** **WRITE FUNNY FIRST:**
  draft the beat INTO the section so it carries the fact (don't write the encyclopedia and
  sprinkle asides on top — that ships decoration, not jokes). **On-point test for every
  beat:** does it earn a nose-exhale/nod, or is it merely true? A true statement is not a
  joke — sharpen or cut. **Target voice = a friend at a bar dropping truths, a little
  sarcastic, not taking life too seriously, in the vacation mood — respectful, never mean**
  (funny-for-humans is the best engagement there is). Full guide: `References/Humour.md`.
  Techniques to actually
  use (from `FunnyHumor.md`): hyper-specific observations, absurd comparisons, dramatic
  legal/spiritual/emotional framing of tiny travel annoyances (the betrayal of a
  sunburn, the bloodsport of Lanikai parking, the existential dread of picking an
  island), one-sentence punchlines on their own line, and parenthetical asides that
  whisper to the reader. **Aim for a genuine smile-or-laugh moment every ~200–300 words**
  (up from 1-per-500). But: let the jokes breathe (don't force one into every sentence),
  keep them kind (punch at yourself, the topic, or physics — never the reader), and keep
  the post useful. Hook with a joke in the first 50 words; a sign-off that lands.
- **No exclamation marks, no emojis. And do not use "world-class"** — it is an AI tell
  that keeps slipping in; pick a specific, funnier phrase instead.
- Max **one** opinion (`Opinions.md`) and **one** story (`Stories.md`), adapted to
  the travel topic and backed by a real number from `stats.md`.
- Weave in secondary keywords naturally. Primary keyword in the **first 100 words**,
  the H1, and the title.
- **Soft picnic mention only** (per Positioning): at most one light, relevant line or
  aside, with a single low-key link to `/#packages` if it fits. The close should be
  useful travel takeaways, not a pitch — do not build the post around the CTA.
- Include a **Table of Contents** with anchor links and a **FAQ** section.
- **Short paragraphs, generous white space (standing owner preference).** Keep
  paragraphs to ~2–3 sentences and let them breathe — long, dense blocks read
  "too busy." Break a long thought into two short paragraphs rather than one wall.
  Use bullets and short paras to make the post scannable. (Site-wide spacing is
  already loosened in `.prose-brand`; this is about how you write, not the CSS.)
  Note: hitting the word target by *fattening sections* (Step 7 gate) and *short
  paragraphs* are not in tension — more short paragraphs of real detail is exactly
  the goal.
- **Write to the target on the FIRST pass, then PROVE it with the stats tool.**
  Measured across the first 11 posts, the recurring failure is mechanical: sections
  average ~200 words and the total plateaus near ~2,500 *no matter how many H2s you
  add* — because **adding sections does not add length, it just spreads the same words
  thinner.** Posts that hit target ran ~290–360 words per H2; posts that fell short
  ran ~195–225. So:
  - **Budget ~280w per H2**, and set the **section COUNT from the band: working-target ÷ ~280**
    (~6–8 sections for a ~1,700 band, ~12–14 for a ~4,000 one) — NOT a fixed 10–13. A fixed count
    is what fights the 250w floor into a 2× overshoot on low-band keywords. When UNDER the band,
    **fatten existing sections** (don't add thin ones); when OVER the ceiling, **merge/cut sections**.
  - **Bullet-heavy formats (comparisons, by-region, "best X") run especially light.**
    Give every bullet a full sentence or two, and carry each section with real prose
    around the list — never a bare list under a heading.
  - **After drafting, run the length gate and act on it BEFORE Step 7:**
    `node scripts/post-stats.mjs` (newest post) — it prints total + per-H2 words and
    flags every section under 250w as ⚠ thin. **Deepen every flagged section until the
    total reaches target. Do not proceed to build with ⚠ thin sections** — that is the
    gate that has been missed on most short posts.
- **Expanding an existing post?** When you append via an Edit anchor, first confirm
  the anchor is unique to the target post: `grep -c -F "<phrase>" content/blog.ts`
  must return `1`. Shared sentences (e.g. a sunset-guide line reused across posts)
  have landed an edit in the wrong post before — always verify before editing, and
  re-run `post-stats.mjs` on the post afterward.

### 🔶 MILESTONE 2 (report, don't stop) — emit the proposed title/seoTitle/description/
excerpt/slug/category/icon and a one-line draft summary, then **proceed to add it to
`content/blog.ts`. Do not wait for edits/approval.**

### Step 3b — Affiliate links (PRIMARY monetization — plan these early)
Treat affiliate coverage as a first-class goal (see **Positioning**). Run the
**auto-discovery scanner during research/outline** so you build the post around real
opportunities, not bolt links on at the end:
`node --env-file=.env scripts/viator-opportunities.mjs` scans each post's topics,
queries the Viator Partner API, and writes `scripts/viator-suggestions.md` with
ready-to-use affiliate URLs (tracking baked in). **Review and pick** — some matches
are off-topic, so never paste blindly (it has matched "Diamond Head" to a parasailing
product). Re-run after the draft is in `content/blog.ts` to catch anything new.

**Map every monetizable intent in the post to a link if one exists:**
- **Tours / experiences → Viator.** Reuse `References/AffiliateLinks.md` by topic:
  sunset sail (Oahu), whale-watching, snorkel, beginner surf lesson (Waikiki),
  Diamond Head, Haleakala (Maui), Mauna Kea (Big Island), Na Pali (Kauai), North
  Shore circle-island.
- **Where to stay / lodging → a HOTEL CARD when a specific property is named, else Expedia search.**
  When the post names a real property that's in `content/itinerary/hotels.ts`, add a **hotel card** —
  the same rich `HotelCardView` used on `/where-to-stay` (real per-property photo gallery + fullscreen
  lightbox + Expedia/Booking compare CTAs). Discover matches read-only with
  `node scripts/hotel-opportunities.mjs` (writes `scripts/hotel-suggestions.md`; GREP-GATE every match —
  it surfaces incidental mentions too). Placement mirrors `::tour`:
  - **In-body hero:** `::hotel <id>` on its own line (blank line above/below), after the relevant
    section's first paragraph (e.g. a resort review's overview, or under each property H3 in a round-up).
  - **Bottom block:** the `hotels?: string[]` field on the `Post` object → a "Where to stay in this
    guide" block of `HotelCardView` cards. Ids come from `hotels.ts` (e.g. `kihei-wailea-grand-wailea-maui`).
  For posts that only discuss an AREA (no specific property), keep the evergreen **Expedia** search link
  (`expedia.` whitelisted; reuse `hotel-search-<area>` from the registry). Don't stack an Expedia search
  link next to a property card that supersedes it.
- **Gear / what to pack / flights / car → Amazon / Skyscanner / Discover Cars**, etc.
  as those programs come online (hosts already whitelisted in `lib/markdown.ts`).

**Rules:** anchor on a natural phrase already in the copy (never "click here"); spread
links out (~1 per 300–400 words is a sane ceiling; never stacked); the renderer
auto-adds `rel="sponsored nofollow noopener noreferrer"` for known hosts and the page
auto-shows the FTC disclosure when any affiliate link is present — no manual step.
Keep the one soft picnic mention separate from affiliate links. **Log every link you
use in `References/AffiliateLinks.md`** (with which post), and add new networks to the
`AFFILIATE_HOSTS` array in `lib/markdown.ts` as you join them.

**Featured-tour cards — one hero in the body + the rest at the bottom.** Every post
with relevant Viator tours gets:
1. **One hero card in the body**, inserted with a directive on its own line:
   ```
   ::tour 320916P1
   ```
   Pick the single most relevant tour. Place it **after a COMPLETE paragraph** (blank
   line above and below). **Never inside a list** — a card between `<li>`s splits the
   list; if the natural spot is a list item, place it after the paragraph that follows
   the list. Keep the inline text affiliate link too (natural anchor); the card complements it.
2. **The other relevant tours at the bottom**, via the `tours?: string[]` field on the
   `Post` object (codes only):
   ```ts
   tours: ["67418P2", "292001P1", "64093P2"],
   ```
   The blog template renders these as a labeled **"Book the experiences in this guide"**
   block next to "More from the blog." Do NOT stack these in the body — bottom only.
   The block is auto-labeled + carries the FTC disclosure (stays transparent, not disguised).
- **Card data** lives in `content/viatorTours.ts`, keyed by Viator product code. Add codes:
  `node --env-file=.env scripts/viator-tour-data.mjs <code> <code> ...` (fetches
  image/rating/reviews/price + tracked URL; re-run to refresh). Find a code by searching
  the Partner API by topic (`scripts/viator-probe.mjs` shows the shape) and pick a
  high-rating, **correct-island**, on-topic match — the free-text search returns other
  islands (a Maui tour surfaced for an Oahu post once; verify the island).
- The card image is Viator/supplier media promoting that bookable product (within
  Partner API terms) — fine for cards, NOT a substitute for the Unsplash/Pexels article photography.
  Images are 720×480 JPEG on `media-cdn.tripadvisor.com`, already allowed in the CSP
  (`netlify.toml` / `vercel.json` / `public/serve.json` `img-src`). **A new image host
  must be added to all three CSP copies or it is silently blocked.**
- The homepage uses the React `<TourCard code="..." />` (`components/TourCard.tsx`); the
  body directive uses `renderTourCard` in `lib/markdown.ts`. Both share the `.tour-card`
  styles in `app/globals.css`; `tailwind.config.ts` scans `./lib/**` so those classes
  aren't purged. The CTA button is **on-brand ocean teal (not orange), centered**, and
  in-body article images have **rounded corners** — both already in `globals.css`, no
  per-post action. Log the card codes in `References/AffiliateLinks.md`.

### Step 4 — Source images (Unsplash first, Pexels fallback)
**Favor Unsplash.** Source every image from Unsplash; only fall back to Pexels for
a given slot when Unsplash has **no suitable, on-topic image** for that query (thin
results, wrong subject, low relevance). You can mix hosts within one post — a
Pexels cover with Unsplash in-body shots is fine. Both hosts are CSP-whitelisted.

- 1 `coverImage`, width 800, height 500, descriptive alt w/ keyword:
  - **Unsplash:** `https://images.unsplash.com/photo-XXXX?fm=webp&fit=crop&w=800&h=500&q=80`
  - **Pexels (fallback):** `...?auto=compress&cs=tinysrgb&fm=webp&w=800&h=500`
- **🔴 MANDATORY — INSPECT EVERY CANDIDATE BEFORE PLACING IT.** Quality is exactly why
  in-body photos were pulled once before. For each slot: search, **download the candidates,
  and VIEW each one** (the Read tool renders images) — only place a photo that is (1)
  genuinely good quality (sharp, well-composed, sunny/on-brand, not generic filler) AND
  (2) **location-accurate**. Unsplash/Pexels mislabel constantly (a Kualoa/Chinaman's-Hat
  shot tagged "Lanikai", a Hanauma shot tagged "Waimea", a non-Hawaii coastline tagged
  "Oahu") — reject those, reject gloomy skies on a "sunny" spot, reject placeless filler.
- In-body photos at a **soft ~1 per 500 words** (quality over an exact count — never force a
  weak photo to hit a number), each placed **above an H2**, `w=1200&h=800`, descriptive alt,
  with an italic photographer-credit caption line beneath.
  - **Unsplash (hotlink):** `...?fm=webp&fit=crop&w=1200&h=800&q=58` (strip ixid/ixlib) — caption
    `*Photo: [Name](profile-url) on [Unsplash](https://unsplash.com)*` (attribution
    is **required** by Unsplash's API terms — always credit photographer + Unsplash).
  - **Pexels (fallback) — SELF-HOST as WebP, never hotlink.** Download the original →
    `sharp` resize 1200×800 q60 → `public/images/posts/<name>.webp`, embed `/images/posts/<name>.webp?w=1200&h=800`
    (the `?w=&h=` is read by `renderImage` in `lib/markdown.ts` to emit width/height on local images — prevents CLS / passes checklist 8.2e).
    (Hotlinking Pexels re-adds third-party Cloudflare cookies that drop best-practices below 100.)
    Caption `*Photo: [Name](profile-url) via [Pexels](https://www.pexels.com)*`.
- The renderer's `fit=crop` (Unsplash) gives an exact 3:2 crop; the responsive srcset
  builder rewrites `w`/`h` and works on both hosts unchanged — no code changes needed.

### Step 4b — Inline HTML infographics (visuals that lift dwell)
Humans love a good visual, and a native infographic keeps readers on the page
longer than a wall of text. These are **HTML/CSS, not images** — so the text is
real and crawlable, perfectly legible (no AI-garbled image text), zero-CLS, and
on-brand. Add **one or two per long post where the content is genuinely visual** —
never as decoration, and **never duplicate** the same facts in both prose and the
graphic (replace the plain table/list with the visual, or let the visual carry it).

**Good candidates:**
- a "which X is right for you?" selector (cards with *Best for* / *The catch*)
- a season/timing calendar or timeline (color-coded months or steps)
- a comparison, a step framework, a budget split, a checklist
If the content isn't actually visual, skip it — don't force one.

**Mechanism (mirrors the `::tour` card pattern):**
- Put the directive on its **own line**, after a complete paragraph (blank line
  above and below, **never inside a list**):
  ```
  ::infographic <key>
  ```
- Data lives in `content/infographics.ts` (keyed object; each entry has a `kind`).
- `renderInfographic(key)` in `lib/markdown.ts` emits the HTML; `.ig-*` styles
  live in `app/globals.css` under `@layer components`.

**Reusable keys (copy these as templates):** `island-selector` (4 island cards,
*Best for*/*The catch*, one highlighted "Our pick") and `season-timing` (12-month
strip color-coded peak/summer/sweet-spot + legend). They hold honeymoon-post data;
for a new post add a **new keyed entry** named `<slug>-<type>` (e.g.
`best-time-to-visit-season-timing`) rather than overwriting these.

**To add a new infographic type:**
1. Add a typed entry to `content/infographics.ts` (give it a `kind`).
2. Add a `kind` branch to `renderInfographic` in `lib/markdown.ts` that builds the
   HTML string — `escapeHtml()` every dynamic value, wrap in
   `<div class="not-prose ig ig-...">`.
3. Add `.ig-*` rules to `app/globals.css`.

**Non-negotiables (learned the hard way):**
- **Never build a class name by interpolation** (e.g. ``ig-month--${tier}``).
  Tailwind tree-shakes `@layer components` rules unless the class appears
  **verbatim** in a scanned file, so interpolated variants get purged and the
  graphic renders **colorless**. Map each variant to a **literal** class name:
  `{ peak: "ig-month--peak", summer: "ig-month--summer", sweet: "ig-month--sweet" }`.
- **One accent only:** ocean-teal (`brand-*`) with **gold `#dda53a`** as the single
  highlight; serif heading (`font-serif`), rounded soft-shadow card, `.not-prose`
  wrapper. No new colors, no gradients, no emoji (matches the Design rules).
- **Mobile-safe grids:** use `repeat(N, minmax(0,1fr))` so columns shrink to fit and
  never overflow; pick a mobile column count that wraps cleanly (e.g. 6 for 12 months).
- **Verify in the build (Step 7):** grep the exported HTML for the infographic's
  text, AND grep the built CSS (`out/_next/static/css/*.css`) for **each variant
  class** — confirm the color rules survived tree-shaking before you call it done.

### Step 5 — Add the post (live in DEFAULT mode; to the queue in draft-only)
> **DEFAULT (write + publish):** paste the `Post` object at the **TOP** of the `Post[]` array in
> `content/blog.ts` and the infographic(s) into `content/infographics.ts`, with `date` +
> `dateModified` set to **today** (use the contiguous one-per-day dating rule below). Add **1–3
> inbound backlinks** from the most relevant existing posts to this one (de-orphan). Then continue
> to Steps 6–9 (log → build → QA → deploy). The `body` is a plain-backtick template literal.
>
> **DRAFT-ONLY (only when the user asks to hold it):** instead, write the post to
> **`content/drafts/<slug>.md`** + a `QUEUE.md` row, commit, and **STOP** — nothing goes live.
> The detail below describes the draft-file format for that mode; in default mode you write the
> same `Post` object straight into `content/blog.ts`.
- Write the post to **`content/drafts/<slug>.md`** in the standard draft format — see
  `content/drafts/README.md` and any existing draft (e.g. `content/drafts/hula.md`):
  YAML frontmatter (`slug`, `status: drafted`, `drafted`, `primaryKeyword`, `volume`, `kd`,
  `category`, `secondary`) → a `## Post object` fenced ```ts block holding the full `Post`
  object with `date`/`dateModified` set to `"TBD-AT-PUBLISH"` → a `## Infographic` ```ts
  block → a `## Publish metadata` section (keywords, length math, internal/authority/affiliate
  links, image credits, **backlinks to add at publish**, cultural notes). Pick a fitting
  `category` and `icon`.
- Add a row to **`content/drafts/QUEUE.md`** (the cannibalization guard): `| # | <slug> |
  <primary keyword> | <vol> / KD<n> | <CATEGORY> | <today> | drafted |`.
- **Build / render / Lighthouse are deferred to `publish-post`** — a `.md` draft can't be
  built. Author-time QA here = `post-stats` length, `node scripts/ai-slop-check.mjs
  content/drafts/<slug>.md` (0 HARD tells), voice/humour/SEO review of the text, and curl-verify
  every external link resolves. **Do NOT** write `Used_Keywords.md`, `AffiliateLinks.md`, or an
  exec summary — those are **publish-time** artifacts that `publish-post` creates.
- **Commit the draft + QUEUE row** (focused commit, co-author trailer). Drafts may be committed
  freely; there is no go-live gate here because nothing goes live until `publish-post` runs.
- **Dating is set at publish time by `publish-post`, NEVER here — and never future-date.** Posts are back-dated into a contiguous,
  one-per-day descending sequence (newest at the top of the array). To date a new post:
  1. Scan the existing `date:` values. Find the most recent **unused day on or before
     today** — i.e. today if today isn't taken, otherwise the newest gap in the sequence.
  2. If today and every recent day is already used (no gaps), **add to the back**: give
     the post a date **one day older than the current oldest post** (extend the run
     backward). Do not reuse a day and do not jump ahead of today.
  3. Because the array is display-ordered, a post taking today's slot goes at the very
     top; a post that fills an older gap or extends the back should sit in the array at
     the position that keeps array order = date order (newest → oldest).
  Set `dateModified` = the same date (bump it only on a real later edit).
- **`body` is a template literal — its delimiter is a plain backtick (`` ` ``), never
  an escaped `` \` ``.** Writing `body: \`...\`` has broken the build twice ("Expected
  unicode escape"). After inserting, if the build throws that error, grep for `` \` ``
  in `content/blog.ts` and remove the stray backslashes.
- Satisfy every applicable item in `References/OnPageSEOCheckList.md`: title ≤60
  (use `seoTitle`), description ≤160, keyword-in-slug (hyphens, lowercase), one H1,
  logical H2/H3, ToC + anchors, 3+ internal links (existing destinations only),
  2–3 external authority links (.gov/.edu/major sources), FAQ.
- **Verify every external link resolves before shipping** — `curl -s -o /dev/null
  -w "%{http_code}" -A "Mozilla/5.0" -L <url>`. A site audit will flag broken
  authority links, and several common patterns silently 404 or block crawlers:
  - **gohawaii.com** killed its deep paths — `/trip-planning/travel-smart/*` and
    `/islands/<island>/travel-info/*` are **404**. Only `/islands/<island>`,
    `/islands/<island>/regions/*`, `/trip-planning/travel-tips`, `/malama` are safe.
  - **Bot-blockers (403 to crawlers, valid for humans — avoid for clean audits):**
    AllTrails, timeanddate.com, wehewehe.org, USGS, the Met, americanhistory.si.
    Use crawler-friendly equivalents instead: **sunrise-sunset.org** (sun times),
    **ulukau.org** (Hawaiian dictionary), **oceansafety.hawaii.gov** (ocean safety),
    **weather.gov / nps.gov / fisheries.noaa.gov / britannica.com** (all 200).
  - Don't guess a path (e.g. `nps.gov/.../fee-free-days.htm`, `britannica.com/plant/taro`)
    — curl the exact URL first; close-but-wrong slugs 404.
  - **URL-encode parentheses** in links — a URL like `.../wiki/Spam_(food)` breaks the
    Markdown `](url)` parser at the first `)`; write `.../wiki/Spam_%28food%29`.
- **No paragraph over ~150 words / ~700 chars.** The audit flags "paragraphs are
  too long" (SEO/AI-Search readability). The *deepen-thin-sections* step is where
  paragraphs balloon — after fattening, re-scan and split any long block at a
  sentence boundary (insert a blank line). Aim ~2–3 sentences / ≤110 words each.
- **Re-read any sentence where you inserted an internal link mid-clause** — a
  dropped comma/clause ("the Feast at Lele *which* ditches…") slips in easily.
- Follow `LightHouseBestPractices.md` for images and color contrast.

### Step 6 — Log the keyword
- Append the used primary (+ its secondaries) to `Keywords/Used_Keywords.md`.

### Step 7 — Build & technical verify
- `export PATH="$HOME/.local/node/bin:$PATH" && npm run build` — fix any errors.
  Confirm the route shows `●/○ (Static)` and the slug is prerendered.
- **Register the post in the link index + refresh semantic read-next + orphan check** (do NOT
  run the full `/internal-linking` skill here — that's overkill for one post; the in-context
  linking you did while drafting is the real work. These commands keep the indexes live, refresh
  the semantic read-next, and verify your backlinks landed):
  - `node scripts/gen-website-index.mjs` — regenerates `website-index.md` so the new
    post (and the backlink edits you made to existing posts) are listed. **Commit the
    refreshed `website-index.md` with the post** — it's what the `/internal-linking`
    system reads, so it must not go stale.
  - `node scripts/embed-related.mjs` — re-vectorizes all posts (Gemini embeddings) so the new
    post enters `content/related.json`: it gets its own semantic **"Read next"** block AND
    appears in other posts' read-next, and the audit's link candidates become semantic. Needs
    `GEMINI_API_KEY` (billing); if absent/over quota, put `read-next: skipped — <reason>` on the
    board and continue. **Commit the refreshed `content/related.json`** with the post.
  - `node scripts/internal-link-audit.mjs --page <slug>` — confirm it prints `INBOUND: ≥1`
    (your "backlinks in" step landed). Its `LINK OUT` candidates are now **semantically ranked**
    (embeddings-blended), so if the post is light on links, add the best genuinely-related ones.
    If it says `ORPHAN`, add ONE inbound link from the top suggestion and re-run.
- Audit the built `out/blog/<slug>/index.html` (grep): title length (≤60 incl.
  brand suffix), meta length (≤160), one H1 w/ keyword, `BlogPosting` + `FAQPage`
  + `BreadcrumbList` JSON-LD present, every `<img>` has alt + WebP + width/height
  (first eager, rest lazy), internal links resolve, external authority links
  present, affiliate links carry `rel="sponsored nofollow"` + disclosure shows,
  ToC anchors all resolve to heading ids, back-to-top present. **Report as a compact
  keyword/status board** (`title-len: pass`, `jsonld: blogposting+faq+breadcrumb`,
  `imgs: alt+webp+dims`, `internal-links: ok`, …), not prose.
- **Canonical + sitemap check:** the post's canonical and its `<loc>` in
  `out/sitemap.xml` must both be `https://www.hawaiipicnics.com/blog/<slug>/`
  (www). Grep to confirm — a non-www URL here is an indexing bug.
- **Redirect-collision check:** `grep "^/blog/<slug> " public/_redirects` must
  return nothing. If it matches, the slug is shadowed by an old-site redirect —
  rename the slug.
- **Lighthouse (run, don't skip):** serve the build and run Lighthouse against
  the post. The bar (owner's standing goal is 100s):
  - `export PATH="$HOME/.local/node/bin:$PATH" && npm run serve` (port 3000), then
    `npx lighthouse http://localhost:3000/blog/<slug>/ --quiet --chrome-flags="--headless" --only-categories=performance,seo,accessibility,best-practices --output=json --output-path=/tmp/lh-<slug>.json`
  - Targets: **Performance ≥ 95, SEO 100, Accessibility ≥ 95, Best-Practices ≥ 95.**
    Report the four scores. If anything misses, fix per
    `LightHouseBestPractices/LighthouseBestPractices.md` (usually image
    dimensions/lazy-loading or contrast) and re-run before proceeding.
- Optionally screenshot the post for the user.

### Step 7b — Companion podcast: RETIRED (owner-disabled 2026-06-15)
**Do NOT generate a podcast on new posts.** The owner retired the companion-podcast step on
2026-06-15: the Gemini multi-speaker TTS call was the priciest call in the pipeline for the lowest
engagement return, and the budget is redirected to the **freshness/accuracy audit**
(`scripts/freshness-audit.mjs`). Do not write a podcast script, do not call
`scripts/generate-podcast.py`, do not add a `content/podcasts.ts` entry, and do not embed a
`::podcast` directive. There is no podcast on the status board anymore.

Visual cadence is carried by native `::infographic` blocks (≥1 per ~500 words) plus **vetted
in-body photos** (≥1 per ~500w, soft — inspect every candidate for quality + location first) — it never
depended on the podcast. The `generate-podcast` / `add-podcast` skills and the ~150 existing posts'
podcasts stay in place (already paid for, live, indexed) — this only stops *new* generation. Future
first-hand video footage (owner-filmed, AI-edited) is the intended successor and gets its own
pipeline when it lands.

### Step 7c — Freshness/accuracy audit (run on the new slug)
Run `node --env-file=.env scripts/freshness-audit.mjs --slug <slug>` (Gemini 2.5 Flash + Google
Search grounding) on the finished post. It pulls the perishable claims — prices, fees, hours, days
open, reservation/permit rules, open/closed status — and flags any that look stale against the current
web. **The audit over-flags ~half, so NEVER apply a flag blind: verify each flagged value at its
OFFICIAL/primary source first** (false-positive patterns: reseller-vs-direct prices, marginal deltas
inside a hedge, official-vs-unofficial figures). Fix genuine drift in the house voice, re-run the audit
on the slug to confirm `0 stale`, then proceed. When sources genuinely conflict, use an honest small
range rather than a contested precise number. (Caught the `maui-swap-meet` entry fee 50c→ "50-75c" on
its very first run.)

### Step 8 — Final SEO checklist pass (pre-publish gate)
**Print the live checklist first:** `node scripts/post-checklist.mjs <slug> --kw "<primary>"`
— AUTO rows must ALL pass (exit 1 otherwise; run after the build for the full set), and every
👁 row gets a one-line verdict. **Paste the printed table — the owner glosses over it on every
post.** Then do one explicit, line-by-line run-through of
`References/OnPageSEOCheckList.md` against the built page and present it as a
**pass/fail table** — every applicable item gets ✅ or ❌ (no "probably"). Also
re-run the **voice/AI-tell scan** with the checker:
`node scripts/ai-slop-check.mjs content/drafts/<slug>.md` (or `<slug>` once it's in
blog.ts) — **0 HARD tells required** (exit 0); review every SOFT tell and any
paragraph flagged with 3+. The checker also fails on **Hawaiian diacritics outside
parentheses**: write place names in plain ASCII (Iao, Lanai, Haleakala — no
macrons/ʻokina, no apostrophe by default), and on a term's **first mention** give
the Hawaiian spelling in parens once — `Iao (ʻĪao) Valley` — ASCII after. Headings/
ToC/alt/meta stay ASCII-only. Full rule: `BlogStructure.md` §3a. The HARD/SOFT lists + rationale live in
`References/PassAISlopAndDetection.md`. *Exception:* a HARD tell inside scare-quotes
that the post is deliberately mocking (e.g., `"hidden gem"`) is intentional voice —
keep it and note the override. Also check stray exclamation marks in prose
(markdown `![` image syntax is fine) and emojis.

**Kill spell-checker hyphens (owner voice — standing rule).** Hyphenated compounds
("adults-only", "full-service", "lava-tube", "family-friendly") read as AI/spell-checker
output; the brand voice strips them unless removal reads wrong. Run the safe de-hyphenator
on the post: `node scripts/dehyphenate.mjs <slug>` (dry-run — review what it would change
and any `UNCLASSIFIED`/`MANUAL` words it surfaces), then `node scripts/dehyphenate.mjs <slug>
--apply`. It only touches the `body` field, never icon/slug/meta; a border guard skips
slugs/URLs/anchors/contractions; and it auto-keeps proper nouns (Kailua-Kona, Ritz-Carlton,
Byodo-In), acronyms/phonetic guides (G-C-E-A, ah-LOH-hah), and a denylist (check-in, add-on,
Wi-Fi). **Hand-rephrase every `MANUAL` flag** (`-wise`, `near-free`, `Michelin-ambitious` —
despacing those reads wrong) and judge any new `UNCLASSIFIED` word (add genuine compounds to
the script's KEEP/JOIN lists, despace the rest). Bonus: despacing also lets the SEO scorer's
tokenizer count the words (it keeps hyphens, so "lava-tube" never matches `lava`/`tube`) —
**re-run the scorer + `post-checklist` + `npm run check` after applying** (FAQ/heading text
can shift the score and the ToC anchor ids regenerate from the new text).

**Then re-read `References/DanKennedyVoice.md` and re-inspect for voice PRESENCE,
not just AI-tell absence.** A post can pass the banned-word grep and still read
flat and dry (the longer, list-heavy pillar posts are the most at risk). Read the
draft top to bottom and confirm it actually has: a hook in the first 50 words, the
direct second-person "you," ~1 dry aside or one-line punch per 300–500 words,
varied sentence length (long setup → short punch), benefit-driven subheads, and a
sign-off that lands. If it reads like a competent-but-bland encyclopedia entry,
warm it up before shipping — that flatness is the most common miss on long guides.

**Humor check (re-read `FunnyHumor.md`):** confirm the jokes actually landed. There
should be a genuine smile-worthy moment every few hundred words — something specific,
absurd, or dramatically over-serious about a tiny thing — not just clean informative
prose with one quip in the intro. If the post is accurate but humorless, add 3–5 real
jokes (hyper-specific observations, absurd comparisons, one-line punchlines) before
shipping. "A little more funny" is a standing instruction from the owner.

Fix every ❌ and rebuild before Checkpoint 3. This is a gate, not a formality —
do not advance with an open ❌ or a draft that reads dry.

### Step 8a — Fable editor pass (AUTO when `ANTHROPIC_API_KEY` is configured)
Full protocol + authority rules: **`References/FablePlaybook.md` §5** — follow it exactly.
Condensed: once the draft clears the mechanical gates (score ≥90, slop 0, post-stats clean,
inserted in blog.ts), run `node --env-file=.env scripts/fable-pass.mjs <slug>` → read the
Judgment flags → `--apply` (the SCRIPT splices the body — never retype/transcribe it) →
re-run scorer/slop/post-stats/build/Lighthouse → `--verify <slug>` must print
**`fable-guard: identical`** (or drift acknowledged with `--allow N --reason "<allowlist item>"`,
mirrored in the exec summary). The guard line goes on the status board. **After --apply the
prose is Fable's: taste disagreements are logged as `## Pass objections` in the exec summary,
never edited.** Key absent / call fails / owner said **"no fable"** (any phrasing, anytime — low-search
pages, quick edits, their call, no pushback) → skip and put `fable-pass: skipped — <reason>`
on the board.

### Step 8b — Write the one-page executive summary
Create **`exec-summaries/<primary-keyword-slug>.md`** (one file per post, named after
the main keyword). Keep it to roughly one page, human-skimmable. Include:
- **Keywords:** primary (vol + KD) and the secondary cluster woven in.
- **Length & the math:** this post's word count, each competitor's length, the median, and
  the serp-optimize **band** (floor = median, working target = median×1.15, ceiling = longest
  genuine competitor; note any outlier excluded). Confirm the total lands IN the band.
- **Links added:** internal, external authority, and affiliate cards (hero + bottom block).
- **Checks:** a compact pass/fail line for build/SEO/Lighthouse (the four scores).
- **Voice & humour:** a one-line verdict on each, with examples of the humour beats.
- **💰 Monetization opportunities:** concrete plays for **Amazon / Viator / Expedia** for
  this topic — which products/links, and which program to prioritize (flag gaps, e.g.
  "Amazon not live yet but this post maps to ~12 products").
- **🌺 On-the-ground service-business patterns:** any local Hawaii service the owner could
  install that this topic's demand signals (e.g. beach-/snorkel-gear delivery), noting
  synergy with the picnic ops.
- Anything else genuinely useful (sitewide side-effects, retrofit suggestions).

### 🔶 MILESTONE 3 (report, don't stop) — emit the build audit + Lighthouse scores + the
final SEO checklist as a **compact keyword/status board** (`build: pass`,
`length: <floor>-<ceiling> band · Nw ✅ in band`, `lighthouse: 98/100/96/100`,
`seo-checklist: 17/17 ✅`, `voice: pass`, `humour: pass`) — **the `length:` band field is
mandatory (TheBible §9 report checkbox); a post ▲ OVER the ceiling does not ship** —
**and link the exec summary** (`exec-summaries/<keyword>.md`). Then stage only the
post-related files (`content/blog.ts`, `Keywords/Used_Keywords.md`,
`References/AffiliateLinks.md`, `exec-summaries/<keyword>.md`, and any assets — plus
`content/viatorTours.ts` / template / CSS if you touched them), confirm `.env` is not
staged, and **commit** a focused, single-purpose commit over SSH. **Committing is NOT
going live — do not push.**

### 🟢 AUTO-DEPLOY GATE (write+publish mode) — deploy when QA is green.
After the focused commit, **auto-push over SSH** — "write a blog post" means write AND deploy
(standing authorization, 2026-06-08). **SAFETY GATE — push ONLY when every QA check is green:**
build `○ (Static)`, the `BlogPostChecklist` all ✅, and **Lighthouse ≥ 95/100/100/100.** If
anything fails, STOP — fix it, or leave it committed-but-unpushed; a failing build never deploys.
Push with:
`GIT_SSH_COMMAND='ssh -p 443 -o Hostname=ssh.github.com -o StrictHostKeyChecking=accept-new' git push origin main`
**Draft-only mode never deploys** — it stops at the committed draft. Non-post site changes still
hold for an explicit "go live" unless the user says otherwise; this auto-deploy is for the
write+publish blog flow only. One post = one Netlify build.

### Step 9 — After publish / deploy (indexing good practices)
Once the user has merged/deployed, remind them (or do what you can) to:
- **Confirm the deploy is live** and the post's canonical on the live URL reads
  `https://www.hawaiipicnics.com/blog/<slug>/` (www), and the page is reachable
  (not caught by a redirect).
- **Search Console:** the sitemap (`/sitemap.xml`) is already submitted, but run
  **URL Inspection → Request Indexing** on the new post URL to jump the crawl
  queue (days instead of weeks). Optionally re-submit the sitemap to nudge a recrawl.
- **Internal links in, not just out:** this is already done and verified in Step 7
  (the `internal-link-audit.mjs --page <slug>` orphan check) — a link to the new post
  from at least one relevant existing post. Nothing to redo here unless Step 7 flagged it.
- **Run Lighthouse / PageSpeed Insights on the *live* URL** once deployed as a
  final real-world check (CDN + headers differ from local).
- Note for the owner: authority boosters that speed indexing on a fresh domain —
  Google Business Profile (→ www URL), Instagram bio link (→ www), and a steady
  publishing cadence.

---

## Acceptance criteria
- Build passes; route is static; **final SEO-checklist pass (Step 8) is all ✅**.
- **Lighthouse run** (Step 7): Performance ≥ 95, SEO 100, Accessibility ≥ 95,
  Best-Practices ≥ 95 — scores reported.
- Canonical + sitemap `<loc>` are the **www** URL; slug is **not** shadowed by a
  `public/_redirects` rule.
- Reflects the brand voice/humour; ≤1 opinion and ≤1 story; only real numbers;
  voice/AI-tell scan clean.
- Primary keyword unused before, logged after.
- Real images with attribution, **Unsplash-first / Pexels-fallback** (Unsplash images
  carry the required photographer + Unsplash credit); no links to non-built routes; affiliate
  links carry `rel="sponsored nofollow"` + disclosure shows.
- **Length** lands IN the serp-optimize band (median … longest-genuine competitor, outlier
  excluded) — not under the floor, not over the ceiling; 0 thin sections.
- If the post has relevant Viator tours: **one** `::tour <code>` hero card in the body
  (after a full paragraph, never inside a list) **+ the rest in the bottom block** via
  the `Post.tours` field; all codes present in `content/viatorTours.ts`.
- **One-page exec summary written** at `exec-summaries/<keyword>.md` (keywords, length
  math, links, checks, voice/humour, monetization + on-the-ground service ideas).
- **`website-index.md` regenerated** (`gen-website-index.mjs`) and the new post **not an
  orphan** (`internal-link-audit.mjs --page <slug>` shows `INBOUND: ≥1`); the refreshed
  index is committed with the post.
- Any inline `::infographic` uses **literal** (non-interpolated) variant classes, the
  ocean-teal + gold palette, and a non-overflowing `minmax(0,1fr)` grid; its text and
  per-variant CSS are confirmed present in the build.
- Ran autonomously through all 3 milestones without pausing; committed a focused commit
  at the end; **stopped only at the go-live gate — no push/deploy until "go live."**
- All verification checks reported as a compact keyword/status board, not prose.
- After publish: Request Indexing in GSC + post is internally linked (not orphaned).
