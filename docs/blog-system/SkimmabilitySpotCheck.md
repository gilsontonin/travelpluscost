# The 2-Minute Spot-Check — read like a tired traveler on a phone

Owner-facing. Open any **live** post on your phone and tick these. It's not the full gate
(that's `node scripts/post-checklist.mjs <slug> --kw "<primary>"`, 30+ automated rows) — it's
the **visible engagement nudges**: the small, repeatable steps that make a reader feel good
while being informed. These are the things that have slipped, so these are what you watch.

Standard, in one line: **excellent dry-funny writing + relentless skimmability.** Information
while feeling good at the same time.

---

## First screen (before any scrolling)

- [ ] **Cover photo** is sharp, colourful, and obviously **on-location Hawaii** — not B&W, not generic stock, not the wrong place.
- [ ] **TL;DR box** is there, the answer **leads with the keyword**, and there are **3–5 bold-led bullets**.
- [ ] **Table of contents** is present and the links jump to the right section.

## Eye-direction — the bold (the one that slips most)

- [ ] The **answer to the headline question is bolded as ONE phrase** in the first paragraph (not a whole sentence).
- [ ] **Key answer phrases are bolded through the whole body** — at least one per section. *Skim only the bold text top to bottom; you should still get the gist.*
- [ ] **Every FAQ answer opens with a bolded phrase**, then goes clean.

## Visual rhythm — roughly one of EACH per ~500 words

- [ ] An **eye-catching infographic** lands about every 500 words (cards / stat-panel / compare / steps). No wall of text longer than ~2 screens without a visual break. *Infographics count on their own — photos don't cover for them.*
- [ ] A **nice photo** lands about every 500 words, each one sharp and actually the right place. *Soft target — quality beats count.*
- [ ] Any **X-vs-Y** ("farm tour vs factory tour", "buy vs skip") is shown as a **compare visual**, not buried in a paragraph.
- [ ] A **quick-facts strip** sits near each spot/item (a short bold-led line: *Cost · Time · Best for*, or *The move · When · Note*).

## Orientation & flow

- [ ] For a location post, a **"where is it" / directions** link sits near the top.
- [ ] A **"Read next"** block with related posts appears at the end.
- [ ] **3–5 in-body links** to other posts, each one sitting naturally in the sentence (contextual, not dumped in a list).

## The feel-good (voice)

- [ ] Reads **dry-funny** — a light beat or two per section, at least one line that made you smile.
- [ ] **Zero exclamation marks, zero emoji**, none of the AI-tell phrases ("unlock", "seamless", "treasure trove", "in today's fast-paced world").
- [ ] It **tells you when NOT to bother** somewhere — honest, not a sales pitch.

---

## Who picks what (so the spot-check makes sense)

Only **two** things in a post come from an API call. Everything else is authored by hand,
which is why you rarely see API calls fly by:

| Element | Picked by | API call? |
|---|---|---|
| **Infographic cards** (the content inside them) | **Authored by Claude** from the research + verified facts | No |
| **FAQ / People-Also-Ask questions** | **Authored by Claude** from reading the live SERP's PAA + competitor questions (the `paa-suggest.mjs` Gemini helper over-suggests ~80%, so it's grep-gated, not trusted) | Rarely / gated |
| **In-body links to other posts** | **Authored by Claude** — chosen to fit the sentence | No |
| **"Read next" / related posts** | **Gemini embeddings** (`gemini-embedding-001`) — every post is turned into a vector, nearest neighbours cached in `content/related.json`, top 3 shown. Semantic similarity, **not Google Search.** Runs in a **batch** (`scripts/embed-related.mjs`), not live per post — that's why you don't see the call each time. | Yes, batched |
| **Freshness / perishable facts** (prices, hours, fees) | **Gemini + Google Search grounding** (`freshness-audit.mjs`) | Yes, live per post |

So: cards, FAQ wording, and contextual links are **judgment, done by hand**. Read-next is
**math on meaning** (embeddings), not Google. The only live Google-grounded call per post is
the **freshness audit**. *Known weak spot: the embedder is geography-blind, so a Maui post can
surface an Oahu pineapple post — flag it if a "Read next" pick is the wrong island.*
