# HANDOFF — current state & next steps

_Last updated: 2026-06-23. Living state doc — update as you work._

## TL;DR
A real, SEO-rich hotel site on live **LiteAPI** data, Airbnb-coral Expedia-style UI. **Google is indexing
it and an AI Overview already describes the cost-plus model verbatim.** Search → city hubs → property →
(demo) booking all work. Booking is still a **safe demo / affiliate-default** (no real charge yet —
merchant/cost-plus is a later phase). Deploys to **travelpluscost.com** (Netlify) on push to `main`.

## What's live (real)
- **Home / search / property** — live LiteAPI data, all-in SSP prices, Expedia-style cards (`HotelRow`),
  filters, list⇄map (`ResultsList` + `MapResults`).
- **Hub system** (rebuilt this session, Expedia+Trivago hybrid, mobile-first):
  - `/hotels` browse index → `/destinations/<state>` (51 state hubs) → `/hotels/<city>` (city hubs) →
    `/hotels/<city>/<slug>` (property). Dense internal-link graph; breadcrumbs + schema throughout.
  - **City hub** is the polished template: from-$X hook, "Check prices for these dates" chips,
    relevance chips, priced cards (lazy `/api/prices`, tomorrow-night) with **Popular badges** + **save
    hearts**, sticky "View map" bar, themed rails (Luxury/Resorts/Most-reviewed), **Things to do**
    (Viator), per-city FAQ, and "More hotels / same-state / Popular destinations" link clusters.
- **Brand / SEO**: `Organization`+`WebSite`+`SearchAction` JSON-LD, coral "+" favicon/logo/OG image,
  **/about** manifesto (mission/vision/values + anti-gimmick), `/disclosure` (how-we-make-money),
  privacy/terms. Sitemap is **`/sitemap-v3.xml`** (versioned tree: pages + cities + hotel shards, all
  under `/sitemaps/v3/`); robots advertises it.
- **Directory**: Supabase `hotels` = **66,235 real US hotels** (rentals purged — see git history).

## What's demo / not wired (be honest)
- **Booking doesn't charge or reserve.** `bookingMode` defaults to `affiliate`; the flow ends on a
  `TPC-DEMO` confirmation. Real revenue path (affiliate hand-off or sandbox→merchant) is **Track C** of
  `docs/LAUNCH-PLAN.md` and the #1 thing before scaling content.
- **Cost-plus member pricing** (below-SSP behind login — the differentiator) is **not built** (merchant
  phase). Public shows SSP only.
- **Amenity sections** ("pool/spa hotels in {city}") — script + schema committed
  (`scripts/enrich-amenities.mjs`), run **deferred** (needs the 2-line SQL + ~66k LiteAPI calls).

## Needs the OWNER (I can't)
- Netlify env: set **`NEXT_PUBLIC_GA_ID`** (GA4) + **`NEXT_PUBLIC_GSC_VERIFICATION`** — both wired, no-op until set.
- **Create social accounts** (YouTube/X/IG/LinkedIn, "+" avatar) → send URLs → I add `sameAs`.
- Run the amenity column SQL in Supabase if/when you want Hybrid 4.
- Logo: the generated "+" wordmark is launch-fine; commission a designed one later if wanted.

## Docs map
`POSITIONING` (guardrails) · `BRAND-STRATEGY` (transparency moat, Charter, content, monetization) ·
`LAUNCH-PLAN` (prioritized deliverables, 7 tracks) · `REFERENCE-SPECS` (Expedia/Trivago blueprints +
the shoot loop) · `ARCHITECTURE` · `DEPLOY` · `HANDOFF` (this).

## Design / verify loop
- `npm run shoot` / `npm run shoot:local` — iPhone-13 profile, fold+full screenshots → `design/shots/`
  (gitignored). `SHOOT_BASE` switches prod vs local dev. ffmpeg (miniconda) extracts frames from
  reference videos into `design/refs/` (gitignored — third-party IP, never committed).

## Next steps (priority)
1. **Funnel + measurement** (LAUNCH-PLAN Track C) — GA id, conversion events, a real booking endpoint.
2. **Brand-first content** (BRAND-STRATEGY §3): the Charter page, "test it yourself" demo, and **real
   researched SEO blogs/videos on the transparency topic itself** — BEFORE generic "things to do in X".
3. **Socials** → wire `sameAs`. Then tech CWV pass. Then scale destination content.

## Gotchas
- **Run `npm run lint` BEFORE committing** — eslint errors fail the Netlify `next build` (the deploy
  keeps the old version). Watch `react/no-unescaped-entities` (use curly `’ “ ”`) + `react-hooks/refs`.
- Node: `export PATH="$HOME/.local/node/bin:$PATH"`. `searchParams`/`params` are Promises (await them).
- Sitemap cache-busting: bump `SITEMAP_VERSION` in `scripts/gen-sitemaps.mjs` (v3→v4) to rotate the whole
  tree to fresh URLs at once when GSC clings to a stale read.
