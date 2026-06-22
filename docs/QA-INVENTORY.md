# travelpluscost — QA / optimization inventory

Page-by-page audit. `[AUTO]` = fixable in code without a product decision · `[QA]` = needs your
eye/decision · `[PERF]` = speed. Severity: 🔴 broken · 🟡 UX · 🟢 polish/perf.

## Shared chrome (every page)
- ✅ 🔴 Header sticky "Search hotels" CTA + "Hotels" nav were hardcoded to `/search?destination=Oahu` — now point to `/search` (real search entry). **FIXED**
- ✅ 🔴 Footer had 12 dead `href="#"` links — live ones wired (Hotels→/search, Flights/Cars/Attractions→their pages, About→/#about, How pricing works→/#how); not-yet pages (Press, Careers, Help Center, Contact, Trust & Safety, Privacy) render as muted text (no dead links). **FIXED**
- ✅ 🔴 Header "How pricing works" (`/#how`) + "About" (`/#about`) pointed at missing anchors — added `#how` (home hero) + `#about` (footer blurb). **FIXED**
- ⬜ 🟡 `[QA]` Build real pages for the muted footer items (Press, Careers, Help Center, Contact, **Privacy**, Trust & Safety). Privacy/Contact matter for a real launch.

## Home (`/`)
- ✅ 🟡 `#how` anchor added (hero). 
- ⬜ 🟢 `[QA]` Consider a dedicated "How pricing works" section (3-step) rather than scrolling to the hero.

## Search (`/search`)
- ✅ 🟢 Real-hotels-only filter, review-weighted ranking, prefill on re-search, 6s price timeout. **FIXED this session**
- ⬜ 🟢 `[PERF]` City lookup is an `ilike` scan (~2s under load). Add a trigram index — run once in Supabase SQL editor:
  ```sql
  create index if not exists hotels_city_trgm on public.hotels using gin (city gin_trgm_ops);
  ```
- ⬜ 🟡 `[AUTO]` Fetch prices for the **visible** results first (currently all ~50 at once).

## Hotel (`/hotel/[id]`) — JIT/ISR
- ✅ 🟡 No-date default changed to **tomorrow, 1 night** ("from $X" near-term). **FIXED**
- ✅ 🟢 "Good to know" no longer shows empty "—" cells; section hides if no facts. **FIXED**
- ✅ 🟢 Photo swipe no longer flashes white (neighbor preload); gallery lightbox keeps one fixed box. **FIXED this session**
- ⬜ 🟡 `[AUTO]` "Other places to stay nearby" is empty for non-curated cities — wire it to the directory's `hotelsNear` (geo).
- ⬜ 🟢 `[QA]` Label the no-date price clearly as "from $X · 1 night" so it reads as a starting price.

## Book / Confirm / Cancel
- ✅ Booking idempotency key; self-serve cancel flow (verified).
- ⬜ 🟡 `[QA]` No confirmation **email** is sent (Resend) — operational, flagged earlier as "later".
- ⬜ 🟡 `[QA]` Confirmation page has no support contact — add once a support email exists.

## Coming-soon (`/flights`, `/cars`, `/things-to-do`) & `/compare`
- ✅ Render correctly; no dead buttons.

## Cross-cutting
- ⬜ 🟢 `[QA]` Add **GA4 + Google Search Console** (the SEO experiment needs instrumentation).
- ⬜ 🟢 `[PERF]` At traffic, move the rate cache to Upstash Redis (shared across instances).
- ⬜ 🟡 `[QA]` Rotate the Supabase secret key (was pasted in chat during setup).
- ⬜ 🟢 `[QA]` Sitemap + per-city landing pages (the SEO surface for the directory).
