# Operations runbook

How this site runs day to day. New here? Read `TEMPLATE.md` (architecture) and `References/Voice.md`
(how we write) first. This file is the *process*.

---

## The content pipeline (author up front, publish on a drip)

```
write-blog-post  →  content/drafts/<slug>.md          (authored + self-checked, NOT live)
        │                       │
        │              QUEUE.md (ordered, cadence)
        ▼                       ▼
                     publish-post  →  insert into blog.ts → QA gate → COMMIT → AUTO-GO-LIVE
```

1. **Write ahead.** `write-blog-post` picks an unused keyword (checked against `Keywords/Used_Keywords.md`
   + `content/drafts/QUEUE.md` so nothing cannibalizes), researches the SERP, drafts in voice, sources
   images, runs `npm`-level checks, and saves a self-contained draft to `content/drafts/<slug>.md`.
   It does **not** touch `blog.ts` or deploy.
2. **Queue.** Drafts are listed in `content/drafts/QUEUE.md` in publish order (cannibalization guard).
3. **Publish (1–2/day).** Say **"publish a blog post"** → `publish-post` takes the top draft,
   re-validates (SERP still valid, links 200, voice/SEO, `npm run check`), inserts it with **today's
   date**, logs the trackers, builds, and — if every QA gate is green — **commits and pushes live
   automatically** (the owner authorized auto-go-live for this flow, 2026-06). Edits the draft only on
   a real mismatch; may fold in a clearly-valuable new fact the SERP surfaced.

**Why drip, not dump:** no Google penalty for volume, but steady cadence = better crawl/indexing,
freshness signals, quality control, and the ability to watch what ranks and adapt. Build a buffer of
drafts; publish calmly.

## The QA gate (the safety net — machine, not discipline)

- `npm run check` runs on **every Netlify build** (`netlify.toml`). A red check **fails the deploy**;
  the last good version stays live. It covers: AI-slop + Hawaiian diacritics (all content + app),
  claims-integrity (no fake reviews/superlatives), structural HTML audit (img alt, internal links,
  canonical, JSON-LD).
- Run it locally before pushing anything: `npm run build && npm run check`.
- **Not in the gate** (run manually / monthly, to avoid third-party flakiness blocking deploys):
  `npm run check:links` (external 404s) and `npm run check:lh /path` (Lighthouse budget ≥90/100/100/100).

## Go-live rules

- **`publish-post` auto-goes-live** (publish = deploy) — *only* when all QA is green.
- **Everything else** (site edits, fixes, batches, reference changes) is **committed but held** until
  you say **"go live"** — then it's pushed. Reason: every push = one Netlify build credit; batch them.
- Non-deployed files (docs, references, scripts) can ride along with the next publish push.

## Trackers (keep these current)

| File | Purpose |
|---|---|
| `Keywords/Used_Keywords.md` | Every claimed primary keyword (no cannibalization). |
| `Keywords/RankTracker.md` | Watchlist of live posts + columns to log rank over time. |
| `Keywords/IndexingPriority.md` | Ordered list to request-index in Google Search Console (new posts to the top). |
| `content/drafts/QUEUE.md` | Draft publish order + status. |
| `exec-summaries/<slug>.md` | One per post — what shipped + the QA result. |
| `Keywords/ReviewLog.md` | Evergreen review queue + last-reviewed log (the `review-blog` skill). |

## Evergreen review (don't retrofit — maintain)

Rather than mass-fixing old posts, the **`review-blog`** skill reviews the **oldest un-reviewed
post per run** against current standards (SEO, Lighthouse, voice, visual cadence, brand, broken
links) and logs it in `Keywords/ReviewLog.md`. **Don't-touch-a-winner:** a post ranking top-3 is
SEO-frozen (technical fixes only); 4–10 = safe additive only; 11+/no-data = full review.
**Edit only on a real mismatch.** Rank data comes from GSC once wired (`scripts/gsc-rank.mjs`,
flagged TODO); until then it's manual / no-data = reviewable. Run it on a drip, like publishing.

## Routine cadence

- **Each publish:** request-index the new URL in GSC (`IndexingPriority.md` top), tick the trackers.
- **Weekly:** `npm run check:links` (catch link rot); skim GSC Performance for movers; publish from the queue.
- **Monthly:** `npm run check:lh` on a few key pages (CWV regressions); review `RankTracker` vs GSC; refill the draft buffer.

## Rollback (if a bad deploy slips through)

1. `git revert <bad-sha> && GIT_SSH_COMMAND='ssh -p 443 -o Hostname=ssh.github.com -o StrictHostKeyChecking=accept-new' git push origin main` — redeploys the prior good state, **or**
2. Netlify dashboard → Deploys → pick the last good deploy → **Publish deploy** (instant, no rebuild).
   Then fix forward.

## Secrets & access

- `.env` (git-ignored): `UNSPLASH_ACCESS_KEY` (50 req/hr demo tier), affiliate IDs/links, checkout/email keys.
- Deploys: GitHub `main` → Netlify (build credits are finite — that's why we batch non-publish pushes).
- SSH push uses port 443: `GIT_SSH_COMMAND='ssh -p 443 -o Hostname=ssh.github.com -o StrictHostKeyChecking=accept-new' git push origin main`.

## Affiliates (revenue, all FTC-disclosed automatically)

Three streams off one content engine, all `rel="sponsored nofollow"` + auto-disclosed:
- **In-post tours** — `::tour <code>` in blog/service bodies (Viator). Codes in `content/viatorTours.ts`.
- **Things to Do hub** (`/things-to-do/`) — curated Viator tours by island. Extend per `DESIGN.md`.
- **Where to Stay hub** (`/where-to-stay/`) — curated Expedia hotels by theme. Evergreen, **no API**:
  area affiliate links via `expediaArea` + optional per-property `url`; tiers not live prices; you
  earn on the click/cookie today (property links are a UX upgrade, not a payment requirement).
- Amazon (gear) via `tag` in `References/AffiliateLinks.md`. Hosts auto-get the rel + disclosure
  (`lib/markdown.ts` `AFFILIATE_HOSTS`). **Gap:** a rental-car affiliate (Discover Cars).

## Site structure & design (current)

- **Routes:** `/` · `/services/` (Experiences, money pages) · `/things-to-do/` · `/where-to-stay/` ·
  `/blog/` (labelled **Journal**; URLs stay `/blog/`) · `/services/[slug]` · `/blog/[slug]`.
  Nav (`content/site.ts`): Experiences · Things to Do · Where to Stay · Journal · Contact.
- **Brand:** **Hawaii Picnics & Beach Events** (NAP name — keep GBP + citations matching). "by Wember"
  is a sub-label. "Luxury" is dropped from brand voice (kept only as an SEO keyword in meta).
- **Design system:** see **`References/DESIGN.md`** — Figma editorial (mono + pastel color blocks,
  Inter/JetBrains Mono, pill CTAs, single magenta accent on the sticky CTA). Build any new page on it.
- **Global sticky CTA** (`StickyBook`) → `/services/` ("Plan your event," magenta) so visitors of any
  intent self-select an experience.
