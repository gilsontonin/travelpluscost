# Blog Post Pre-Ship Checklist — never miss a thing

Run this top to bottom before any post goes live. **Print it live for any post:**
`node scripts/post-checklist.mjs <slug> --kw "<primary keyword>"` — AUTO rows are verified
mechanically (exit 1 on any fail; build first for the full set), 👁 rows are the judgment
calls the run must answer. **Paste the printed table in every write/review run** — this is
what the owner glosses over. Every box must be ✅ (or N/A with a reason).
Born 2026-06-08 after the manapua post shipped with a body-duplicating FAQ — item 3.4 is the one
that caught us. The CORE UPGRADES in `write-blog-post/SKILL.md` are the source of truth; this is the
checkable distillation.

> ## 🔴 RECURRING MISSES — verify these EXPLICITLY (they pass the build but fail the standard)
> Tick each one by hand; these are the ones that slip through on real posts:
> - **5 — bold the answer PHRASE, not the sentence** (intro keyword answer + every FAQ lead).
> - **4.2 / 9 — a quick-facts strip per spot/item** (Cost · Time · Cash · the move).
> - **3.4 — FAQ = leftover questions only** (never re-answer a body section).
> - **4.6 — X-vs-Y must be a compare VISUAL**, not just prose.
> - **4.7 — visible "as of 2026" freshness signal.**
> - **0 · HOUSE STYLE — convert, don't impress:** ≤3 sentences/paragraph (favor 2–3, AUTO 6.4b) · positive/toward-framing (say what to DO, never "don't") · active subject-first · simple words ONLY when not serp-dictated · "partner" not "her" · TL;DR ≠ first paragraph (AUTO 3.3e) · no "lush"/"turquoise".
>
> **Run this whole file line-by-line and report a ✅/❌ table — do not spot-check.**

## 0 · House writing style (convert, not impress — owner-locked 2026-06-20)
- [ ] **0.1** Paragraphs **≤3 sentences, favor 2–3**, never a wall of 1-sentence lines (~1 inch on mobile). *(AUTO 6.4b)*
- [ ] **0.2** **Positive / toward-framing** — say what TO DO, never what to avoid; lead with the replacement; "when not to" reads as "do X when Y" (RFT: the mind can't picture a "not").
- [ ] **0.3** **Active voice, subject-first** — never front-load the modifier ("Magic Island sits ten minutes away," not "It takes ten minutes to get to Magic Island").
- [ ] **0.4** **Simple high-school words — but NOT if serp-dictated.** Never trade a ranking term for a plainer synonym (keep "located"/"intimate"); plain-swap only the rest.
- [ ] **0.5** **Gender-neutral — "partner," never "her/she."**
- [ ] **0.6** **TL;DR ≠ the opening paragraph** (different words AND angle). *(AUTO 3.3e)*
- [ ] **0.7** No clever-for-clever's-sake; contractions on; no "lush"/"turquoise" *(HARD in ai-slop)*.

## 1 · Keyword & SERP
- [ ] **1.1** Primary keyword is UNUSED (`Keywords/Used_Keywords.md` + grep `content/blog.ts`) and not drafted (`content/drafts/`).
- [ ] **1.2** Slug = keyword, lowercase-hyphen, and NOT shadowed by `public/_redirects`.
- [ ] **1.3** Analyzed the top 3–5 **genuine** competitors only — excluded Reddit, Wikipedia, TripAdvisor, YouTube, Yelp, big news, Google's own boxes.
- [ ] **1.4** **Length lands IN the serp-optimize band (calibrated to the Surfer editor).** Floor = competitor MEDIAN (never below it), working target = median×1.15, ceiling = the longest GENUINE competitor. A competitor ≥1.5× the median is an OUTLIER — EXCLUDED from the band (match its coverage, not its length; do NOT "never shorter than #1" — that re-imports the outlier). Over the ceiling → trim/merge, never deepen. Section count = working-target ÷ ~280. Numbers recorded.
- [ ] **1.5** Found the gap vs four points: must-have topics · PAA/related searches · "a friend would tell you" details (parking/cost/timing/difficulty/worth-it) · freshness (closed spots, changed fees).

## 2 · The first paragraph (put real effort here)
- [ ] **2.1** **Answer FIRST**, then hook. Never a "scroll down to find out" tease.
- [ ] **2.2** **Bolded direct answer to the primary keyword — ONE phrase, not a sentence — in the intro.**
- [ ] **2.3** Primary keyword in the first 100 words, the H1, and the title.
- [ ] **2.4** A vivid, true, dry-funny line earns the next scroll within the first 50 words.

## 3 · Structure & answers (THE engagement core)
- [ ] **3.1** Main questions answered **IN THE BODY, narratively** — each PAA folded into the section where it reads naturally (this wins snippets).
- [ ] **3.2** Snippet **format matched** to what Google shows (paragraph box → 40–55-word answer; list box → clean list; table box → build the table).
- [ ] **3.3** **TL;DR box** set (`tldr` field): keyword-first 40–55-word answer + 3–5 bold-led bullets. Not duplicated in the body.
- [ ] **3.4** 🔴 **FAQ holds LEFTOVER / long-tail questions ONLY — NONE that the body already answers.** Never answer the same question in both places. (This is the one we missed on manapua.)
- [ ] **3.5** **Bold the lead PHRASE only** at the start of each FAQ answer (just the phrase; rest clean).
- [ ] **3.6** Table of contents with anchor links that resolve.

## 4 · Make it genuinely helpful (every post)
- [ ] **4.1** **2–3 first-hand local details no competitor has** (the lot that fills by 7am, the local name, sells-out-by-afternoon).
- [ ] **4.2** A **"quick facts" mini-box per spot/item** — *Cost · Time · Difficulty · Best for* (bold-led line or small table).
- [ ] **4.3** **Anticipate the next question** after answers (answer → "but is it worth the climb?").
- [ ] **4.4** One **decision-helper**: "If you only do one, do X" — confident, reasoned.
- [ ] **4.5** One (max two) **vivid sensory line** — never purple.
- [ ] **4.6** **Comparison table/infographic** for any X-vs-Y. Location posts: a **`::directions`** orientation near the top (distance + direction from Waikiki), never an iframe.
- [ ] **4.7** 🟡 **Freshness, visibly** — current fees/hours + an explicit "as of 2026" signal. (Also missed on manapua v1.)
- [ ] **4.8** **Tight topic-cluster linking** (3–5 internal) + ideally a "read this next."

## 5 · Voice & humour
- [ ] **5.1** Genuine smile/laugh beat every ~200–300 words (specific, absurd, or over-serious about a tiny thing). **EVIDENCE REQUIRED: list one dry beat per content H2 in the report; a content section with no beat = fail** (`voice-scorecard.mjs` flags zero-wit sections; humour has no auto-judge, so the listed beat IS the proof it isn't dry).
- [ ] **5.2** Direct second-person "you"; varied sentence length (long setup → short punch); a sign-off that lands.
- [ ] **5.3** **No exclamation marks, no emojis, no "world-class"/AI-tells.** `ai-slop-check` = 0 HARD tells.
- [ ] **5.4** ≤1 opinion (backed by a number from `stats.md`) and ≤1 story (adapted, never invented).
- [ ] **5.5** Hawaiian words: ASCII in main text; proper spelling in parens on first mention only.

## 6 · SEO, links & images
- [ ] **6.1** `seoTitle` ≤ 60 (blog posts carry NO brand suffix — the `title.absolute` in `app/blog/[slug]/page.tsx` strips it, so the seoTitle IS the full SERP tag; use the space), description ≤ 160, one H1. **CTR:** lead with the keyword, then earn the click — **the current year on time-sensitive "best of"/guide/itinerary posts** (not on evergreen "what is X" / food explainers), a **real number** when the post genuinely has a count (never invented), and a punchy benefit/curiosity meta. Don't sacrifice the keyword or the char cap for a hook.
- [ ] **6.2** 3–5 internal links (existing routes only) + 2–3 external authority links — **every one curl-verified 200** (avoid bot-blockers; encode parens).
- [ ] **6.3** 🟢 **ONE cover photo** (800×500 = index thumbnail + OG card + top-of-post hero), WebP, keyword alt, eager.
- [ ] 👁 **6.3b** **In-body photos OK (re-enabled 2026-06-16) — but INSPECT every candidate for quality + location accuracy before placing.** Quality is why they were pulled before; view each candidate (Read renders images), reject generic filler / gloomy skies / mislabeled places (Unsplash & Pexels mislabel constantly — a Kualoa shot as "Lanikai", a non-Hawaii coast as "Oahu"). Unsplash hotlink (`?fm=webp&fit=crop&w=1200&h=800&q=58`) or **self-host Pexels as WebP** in `public/images/posts/` (never hotlink Pexels — third-party cookies drop best-practices). Descriptive alt + photographer credit each. Amount **~1/500w is a SOFT target — quality over count, never force a weak photo to hit a number.**
- [ ] **6.4** Paragraphs < ~150 words / 700 chars; short paras, generous white space.
- [ ] **6.5** 🟢 **At least 1 infographic per ~500 words** (native HTML — cards / bento / stat-panel / compare / steps / graph / `::tour` / `::directions`) — crawlable, fast, zero-CLS, on-brand. `post-stats.mjs` reports the target; convert plain lists/tables INTO the visual (do not duplicate facts in both). Variant classes **literal** so they survive tree-shaking. *(Money pages = same + booking CTAs; blog = native visuals + affiliate links + one soft picnic line.)*

## 7 · Affiliates (primary monetization)
- [ ] **7.1** Every monetizable intent mapped to a link if one exists — Viator (tours), Expedia (lodging), Amazon (gear). Natural anchor, ~1 per 300–400 words, never stacked.
- [ ] **7.2** Viator: **one `::tour` hero in the body** (after a full paragraph, never in a list) + the rest in the bottom `tours` block; codes in `viatorTours.ts`, correct island.
- [ ] **7.3** Renderer auto-adds `rel="sponsored nofollow"` + the FTC disclosure shows. Logged in `AffiliateLinks.md`.

## 8 · Build, QA & publish
- [ ] **8.1** `npm run build` clean; route `○ (Static)`.
- [ ] **8.2** Built HTML: JSON-LD (BlogPosting + FAQPage + BreadcrumbList) · TL;DR box · infographic · images alt+webp+dims · affiliate sponsored+disclosure · canonical + sitemap `<loc>` on **www** · no redirect collision.
- [ ] **8.3** **Lighthouse ≥ 95 / 100 / 100 / 100** (the auto-push gate).
- [ ] **8.3a** 🚦 **LOCAL SEO SCORE ≥ 90 — UNAVOIDABLE GATE, owner-override ONLY.** Run
  `node scripts/serp-optimize.mjs "<kw>" --draft <slug> --urls "..."` → **`🎯 SEO SCORE: N/100`** must be **≥ 90**.
  A post does NOT publish below 90 — keep iterating (match Surfer's word count + paragraphs + headings, put every
  heading phrase in an H2/H3, fill every under-range term, trim overs) until achieved. Only the owner may waive this.
- [ ] **8.4** Logged: `Used_Keywords` · `RankTracker` · `IndexingPriority` · `AffiliateLinks` · `QUEUE` → published · exec summary written.
- [ ] **8.5** **1–3 backlinks IN** from existing posts (de-orphan); re-run `npm run check`.
- [ ] **8.6** Commit (co-author trailer); auto-push only when 8.1–8.3 are all green.
- [ ] **8.7** After deploy: confirm live www canonical + **GSC → Request Indexing**.
