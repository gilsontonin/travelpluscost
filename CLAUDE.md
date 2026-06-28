# travelpluscost — agent onboarding (read this first)

You are working on **travelpluscost**: a transparent **cost-plus** online travel agency. The promise:
*"what the hotel charges us, plus one small flat fee — the same price for everyone, never based on your
data."* It's the anti–surveillance-pricing OTA. Build-in-public (YouTube) showcase + SEO experiment +
eventual revenue.

## Read these before doing anything
- `docs/HANDOFF.md` — **current state, file map, what's real vs demo, what's next.** Start here.
- `docs/POSITIONING.md` — the brand promise + **hard pricing/compliance guardrails** (non-negotiable).
- `docs/BUSINESS-PLAN.md` — model, economics, payment decision, roadmap, exit.
- `docs/ARCHITECTURE.md` — the multi-vertical technical design (hotels→flights→cars→attractions).

## Hard rules (from POSITIONING.md — do not violate)
1. **Never display the wholesale/net cost, nor a precise fixed markup %** (final price + exact % =
   derivable net = a parity breach that gets our supply cut off). Show the *principle*, not the number.
2. **Pricing must be deterministic** (`cost × multiplier`) and **never personalized / never A/B-tested.**
3. **Public pages show the Suggested Selling Price (SSP)**; below-SSP cost-plus pricing only ever goes
   behind a free member sign-in (LiteAPI permits below-SSP behind a login). Booking that takes payment
   = merchant-of-record = Seller-of-Travel + legal — that's a later, flagged phase.
4. Claims must be **exactly true** (FTC/NY deception risk). Don't overclaim "lowest price" / "no dynamic
   pricing anywhere" — we control *our* fee, not the hotel's base rate.

## Writing a blog post — MANDATORY
When asked to write or edit ANY blog post, BEFORE writing a word:
1. Read `docs/blog-system/BLOG-PLAYBOOK.md` and `docs/blog-system/TheBible.md` and follow them top to
   bottom. (The playbook is the governing writing + QA/QC contract; do not free-write, do not skip steps.)
1b. BEFORE writing: **STEP 1 — scan the top 3** (`npm run blog:scan` + `blog:serp` → TARGET SPEC + ★gaps),
   then **STEP 2 — facet-driven research** (`References/ResearchBrief.md`: 10–30 facets scaled by keyword
   depth → `scripts/blog/research-brief-<slug>.md`; write FROM the brief, not the top-3 echo).
2. Run the gates and PRINT them on screen: `npm run blog:serp`, `blog:slop`, `blog:stats`,
   `blog:checklist`, `blog:lh`, `blog:freshness`, then `blog:qa`. Fix every red, re-run after every edit.
   (`blog:lh` = Lighthouse budget perf ≥ 90 / a11y, BP, SEO = 100; needs a running server — see
   `docs/blog-system/References/Lighthouse.md`. **Every image goes through `next/image`, never a raw
   `<img>`; the hero cover uses `priority`** — a raw cover was the LCP-77 bug.)
3. Honor POSITIONING.md compliance in the copy (never reveal net cost / markup %; claims exactly true; no
   fake scarcity).
4. Never ship red. Commit, then HOLD the push until I say "go live."

## Tech stack
Next.js 16 (App Router, SSR+ISR) · React 19 · Tailwind v4 · TypeScript. Planned scale infra (not yet
wired): Supabase (Postgres), Typesense (search), Upstash Redis (rate cache). Data today: **LiteAPI**
(hotels) via `src/lib/liteapi.ts` + `src/lib/hotels.ts`.

## Running it
```bash
export PATH="$HOME/.local/node/bin:$PATH"   # node lives here, not system-wide
cd /Users/gilsontonin/travelpluscost
cp .env.example .env.local                  # then add real keys (see HANDOFF.md)
npm install
npm run dev                                 # http://localhost:3000
```
Gates before every commit: `npm run typecheck && npm run lint && npm run build` (all must pass).

## Conventions
- Secrets only in `.env.local` (gitignored). Server secrets via `src/lib/env.ts` `requireEnv()` — never
  `NEXT_PUBLIC_*`. Only search-only keys may reach the browser.
- Feature flags in `src/lib/flags.ts` (`NEXT_PUBLIC_BOOKING_MODE`, `…_FLIGHTS_ENABLED`).
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Remote: `git@github.com:gilsontonin/travelpluscost` (push via `GIT_SSH_COMMAND='ssh -p 443 -o
  Hostname=ssh.github.com -o StrictHostKeyChecking=accept-new' git push origin main`). Auto-deploys to
  Netlify (travelpluscost.com) on push. See `docs/DEPLOY.md`.

## Design principles (the owner repeats these — honor them on every change)
1. **Valuable real estate.** The top of every screen is the most valuable space — spend it on inventory,
   not chrome. Shortest path to *see properties and click them*. Collapse anything the user already acted
   on (search inputs → a one-line summary), cut banners/headings, keep controls compact (e.g. filters are
   ONE horizontally-slidable chip row, never wrapping to multiple lines). This is *why* OTAs convert.
2. **Copy Expedia's patterns exactly** when given a screenshot — match layout/proportions, not a loose
   approximation. (Search card = 1 tall main photo + 2 small under, content right. Property page = full-
   width hero carousel with dots + photo-count + back/share.) But never copy fake **discounts/scarcity**
   ("$X off", "1 left at this price") — those violate POSITIONING.md.
3. **Only show data we actually have** (real LiteAPI fields). No faked walk-times, ratings, or urgency.

## Adding a new market (region) — plug-and-play
The app is region-generalized. To add a market (e.g. Maui):
1. Add a region to `REGIONS` in `scripts/ingest.mjs` (`island`, `countryCode`, `cities`), then
   `node scripts/ingest.mjs <slug>` → writes `content/<slug>.json`.
2. Add a `Region` entry in `src/lib/regions.ts` (slug, name = the `island` value, terms, center, anchor,
   landmarks) and import the JSON into `DATASETS` in `src/lib/hotels.ts`.
That's it — search, map, rails, distances, FAQ all read from the region registry; no other code changes.
(`src/lib/oahu.ts` is a back-compat shim re-exporting `hotels.ts`.) At thousands of hotels, swap the flat
JSON store for Postgres + Typesense — see `docs/ARCHITECTURE.md`.

## Current state (one line)
Hotels search + property pages + map + a safe demo booking flow are LIVE on real LiteAPI data (Airbnb-coral
Expedia-style UI). Oahu is the only ingested market, but the app is region-generalized (see "Adding a new
market") so the next location is just an ingest run + a registry entry. **Details: `docs/HANDOFF.md`.**
