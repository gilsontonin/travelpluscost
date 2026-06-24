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

---

## Suggested order
1. **Track C** (GA id + conversion events + a real endpoint) — instrument before you fuel.
2. **Track D** (socials) → wire `sameAs` (Track A) → strengthen the entity while the AI Overview is hot.
3. **Track G quick wins** (images.qualities, CWV) — so content ranks.
4. **Track E/F** (campaign + editorial) — now the traffic lands somewhere that converts and is measured.
