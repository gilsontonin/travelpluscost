---
name: internal-linking
description: >-
  Weave the whole site's pages together with genuine, natural-anchor internal
  links — blog posts AND service/money pages. First refreshes website-index.md so
  it lists every page, reads the index to understand what each page is about, then
  adds links between genuinely related pages (by meaning, not just matching words).
  Sends link equity toward money/service pages and related posts; keeps money pages'
  outbound links light so visitors stay focused on converting; uses a few natural
  words as the anchor (never "click here"); scales link count to length (~1 per 450
  words, a realistic ceiling — the corpus is already densely linked); skips links that
  already exist so it's safe to re-run after every publish;
  and guarantees no orphan pages (every page gets something linking to it). Use when
  the user says "internal linking", "link my pages", "interlink the site",
  "/internal-linking", or right after publishing a new post/page.
---

# Internal Linking — Hawaii Picnics & Beach Events

Builds and maintains the site's internal-link graph. It is **idempotent**: it only
adds links that are missing, so you run it again after every publish.

The job splits into a **mechanical half** (two scripts: refresh the index, audit the
link graph for budgets + orphans + candidates) and a **judgment half** (you read the
index summaries and the real page bodies, then add links only where pages are
*genuinely* related — meaning, not word-matching). The scripts tell you WHAT needs a
link; you decide WHICH links are real and write the natural anchors.

---

## The rules (all nine, non-negotiable)

1. **Refresh both indexes first.** Run `node scripts/gen-website-index.mjs` (the human index —
   `website-index.md`: title · url · type · 2-sentence summary · tags) AND, if posts changed
   since the last run, `node scripts/embed-related.mjs` (the **semantic index** —
   `content/related.json`, Gemini embeddings; needs `GEMINI_API_KEY` + billing). The audit reads
   both. If `related.json` is stale/absent the audit still works (it falls back to tag overlap).
2. **Link by meaning, not matching words.** The audit's candidate ranking is now **semantic** —
   `relatedness()` blends tag/island/category overlap with the Gemini-embedding cosine score, so
   genuinely-related pages surface even when they share little vocabulary or cross islands (e.g.
   Maui restaurants ↔ Oahu eats). It's still a *shortlist to judge*, not a list to obey: read the
   index **summaries** and confirm a reader on page A would genuinely want page B next — reject
   weak matches (e.g. a "what is poi" culture post does **not** need a "where to stay in Maui"
   link just because both are tagged an island).
3. **Send links toward money/service pages and related posts.** From a blog post, if a
   service page genuinely fits the intent (a beach picnic / proposal / elopement / small
   wedding / vow renewal / bachelorette / birthday / group picnic on Oahu), link it with a
   natural anchor. Also link 2–5 genuinely related **posts**. **Never** link to contact,
   home, or about — the system only ever creates `/blog/<slug>/` and `/services/<slug>/`
   links (those three are never in the page set, so just never hand-add them).
4. **Money/service pages keep outbound links light.** On a `service` page, link mainly to
   its **related sub-pages** (other relevant services) and **a couple of supporting posts**
   — no more. The audit caps service budget at ~4 for this reason. The goal is to keep the
   visitor on the conversion path, not send them off to read ten articles.
5. **Natural anchors, a few words, never "click here".** The anchor is 2–5 real words that
   describe the destination, woven into a sentence: `the [Road to Hana](/blog/road-to-hana-maui/)`,
   `our [where to stay in Maui](/blog/where-to-stay-in-maui/) guide`. Never "click here",
   "read more", "this post", or a bare URL. Prefer wrapping a phrase **already in the prose**;
   only add a short "read this next" clause when the topic isn't already mentioned.
6. **More links on longer pages, fewer on short ones — about 1 per 450 words (capped).** Use the
   audit's `budget`/`target` number as a ceiling, not a quota. The existing corpus is already
   densely linked (0 orphans, ~8 links/page), so most pages need nothing. **Quality over quota:**
   never insert an irrelevant link or a bare place-name → hub link just to hit the number —
   under-linking beats a forced link, every time.
7. **Skip links that already exist.** Never add a second link to a slug a page already links
   to (the audit prints `already links to:` and `outSlugs`; also grep the body to be sure).
   This is what makes re-running safe after every publish.
8. **Every page must have something linking to it.** Zero orphans. The audit lists every
   orphan with a suggested adopter — fix **all** of them each run by adding one inbound link
   from a genuinely related page.
9. **Don't change meaning, voice, or the gates.** You're adding links, not rewriting. Keep
   the house voice (no "click here", no "ultimate guide" filler — see `references/voice.md`).
   A link must never break the build or read as AI filler.

---

## Tools

| Tool | What it does |
|---|---|
| `node scripts/gen-website-index.mjs` | Rebuilds `website-index.md` from `content/blog.ts` + `content/services.ts`. Run first, every time. |
| `node scripts/internal-link-audit.mjs` | Global health: total links, **orphans (with suggested adopter)**, and **under-budget pages (with candidate targets)**. Read-only. |
| `node scripts/internal-link-audit.mjs --page <slug>` | Full work order for one page: budget, what it already links to, ranked **LINK OUT** candidates (money pages first), and inbound count / orphan status. Use this for the page you just published. |
| `node scripts/internal-link-audit.mjs --full` | Work order for every under-budget page (the whole backlog). |
| `scripts/lib/pages.mjs` | Shared parser (slug/type/words/tags/out-links/inbound). Both scripts import it; don't duplicate parsing. |

Links live in the markdown **`body`** of each object in `content/blog.ts` (Post[]) and
`content/services.ts` (Service[]). You insert links by editing those bodies.

---

## Workflow

### Step 1 — Refresh the index
```
node scripts/gen-website-index.mjs
```
Confirm the page counts look right (it prints `N services + M blog posts`).

### Step 2 — Pick the scope (mode)
- **After a publish (default):** wire in the new page both directions.
  `node scripts/internal-link-audit.mjs --page <new-slug>` → add its outbound links, then
  add inbound links to it from 2–3 related pages. Then run the global audit and fix any
  **orphans**. This is the common case and a small run.
- **Whole-site backlog (`--full` / "link everything"):** run `--full`, then work the
  under-budget list in **batches** (e.g. 10–15 pages per pass), committing as you go. It's
  idempotent, so a big site is brought up over several passes without ever double-linking.
- **One page (`--page <slug>`):** just that page's work order.

Always, in every mode: **fix every orphan** the global audit reports (rule 8).

### Step 3 — For each page in scope, add the genuine links
1. Open its **work order** (`--page <slug>`) and its **index entry** (summary + tags).
2. For each candidate target, read the candidate's **summary** in `website-index.md` and
   decide: is this genuinely the next thing this reader wants? Keep the real ones; drop the
   rest (rule 2). Bias toward a **money/service** link when one truly fits (rule 3), and 2–5
   related posts. For a **service** page, keep it to related services + 1–2 posts (rule 4).
3. For each kept target, **find a natural anchor in the body** (rule 5):
   - **Best:** a phrase already in the prose that names the destination's topic — wrap it.
     `Molokini` → `[Molokini snorkel](/blog/molokini/)`.
   - **Next best:** lightly reword an existing sentence so the anchor reads naturally, without
     changing its meaning.
   - **Last resort (only if genuinely useful and not already mentioned):** add one short
     clause at a natural spot — `For a base nearby, see our [where to stay in Maui](/blog/where-to-stay-in-maui/) guide.`
   - Skip if the slug is already linked from this page (rule 7). One link per destination per page.
   - Never wrap text that's already inside a link; never use "click here".
4. Insert with an `Edit` on the body. Respect the page's budget (rule 6) — stop when you've
   added the genuinely-related links, even if you're under target.

### Step 4 — Verify (the gate)
```
node scripts/gen-website-index.mjs            # index reflects any new pages
node scripts/internal-link-audit.mjs          # ORPHANS must be: none ✓
npm run build                                 # every route still ○/● Static, no errors
```
- **Orphans must be 0.** If any remain, add an inbound link and re-run.
- Build must be green. A broken link target (slug typo) will not fail the build but will
  410 in the index — double-check each new `/blog/<slug>/` or `/services/<slug>/` resolves
  to a real page (it's in `website-index.md`).
- Spot-read 2–3 edited paragraphs: do the anchors read naturally and keep the voice?

### Step 5 — Report + commit
Print a compact board: `pages touched`, `links added`, `orphans fixed (was N → 0)`,
`avg links/page before → after`, `build: pass`. Commit the content + the regenerated
`website-index.md` together. **Hold the push** until the owner says "go live" (each push
burns a Netlify build credit — repo convention).

---

## Anchor examples (copy the shape, not the words)

Good:
- `the [Road to Hana](/blog/road-to-hana-maui/) is the obvious day trip`
- `planning a beachfront ceremony? our [Oahu beach wedding packages](/services/hawaii-beach-wedding/) handle the permit`
- `pair it with [Molokini](/blog/molokini/) for the best south-shore snorkel`

Bad (never do these):
- `to learn more, [click here](/blog/molokini/)` — "click here"
- `[Read our ultimate guide to everything Maui](/blog/maui-itinerary/)` — filler/hype anchor
- `[Maui](/blog/maui-coast-hotel/)` then later `[Maui](/blog/where-to-stay-in-maui/)` — same anchor word, two targets, on one page
- linking `[contact us](/#contact)` or `[home](/)` — never (rule 3)

---

## Guardrails

- **Only ever add `/blog/<slug>/` and `/services/<slug>/` links.** Never add or remove the
  picnic CTAs (`/#packages`, `/#contact`) — those are managed by the page templates, not this skill.
- **Idempotent.** Re-running must add only missing links. If a run would add zero links and
  there are zero orphans, say so and stop — the graph is healthy.
- **One destination per page, max.** Don't stack multiple links to the same target in one page.
- **Don't touch prose meaning.** Adding a link (and at most a few connective words) is the
  whole edit. No rewriting sections, no new claims, no number changes.
- **Voice still applies.** Re-read `references/voice.md` "Tells that it's AI-written" — a link
  sentence that reads like SEO filler is worse than no link.
- **Big runs go in batches with commits**, so a failure never leaves the site half-linked.

**Done = index refreshed · genuine natural-anchor links added (toward money + related posts,
money pages kept light) · zero orphans · build green · committed (push held for "go live").**
