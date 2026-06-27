# Blog Structure

*Rewritten 2026-06-06 to reflect what this site's blog actually is and does. The previous
version described viral "funny blog" formats (quizzes, roasts, hyperbolic listicles, comment-bait)
that don't match this strategy and would break the brand voice. Those engagement *angles* that DO
translate are folded into §3.*

This is the structural reference. The **operational, step-by-step process** lives in the
`write-blog-post` skill; the **voice** lives in `references/voice.md` (+ `humour.md`, `stats.md`,
`stories.md`, `opinions.md`). On-page requirements: `on-page-seo.md` / `References/OnPageSEOCheckList.md`.

---

## 1. What our blog is (and isn't)

**Is:** SEO-first **informational travel guides** about Hawaii ("what is hula," "how to visit Iao
Valley," "best poke on Oahu"). Each post targets a real search keyword/cluster, answers the query
better than the current top results, and earns organic traffic that converts via **affiliates**
(Viator, Expedia, Amazon) and the **Oahu picnic service**.

**Isn't:** a personal/humor blog. No quizzes, roasts, comment-bait, exclamation-mark hype, or emoji.
There is **no comment section** — engagement = rankings, dwell time, and bookings, not comments.

**Voice (non-negotiable, see `voice.md`):** calm, direct, dry-witted, honest. Start with the answer.
Real numbers, never rounded. **One strong opinion per post** (from `opinions.md`, backed by a number).
**One story max** (from `stories.md`). Tell people when NOT to do/buy something — the biggest voice
tell. No AI-tell phrases, no exclamation marks, no emoji.

---

## 2. Standard post anatomy (every long-form post)

Target length: **within ~20% of the SERP top-3 for the keyword — NOT a fixed number.** Comprehensive
"things to do / guide" keywords run long (often 3,000+); thin monthly-search keywords are correctly
short (sometimes ~1,000–1,500). **Match the SERP; never pad to hit a count** (padding is an AI-tell).
Run `post-stats.mjs --target <median of the live top-3>`. **0 padded sections** — deepen a thin
section or cut/merge it; **paragraphs under ~700 chars** (≈150 words).

**Internal linking (bidirectional — do both):** (1) link OUT to 3–5 of the most relevant existing
posts/hubs; (2) when this post is the *better* answer for something an older post mentions, go **add a
backlink from that older post** to this one (and replace a now-weaker internal link target where the
new post fits better). This is how the topical web compounds — fresh posts strengthen old ones.

1. **Frontmatter / metadata**
   - `title` (keyword-first) + `seoTitle` (≤60 chars; blog posts carry NO brand suffix — the seoTitle IS the full SERP tag, so use the space for a keyword-first title + CTR hook)
   - `description` ≤160 chars · `excerpt` · `date`/`dateModified` · `author` · `category` · `icon`
   - `coverImage` (800×500, webp, alt, width/height)
   - `tldr` (see below) · `tours` (Viator codes for the cards)

2. **TL;DR box** — auto-rendered above the prose. `answer` (~40–55 words, keyword-first, snippet-style)
   + 3–5 **bold-led** `points`. This is the featured-snippet play.

3. **Intro (≈3 short paragraphs)** — **answer the query in the first sentence**; primary keyword in
   the first ~100 words; then the "here's the catch / what this covers" context. No long wind-up.

4. **Table of contents** — bullet list of anchor links to every H2.

5. **Body: 8–10 H2 sections** (H3 where useful), sorted by what the reader actually wants. Includes:
   - **One inline infographic** via `::infographic <key>` — native HTML/CSS (crawlable text, brand
     teal + gold), one of 5 kinds: `island-selector`, `season-timing`, `cards`, `steps`, `compare`.
     Mark the brand's recommendation with `pick: true` ("Our pick").
   - **One strong opinion**, backed by a number/fact (from `opinions.md`).
   - **A "when NOT to" / honest caveat** — managing expectations is core to the voice.
   - **Affiliate placement:** the hero `::tour <code>` after a *complete* paragraph (never inside a
     list) + the rest in a bottom block; Expedia (lodging) and Amazon (gear, tag `hawaiipicnics-20`)
     where genuinely relevant. All auto-get `rel="sponsored nofollow"`; FTC disclosure auto-fires.
   - **Images:** cover + ~3 in-body (Unsplash, webp, alt, width/height). **First in-body image is the
     LCP** → eager + `fetchpriority=high` + lightest file; the rest lazy. Credit line under each.

6. **FAQ section** — 6–7 real "People Also Ask" questions, concise answers. Renders **FAQPage** schema.

7. **Soft brand close** — one honest, low-key line about the Oahu picnic service (from $349 for two),
   only where it fits; never forced.

8. **Schema/SEO (auto):** BlogPosting + FAQPage + BreadcrumbList JSON-LD, canonical (www), OG/Twitter.

9. **Links:** 3–5 **internal** (existing destinations only — build the cluster) + 2–3 **external
   authority** (.gov/.edu/major). **Every external link must be verified 200** (curl) before
   shipping; URL-encode parentheses; avoid known bot-blockers (see the skill).

---

## 3. Engagement angles we DO use (adapted from the old doc)

The viral formats don't fit, but their underlying instincts do — translated into search-intent posts
in our voice:

- **A vs B → the decision post.** "Maui vs Kauai," "Kona vs Hilo," "cage vs cage-free shark dive,"
  "tour vs DIY." These are real high-volume keywords. Deliver an *honest, useful* verdict (often a
  `compare` infographic with a clear pick) — not "overdramatic winner." Readers searching a
  comparison want a confident recommendation; give one.
- **Expectation vs reality → honest myth-busting.** "Is X worth it?", "manage your rainbow
  expectations," "Waikiki nightlife isn't Vegas — and that's the point." This is the most natural fit:
  our whole edge is telling the truth where other guides oversell. It's the same relatability as the
  old "expectation vs reality" format, minus the self-deprecation gimmick.
- **Hot take → the one strong opinion.** Exactly the "unpopular opinion" idea, but **one per post,
  backed by a number**, in a calm register (e.g., "the $10 diner loco moco beats the $26 gourmet
  one"). From `opinions.md`.

**What we deliberately DON'T borrow:** quizzes/roasts (no comment section, wrong medium),
exclamation-mark/emoji hype (violates `voice.md`), comment-bait CTAs, and "two ordinary things with
exaggerated drama" for its own sake (we only compare things people actually search to decide between).

The target reaction isn't "I need to comment" — it's **"this is the most honest, useful guide I've
found, and I'm going to book/come back."**

---

## 3a. Hawaiian spelling (ASCII main text + first-mention parens)

Almost no one — including most Hawaiians writing online — uses ʻokina and macrons in running text, and
they hurt readability and SEO. So:

- **Main text = plain ASCII.** No macrons (`ā→a`), drop the ʻokina: write **Iao, Lanai, Kaanapali,
  Puu, Kilauea, Haleakala, Waikiki, Hawaii** — not ʻĪao, Lānaʻi, Hawaiʻi.
- **No apostrophe by default** (we write **Hawaii**, matching the brand name). A regular `'` is allowed
  only *sparingly* (e.g. Hawai'i) — we generally don't use it.
- **First mention of a term that has diacritics → give the proper Hawaiian spelling in parentheses,
  once:** e.g. `Iao (ʻĪao) Valley`, `Haleakala (Haleakalā)`, `Olelo (ʻŌlelo) Hawaii`. ASCII only after.
- **Headings, ToC, image alt, meta, and infographic data stay ASCII-only** (no parens — keeps heading
  ids / ToC anchors stable).
- Enforced by `scripts/ai-slop-check.mjs`: any diacritic **outside** parentheses fails the check.

## 4. Before shipping (gates)

Build passes · every route `○ (Static)` · Lighthouse ≥ 95 / 100 / 100 / 100 · 0 thin sections ·
paragraphs <700 chars · meta ≤160 · title ≤60 · external links all 200 · JSON-LD present ·
**`node scripts/ai-slop-check.mjs <slug>` clean (0 HARD tells, 0 diacritics outside parens),** and
re-read for AI-tells (`DanKennedyVoice.md` / `Humour.md`) and delete anything that matches.
