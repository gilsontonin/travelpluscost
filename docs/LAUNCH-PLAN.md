# Launch plan — deliverables to knock out

_Goal: tighten every corner (especially how we look in Google) → then drive editorial content + a
marketing campaign + social. Ordered by impact × effort. Check items off as we ship._

## Where we are (validation, 2026-06-23)
- Google indexing dozens of hotel/city pages; titles like "Hotels in {city} from $X | 2026 Prices…".
- **AI Overview describes our model verbatim** ("direct property rate plus a small, flat fee… eliminates
  variable markups… honest pricing for all users"). The positioning lands.
- City hubs rebuilt to an Expedia+Trivago hybrid (inventory-first, priced, themed rails, Viator, badges,
  deep interlinking). Sitemap clean (~70k real URLs) at `/sitemap-v3.xml`.
- **Risk:** brand confusion with Transat's "TravelPlus" (travelplus.ca) — addressed by entity SEO below.

---

## Track A — SERP / "look professional in Google"  ← mostly shipped
- [x] Organization + WebSite + SearchAction schema (entity, sitelinks search box, disambiguation)
- [x] Coral "+" brand mark: favicon (icon.svg) + logo.svg + apple-icon + web manifest
- [x] Default OpenGraph image (wordmark + promise) via next/og
- [ ] **Set `NEXT_PUBLIC_GSC_VERIFICATION`** in Netlify (cleaner than file verification) — 2 min
- [ ] Add `sameAs` to Organization once socials exist (Track D)
- [ ] Per-page `Offer`/price schema on property + city hubs (surfaces "from $X" in results) — ties to a
      server price-at-render; do alongside Track C
- [ ] Validate Hotel / BreadcrumbList / FAQPage / ItemList in Google's Rich Results Test (manual, 15 min)

## Track B — Brand & design
- [ ] Decide: keep the generated "+" wordmark, or commission a real logo (the "+" mark is launch-fine)
- [ ] Per-template OG images (city hub → "Hotels in {city} from $X", property → hotel photo) — richer shares
- [ ] One-page brand sheet (color #ff385c, wordmark, voice) so campaign assets stay consistent

## Track C — Measurement & funnel  ← do BEFORE scaling content
- [ ] **Set `NEXT_PUBLIC_GA_ID`** (GA4) in Netlify — analytics is wired but a no-op until set
- [ ] **Conversion events** (view → reserve → partner hand-off) so content ROI is measurable
- [ ] Make the booking endpoint real: affiliate hand-off (no liability) or sandbox booking — today it's a
      `TPC-DEMO`. Every content visitor currently hits a dead end.
- [ ] GA → "key events" + a simple weekly dashboard (which cities/posts convert)

## Track D — Social accounts (then wire `sameAs`)
- [ ] Create: **YouTube** (build-in-public), X, Instagram, LinkedIn, TikTok — same handle/avatar (the "+" mark)
- [ ] Drop the URLs to me → I add `sameAs` to Organization (strengthens the entity + knowledge panel)

## Track E — Marketing campaign
- [ ] Build-in-public videos (the "anti-surveillance-pricing OTA" story; the AI Overview is a great hook)
- [ ] Launch assets: OG cards, short demos of the honest-price flow, before/after vs an OTA's hidden fees
- [ ] Land each video/post on a real page (city hub or property) — not the homepage

## Track F — Editorial content (the blogs you want to start)
- [ ] City guides / "best area to stay in {city}" — but **only real data** (no invented neighborhoods/
      walk-times). Pair with the city hubs we built; this is where amenity data (deferred Hybrid 4) unlocks
      "pool/spa hotels in {city}" angles.
- [ ] Comparison/explainer posts ("how hotel pricing actually works", "why the price changes by device") —
      on-brand, links to inventory, hard for OTAs to write honestly.

## Track G — Technical hardening
- [ ] Fix `next/image` `images.qualities` warning (whitelist 65) — 2-line config
- [ ] Core Web Vitals pass (LCP on hub hero image, lazy maps) — so content ranks
- [ ] Bring state hubs / browse / property to the new city-hub bar (consistency)
- [ ] Edge/empty/error states: thin cities, no-availability, bad slugs, 404s

## Track H — Google Hotels / metasearch distribution  ← OWNER HIGH INTEREST
**Why it may be our #1 channel:** Free Booking Links put our live prices straight into Google's hotel
panel (Search/Maps) — high-intent, transactional traffic on *day one of approval*, skipping the 9–18-month
SEO ramp. Brand-perfect fit: Google polices "price accuracy" (shown price must equal landing price) and
suspends sites that fail it; we **never vary prices**, so we structurally can't trip it. Pays off most
*after* member (below-SSP) pricing exists — then we show a genuinely lower number than the incumbents in
the exact comparison surface and win the click. At today's SSP-parity it gets us *listed*, not *cheaper*.

**How it works (LiteAPI ref, 2026-06-23):** Google **pulls, never push** — it polls an HTTPS `POST /query`
XML endpoint *we host* (~3–6 s deadline). We translate its XML → LiteAPI `POST /hotels/rates` → select a
rate → enrich room data → return GHC XML. Plus a property-feed CSV (id, name, address, lat/lng, phone,
stars) — we already have all 66k rows in Supabase to generate it.

**LiteAPI provides:** rates (`/hotels/rates`, `mappedRoomId`). **We build:** GHC account + property feed,
the XML query endpoint (**a dedicated always-on service, NOT a Netlify function** — 3–6 s latency + QPS),
a room-metadata datastore, aggressive caching, and the post-click deep-link into `/book`.

**The two gates — resolve BEFORE building (neither is our code):**
- [ ] **Google access** — a new, low-volume OTA needs a Hotel Center account with Pricing API / Free
      Booking Links enabled, "via Google partner contact." Often needs sponsorship + a site review (a
      working checkout is a prerequisite — we now have one). **Action: email LiteAPI — do you sponsor/
      enable GHC access for partners, or do we apply to Google directly? Is there a managed GHC option?**
- [ ] **Poll-cost economics** — Google polls speculatively (many properties × dates); LiteAPI calls are
      not free. Confirm LiteAPI per-call price + design caching so cost-per-poll ≪ conversion.

**Verdict:** realistic and arguably our highest-leverage distribution bet — gated on Google approval +
cost math, not on our engineering. Pilot cheap first (the access email → a Free-Booking-Links-only test),
then build the endpoint, ideally after member pricing lands.

---

## Suggested order
0. **Track H gate (now, ~one email):** ask LiteAPI about Google Hotel Center / Free Booking Links access.
   It's the highest-leverage channel — if it opens up, it reorders everything below.
1. **Track C** (GA id + conversion events) — instrument before you fuel. _(Booking endpoint is already
   live — see PRICING.md §7; the old "TPC-DEMO dead end" note here is stale.)_
2. **Track D** (socials) → wire `sameAs` (Track A) → strengthen the entity while the AI Overview is hot.
3. **Track G quick wins** (images.qualities, CWV) — so content ranks.
4. **Track E/F** (campaign + editorial) — now the traffic lands somewhere that converts and is measured.
