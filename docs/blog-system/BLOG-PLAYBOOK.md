# How to write a blog post — the operating manual (portable)

> **What this is.** The single, enforced contract for writing ONE blog post to a publishable standard.
> It was built for Hawaii Picnics and is written to **transfer to travelpluscost** (or any content site).
> If you are an agent and you are about to write or edit a blog post: **read this whole file first, then
> follow it top to bottom. Do not skip steps. Do not ship anything red.** Most "bad blog post" failures
> are not talent problems — they are *skipped-step* problems. This file removes the excuse "I didn't know."
>
> **The standard is not "looks good." The standard is: every gate is GREEN and PRINTED on screen, the
> checklist is PASTED in full, the pre-publish ritual is answered, and nothing red shipped.**

---

## ⭐ 2026-06-27 — THE STYLE BAR (read this first, it overrides older wording below)

The recent posts passed SEO but read **dry, dense, and spec-sheet-like**. The owner reset the bar to the
Hawaii-Picnics posts. **The canonical, copy-paste workflow is now `docs/blog-system/BLOG-PROMPT.md`;** the
final QA you must PRINT every run is `docs/blog-system/PRINT-CHECKLIST.md`. The non-negotiables:

1. **WRITE IT FUNNY — mandatory.** A dry beat every ~200–250 words, the joke written INTO the fact (nose-
   exhale test). Deadpan, no `!`/emoji, safe targets only. See `Humour.md`.
2. **Bold a few KEY WORDS — never a whole sentence.** (This OVERRIDES "bold the answer phrase" everywhere
   below — bolding the full answer sentence under an H2 is banned.)
3. **Paragraphs: 3 sentences is the workhorse, 1 sentence for punchlines, never 4+.** Mix for white space.
4. **Active voice, instructional.** What to do / what to avoid.
5. **Property cards ARE the visuals — distribute them INLINE (one per hotel, where it's discussed), never
   pile them; skip stock photos** unless genuinely illustrative.
6. **≥1 well-designed infographic / ~500w** (native `::infographic` stat/compare/steps/callout, not a bare
   table). Cards + infographics both count.
7. **Layout (in the components):** the `The move:` strip renders as a coral callout; every H2 gets a number
   + a divider rule; body font 16.5px; keep the top search bar + 8-hotel rail before the body.
8. **PRINT the full checklist every run; never ship dry or red — circle back until green.**

---

## 0. The prime directive + the 6 ways agents wreck a post

**Prime directive:** write the genuinely most useful, most honest, best-researched page on the internet
for that one search — then make a machine able to verify it. Usefulness first; ranking is the by-product.

Before anything else, internalize the six failure modes. **If you catch yourself doing any of these, stop.**

1. **Writing from memory instead of research.** You invent facts, prices, hours, and "top picks." → You
   MUST research the live SERP and verify every number at its source (§5.2, §5 freshness).
2. **AI-slop voice.** "Nestled," "vibrant," "hidden gem," "breathtaking," "unlock," "in today's world,"
   "boasts," "look no further." A reader smells it in one sentence and bounces. → §3, run the slop checker.
3. **Wrong length.** Too short = thin/spammy. Too long = bloated/off-intent. Both get demoted. → §2 the band.
4. **Wall of text, no skimmability.** No TL;DR, no bolded answers, no quick-facts strips, no visuals. →
   §7. Humans skim for the 1–2 facts they need; if they can't, they leave.
5. **No structure for the machine.** No schema, no internal links, no clean headings, keyword missing
   from the title/H1/first-100-words. → §6.
6. **Generic and gutless.** No opinion, no "when NOT to," no first-hand specifics, no personality. →
   The thing only you can write is the thing that ranks now. § 3 + §5.

**The discipline that prevents all six:** *run every gate, print every result on screen, fix every red,
re-run after every edit, and never declare done while anything is red.* That's it. That's the whole job.

---

## 1. ADAPT THIS FOR TRAVELPLUSCOST (read once, then the rest applies as-is)

Everything below is universal **except** these swaps. The *method* is identical; only the nouns change.

| Hawaii Picnics | → travelpluscost |
|---|---|
| Beach picnics on Oahu | A transparent **cost-plus OTA** — "what the hotel charges us, plus one small flat fee." |
| Monetize via Viator/Amazon affiliate + soft picnic CTA | **Monetize by internal-linking the post into your own money pages: the `/hotels/<city>` hubs and individual hotel pages** (the 274k programmatic pages). The blog's job is to *rank for a city/destination question and funnel the reader to your inventory.* |
| Content = Oahu travel guides | Content = **destination/cost guides that feed the hotel inventory**: "where to stay in `<city>`", "best area to stay in `<city>`", "`<city>` on a budget", "is `<city>` expensive", "`<neighborhood>` vs `<neighborhood>`", "when is `<city>` cheapest". Every post should name real cities/neighborhoods you have hotels for and link to those hubs. |
| Voice: plain, honest, dry-funny | **Same voice — and it's *more* on-brand here.** Your whole brand is anti-hype transparency, so plain + honest + specific *is* the product. Lean into "here's the real cost, here's when it's not worth it." |
| "When NOT to hire us" | "**When NOT to book / when another area is the better call.**" Honesty is the brand; say it. |

**🚨 travelpluscost COMPLIANCE — these override the voice and can get supply cut off if broken (from `docs/POSITIONING.md`):**
- **Never state the wholesale/net cost or a precise markup %.** Talk about *typical market prices* and *the principle* ("one small flat fee, same for everyone"), never the number that lets someone derive your net.
- **Claims must be *exactly* true** (FTC/NY deception). **Do not write "lowest price," "cheapest anywhere," "guaranteed best rate," "no dynamic pricing anywhere."** You control *your* fee, not the hotel's base rate. Hedge honestly: "transparent, flat-fee pricing," "the same price for everyone."
- **No fake scarcity or fake discounts** ("1 room left," "$120 off," "deal ends tonight"). Ever.
- **Only cite data you actually have.** No invented walk-times, ratings, distances, or occupancy.
- A blog post is marketing copy → the same deception rules apply. When in doubt, under-claim.

**Where things live on travelpluscost** (already built — use them, don't reinvent):
- Posts: `src/lib/posts.ts` + body in `src/lib/blogBody.ts`; rendered at `src/app/blog/[slug]/page.tsx`.
- **The gate scripts already exist** as `npm run blog:*` — the mapping is in §2.
- **There is already a ported `docs/blog-system/TheBible.md`** — this playbook is the field manual for it.
- Build gates: `npm run typecheck && npm run lint && npm run build` must all pass, plus the blog gates.

---

## 2. The non-negotiable gates — RUN, then PASTE the numbers every time

A post does not ship unless **every** gate is green. Run them, print the output **on screen**, fix reds,
**re-run after every edit batch** (every gate number shifts when you edit). Commands shown for both repos.

| Gate | Bar | Hawaii Picnics | travelpluscost |
|---|---|---|---|
| **SEO score** | **raw ≥ 90** (aim 92+) | `node scripts/serp-optimize.mjs "<kw>" --draft <slug> --urls "u1,u2,…"` | `npm run blog:serp -- "<kw>" --draft <slug> --urls "…"` |
| **AI-slop** | **0 HARD tells** (chase SOFTs) | `node scripts/ai-slop-check.mjs <slug>` | `npm run blog:slop -- <slug>` |
| **Length + thin sections** | **in the band**, every content H2 **≥ 250w** | `node scripts/post-stats.mjs` | `npm run blog:stats` |
| **Visual cadence** | **≥ 1 infographic / ~500w (HARD)** + ~1 vetted photo / ~500w (soft) | `post-stats.mjs` / `post-checklist.mjs` | `npm run blog:stats` / `blog:checklist` |
| **Checklist** | every row printed; **all AUTO pass** | `node scripts/post-checklist.mjs <slug> --kw "<kw>"` | `npm run blog:checklist -- <slug> --kw "<kw>"` |
| **Dehyphenate** | applied; machine tokens intact | `node scripts/dehyphenate.mjs <slug> --apply` | `npm run blog:dehyphenate -- <slug> --apply` |
| **Read-next (vector)** | post is in `related.json` | `node scripts/embed-related.mjs` | `npm run blog:related` |
| **Internal links / orphan** | INBOUND ≥ 1 | `node scripts/internal-link-audit.mjs --page <slug>` | `npm run blog:internal -- --page <slug>` |
| **External links** | all **curl-200** before they go in | `curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0" -L <url>` | same |
| **Freshness/accuracy** | perishable claims **verified at SOURCE** | `node scripts/freshness-audit.mjs --slug <slug>` | `npm run blog:freshness -- --slug <slug>` |
| **Build** | clean, route static | `npm run build` | `npm run typecheck && npm run lint && npm run build` |
| **Lighthouse** | **SEO 100 · A11y 100 · BP 100 · Perf ≥ 95\*** | serve + `npx lighthouse <url> …` | `npm run blog:lh -- <slug>` |
| **FINAL consolidated QA** | reads **SHIP-READY** (or EXEC-DECISION with numbers flagged) | `node scripts/qa.mjs <slug> --kw "<kw>" …` | `npm run blog:qa -- <slug> --kw "<kw>" …` |

> **\*Performance note:** posts with a third-party-CDN hero image (Unsplash) often top out ~84–90 on
> *localhost* — that's a structural LCP floor, not a defect, as long as SEO/A11y/Best-Practices are 100
> and CLS is ~0. Production CDN runs higher. If Perf misses 95 for that reason, **flag it as an
> EXEC-DECISION with the numbers** and compare it to your last shipped post — don't degrade vetted images
> chasing a localhost number you can't hit.

**The length band, explained (the #1 thing agents get wrong):** look at the top ~5–8 *genuine* competitor
articles (NOT Reddit/Wikipedia/TripAdvisor/YouTube/Yelp/big-news/booking-widgets — those skew it).
- **Floor = the competitor MEDIAN word count.** Never write below it.
- **Working target = median × 1.15.**
- **Ceiling = the longest *genuine* competitor.** A competitor ≥ 1.5× the median is an OUTLIER — **exclude
  it; match its coverage, not its length.**
- **Section count = working-target ÷ ~280** → ~6–9 H2 sections for a ~1,800-word target, not a fixed number.
- **Over the ceiling → TRIM/MERGE sections, never deepen.** Under the floor → fatten existing sections
  with real detail, never add thin ones. Land *inside* the band. (The `stats` script prints the band for you.)

---

## 3. The voice (this is what separates you from the slop)

**Write like a sharp, honest friend at a bar who actually knows the place — a little dry, never mean,
never trying to sell you something you don't need.** Plain words, real specifics, varied rhythm.

### Banned outright (AI tells — the slop checker fails on these; learn them so you never type them)
`unlock · leverage · seamless · world-class · elevate · elevated · curated · boasts · nestled · vibrant ·
bustling · breathtaking · stunning · hidden gem · must-see · must-visit · gem · oasis · paradise · haven ·
tucked away · look no further · dive in · embark · in today's (fast-paced) world · when it comes to ·
whether you're a … or a … · from … to … , there's something for everyone · it's worth noting that ·
in conclusion · furthermore · moreover · a testament to · rich tapestry · treasure trove · plethora ·
myriad · nestled between · picturesque · serene · tranquil · idyllic`
Plus **no exclamation marks, no emoji.** (Hawaii-specific extra-bans: "lush," "turquoise." For
travelpluscost, also avoid hype superlatives that breach compliance — see §1.)

### The rules
1. **Start with the answer, then add context.** Never tease ("keep reading to find out"); withholding the
   answer makes people pogo-stick back to Google.
2. **Use real numbers, never round, never invent.** A number you can't verify gets deleted, not guessed.
3. **Contractions always** (it's, you're, don't). It reads human and it's a free quality signal.
4. **Short paragraphs — max 3 sentences, favor 2–3.** One idea per paragraph. A wall of text is a bounce.
   (But don't write a wall of *one*-sentence lines either — that reads like a choppy listicle.)
5. **Active voice, subject first.** "Magic Island sits ten minutes away," not "It takes ten minutes to
   get to Magic Island."
6. **Positive / toward-framing.** Tell people what TO do, not what to avoid. The "when NOT to" honesty
   survives as **"do X when Y"** ("book the cheaper neighborhood when you're only sleeping there").
7. **Plain, high-school words — unless the fancier word is the ranking term.** Don't trade a keyword for a
   synonym; otherwise prefer the simple word.
8. **Tell people when NOT to.** The single biggest trust signal. Talk a reader out of the expensive option
   when a cheaper one does the job. (This *is* the travelpluscost brand.)

### Funny-first (write the joke INTO the fact, don't sprinkle quips on top)
Aim for **one genuine dry beat per major section** — a smile every ~200–300 words. The joke should *carry
the information*, not decorate it. **The test: does the line earn a nose-exhale, or is it just true?** A
true statement is not a joke — sharpen it (specific / absurd-but-true / stakes-inflation) or cut it.
Deadpan, no exclamation mark. Punch at clichés, weather, traffic, physics, yourself — **never at the
reader, the locals, or the culture.** Zero humour near anything somber.

*Sounds like:* "It keeps banker's hours, if the bank only opened on Saturday and shut before lunch." ·
"the lines run long enough to reconsider a few life choices on the way down." · "Cell service out there
has the reliability of a chocolate teapot." · (cost angle) "The 'resort fee' is the line item that turns
a $99 room into a $160 room while you're not looking."

---

## 4. The 12 forbidden corner-cuts — confirm you did NOT do each, every run

This list exists because these are the exact shortcuts that ship bad posts. Name each one and confirm.

1. **Stopping at 88–89 ("basically 90").** Loop the scorer's ADD list top-down until 92+.
2. **Wrong length, either direction.** Land in the band (§2). Section count = target ÷ ~280.
3. **Spot-checking the checklist.** Run *every* row; paste the full table.
4. **Running stats once, editing, then not re-running.** Every gate runs on the FINAL text. Re-run all.
5. **Inventing or rounding facts.** Verified or deleted. Years/prices/counts: source it or drop it.
6. **Humour as one quip in the intro.** A beat per section, written into the fact (§3).
7. **Writing without contractions.** Check your "it is"/"you are" count before shipping.
8. **An FAQ that re-answers the body.** FAQ = *leftover* long-tail questions only. Swap-test each one:
   if a section already answers it, replace it with a genuine new question.
9. **Accepting the first stock photo / skipping attribution.** **Visually inspect EVERY image** for
   quality + location accuracy before placing it (stock libraries mislabel constantly — a Kauai cliff
   tagged "Oahu," a generic city tagged as your city). Credit the photographer.
10. **Linking without curling.** Every external URL gets a `curl` 200 check *before* it goes in.
11. **Forgetting infographics are invisible to the SEO scorer.** Keep one entity-rich prose sentence
    beside every visual; never hit the visual quota with cards/maps alone.
12. **Declaring done with anything red.** A failing build never deploys; sub-90 never ships; a thin
    section is not green. If a gate genuinely can't clear, **STOP and report it with the numbers** — a
    committed-but-unpushed post is fine; a red live post is not.

---

## 5. The process, step by step

### 5.1 Pick the keyword (one per post, never reused)
- Pull from your keyword bank / calendar. Pick an **unused** primary keyword that is **winnable** (low
  difficulty) and has **real volume** and **clear intent**.
- **Cannibalization check by INTENT, not word-match.** A phrase appearing in another post does NOT block a
  new page. Block only when the new page would serve the **same search intent** as an existing page's
  primary target. If intents differ, **build the dedicated page AND demote the old page's incidental
  section to a short mention + an up-link to the new page** (hub-and-spoke). Log the keyword as used.
- *travelpluscost:* favor city/neighborhood/cost questions you have hotel inventory for, so the post can
  funnel to a real `/hotels/<city>` hub.

### 5.2 Research the live SERP (never skip — this replaces guessing)
- Search the keyword. Open the **top ~5–8 GENUINE competitors** (exclude Reddit/Wikipedia/TripAdvisor/
  YouTube/Yelp/big-news/booking-widgets — they skew the targets). Select by **intent**, not domain.
- Run the SERP scorer (`blog:serp` / `serp-optimize.mjs`) over those URLs. Read the brief: the **length
  band**, the **must-have subtopics**, the **terms/phrases** to include, the **People-Also-Ask questions**
  (FAQ seeds), and the **fact candidates** (the discrete numbers competitors cite that you must match).
- Mine Reddit/forums for the *real questions people ask* (intent), but don't try to out-rank them.
- **Find the gap:** the question everyone asks but nobody answers well (parking, real cost, timing,
  is-it-worth-it, which-is-better). That gap is your edge.

### 5.3 Plan structure + monetization together
- Map every section to a benefit-driven, keyword-bearing H2. One named entity per H3 in any roundup
  (the *heading* is the single biggest ranking lever — put the keyword phrases in headings).
- Plan the internal links to your money pages **while you outline**, not after. *travelpluscost:* which
  `/hotels/<city>` hubs and which neighborhoods this post will link to.

### 5.4 Draft — funny-first, answer-first, in the voice (§3)
- **Intro formula:** sentence 1 = the answer, with the primary keyword **verbatim** and the answer
  **phrase bolded**; within 50 words one dry hook (no tease); then what the post covers, who it's for, and
  a visible **"as of <year>"** freshness line.
- **Section unit:** benefit H2 → prose with a beat → H3 per entity → 2–3 sentences of real detail → a
  **quick-facts strip** (`**The move:** … · **Cost:** … · **When:** …`) or a small comparison visual.
- **TL;DR box** (every post): a **40–55-word, keyword-first** direct answer + **3–5 bold-led real
  takeaways**. It must NOT repeat the first paragraph (different words *and* angle).
- **FAQ** (4–8 Qs): *leftover* questions only, each answer 2–4 sentences opening with a **bold phrase**.
- **One opinion** (number-backed) and **at most one story** (true, adapted — omit if none fits). **Never
  invent a customer, a number, or an event.**
- Keep paragraphs to 3 sentences (1 for a punchline; never 4+). **Bold a few KEY WORDS for skimmers — NOT the whole answer sentence** (see the Style Bar above; whole-sentence bolds are banned).

### 5.5 Visuals (retention + skimmability)
- **≥ 1 native infographic per ~500 words (HARD count)** — comparison cards, a stat panel, a steps
  timeline, an X-vs-Y compare. Native HTML, not images, so the text stays real and crawlable. **Put the
  first one AFTER the first H2** (an infographic before the first H2 creates a heading-order a11y failure).
- **~1 vetted photo per ~500 words (soft — quality over count).** ONE cover photo, **visually inspected**:
  sharp, colourful, on-location, never B&W/generic/mislabeled. Descriptive alt + photographer credit on each.
- **Never duplicate the same facts in prose and a visual** — let the visual carry them, or keep them in prose.

### 5.6 Links + on-page SEO
- 3–5 **internal** links (to existing pages only — money pages first), descriptive anchors, never "click here".
- 2–3 **external** authority/primary-source links, **all curl-200**.
- Satisfy the full §6 checklist.

### 5.7 Run the gates → fix → re-run (the loop)
Run §2 top to bottom. Print every result. Fix every red. **Re-run after every edit batch.** When the
length and the score fight each other (common on multi-entity roundups), the sanctioned moves are
**MERGE/CUT sections** (when over the ceiling) or **rebalance words from a fat section into a thin one** —
**never pad past the ceiling.**

### 5.8 Freshness pass
Run the freshness audit. It over-flags ~half, so **verify every flagged number at its official/primary
source** before changing anything — then fix genuine drift, bump the modified date, and re-run.

### 5.9 Publish
Build clean + all gates green → write a one-page exec summary (keywords, length math, links, the gate
scores, voice/humour verdict, monetization notes) → **commit a focused commit** → **hold the push until
the owner says "go live."** After deploy: confirm the live URL + canonical, and request indexing in
Search Console.

---

## 6. On-page SEO checklist — every applicable item must pass

- **HEAD:** title 50–60 chars (keyword near the start, no brand suffix on blog posts) · meta description
  150–160 (keyword + benefit) · canonical URL · Open Graph (title/desc/image 1200×630/url/type) · Twitter
  card · `lang` · viewport · favicon · utf-8.
- **URL:** short slug < 60 · keyword in slug · hyphens only · lowercase · not shadowed by a redirect.
- **HEADINGS:** exactly one H1 with the keyword · logical H2→H3 (no skipped levels) · keyword phrases in
  H2s · no stuffing.
- **COPY:** keyword in the first 100 words + H1 + title · direct answer in the first paragraph · length in
  the band · short paragraphs · active voice · bold the answer phrases · lists where useful.
- **FAQ:** 4–8 questions (from PAA + leftover long-tail) · 2–4-sentence answers · **FAQPage JSON-LD**.
- **IMAGES:** descriptive alt + keyword · WebP · width/height attributes (zero CLS) · lazy-load below fold
  · a hero/social image.
- **INTERNAL:** 3–5 links · to money/related pages · descriptive anchors · breadcrumbs.
- **EXTERNAL:** 2–3 authority/primary links · relevant · new tab + `rel=noopener` · `rel=nofollow sponsored`
  on any affiliate/monetized link.
- **SCHEMA:** Article/BlogPosting · FAQPage · BreadcrumbList · Organization · Author/Person. **Do NOT add
  ItemList/HowTo/Review/AggregateRating to a blog post** (Google dropped the rich results / it risks a
  structured-data penalty).
- **E-E-A-T:** author byline + bio · published date · "last updated" · real stories/numbers/opinions ·
  cited sources.
- **ACCESSIBILITY:** semantic HTML5 · contrast WCAG AA · alt on all images · descriptive link text ·
  Lighthouse a11y 100.
- **MOBILE:** responsive · tap targets ≥ 48px · body ≥ 16px · no horizontal scroll · no interstitials.
- **LONG-FORM (1500+ words):** Table of Contents with anchor links · jump links per H2 · back-to-top.

---

## 7. The structure template (copy this skeleton)

```
[Cover image — inspected, alt + credit]

**<Answer with the primary keyword, the answer phrase bolded>.** <One dry hook, ≤50 words, no tease.>
<What this post covers, who it's for, "as of <year>" freshness line.>

## Table of contents
- [Section one](#section-one)
- … (one per H2)
- [FAQ](#faq)

## <Benefit-driven H2 with a keyword phrase>
**<Bolded answer phrase for this section.>** <2–3 sentences of real, specific detail with one dry beat.>
::infographic <key>            ← first visual goes AFTER this first H2 (a11y)
**The move:** … · **Cost:** … · **When:** …      ← quick-facts strip

### <Named entity (one H3 per item in a roundup)>
<2–3 sentences. A verdict, not a description. Anticipate the next question.>

… (repeat sections; ~280 words each; ≥1 infographic per ~500w; ~1 photo per ~500w) …

## Which one should you <pick/book>?     ← decision-helper + the one opinion (number-backed)
## What to know before you go            ← logistics, de-duped against any "prep" infographic
## FAQ
### <Leftover question 1>
**<Bold lead phrase.>** <2–4 sentence answer.>
… (4–8 questions, none re-answering the body) …
```

---

## 8. Worked example (model this exactly)

The "zipline oahu" post is a clean template: primary keyword `zipline oahu` (KD 25, vol 1,900); 5 genuine
competitors → band 1,520–2,200, landed 2,198w; **SEO score 91**; **0 HARD slop**; 6 content H2s (a
glance/overview + one H2 per operator + a decision section + FAQ); **4 native infographics** (a stat-panel
"by the numbers," a 4-operator comparison cards, a worth-the-drive compare, a prep steps) + 3 inspected
photos (one *rejected* because it was a Kauai cliff mislabeled "Oahu"); a quick-facts strip per operator;
one number-backed opinion ("book the course that fits where you're staying, not the longest line — 25–40
min vs 60–90 min"); no story (a 4-operator roundup, none fit, so omitted); 3 inbound backlinks; prices
**source-verified** against the operators' official pages (the freshness audit flagged 5; 2 were genuine
drift, fixed; 1 audit claim was itself wrong — *that's why you verify at source*). A dry beat per section
("the lines run long enough to reconsider a few life choices on the way down"). Everything printed,
committed, held for go-live. **Read it: `content/blog.ts` → slug `zipline-oahu`. Copy its shape.**

For travelpluscost, the equivalent is **"where to stay in `<city>`"**: a glance/overview, one H2 per
neighborhood (each linking to that area's hotels), a "best area for `<budget/families/nightlife>`"
decision section, a real-cost section ("what a night actually runs in `<city>`," compliant — typical
market ranges, never your net), and an FAQ — funneling throughout to your `/hotels/<city>` hubs.

---

## 9. The pre-publish ritual (read the rendered post on a phone, as a tired traveler)

1. Would a local who knows this place nod, or wince? (facts + vocabulary)
2. Did I smile at least once per ~300–500 words? (humour PRESENCE, not just slop-absence)
3. Does every section answer "so what should I actually do?" (verdicts, not descriptions)
4. Is the single most useful thing findable in 10 seconds? (TL;DR, bolds, strips, decision-helper)
5. First-screen test + one quotable line + a close that earns the next click?
6. Is every gate green AND printed, and the checklist pasted in full?
7. *(travelpluscost)* Did I make any claim that isn't exactly true, or reveal a net cost / markup? Kill it.
8. *(travelpluscost)* **CTA + relational pass** (`npm run blog:cta -- <slug>`, the marketing hat): does every
   section have a CTA, is every hotel I mentioned a card or a link to the *right* hotel, and **0 leaks** (no
   `::rail`/`::search`/link pointing at the wrong city — the directory is city-level)? Maximise the CTA; the
   script surfaces, *you* hand-curate. (Full rule: `References/InventoryPosts.md` §7.)

**If any answer is no, the run isn't done.** When it's all yes: commit, hold the push, and hand the owner
the status board (the gate scores), the full checklist table, the exec-summary path, and the held commit
hash. Then wait for **"go live."**
