# travelpluscost — Framework Blueprint (the Expedia-parity template)

Goal: a **scalable, bug-free template** that recreates Expedia's UX as closely as possible, with
**hotels fully working** and **cars / flights / things-to-do (Viator) scaffolded** behind the same
framework so they slot in later by adding a provider + flipping a flag. Source of truth = the owner's
7.5-min mobile Expedia screen recording (frames in /tmp/exframes) + the captured screenshots.

Build philosophy: **vertical-agnostic core + provider adapters + feature modules.** Add a vertical =
add an adapter + a route, never a rewrite. Every feature is its own module so it can be built/tested in
isolation. Cost-plus pricing + the honesty brand (POSITIONING.md) sit on top of all of it.

---

## A. Feature inventory (from the recording) + status

Legend: ✅ done · 🔨 build now · 🧱 scaffold (stub + interface, fill later) · 🕒 later pass

### Search & results
- ✅ Search panel (destination, dates, guests) · ✅ result list (cards) · ✅ review badges · ✅ pagination
- ✅ Photo carousel in card (swipe/arrows/dots) · ✅ live cached prices
- 🔨 **Working filters** — price range, guest rating, star rating, amenities, property type, refundable
- 🔨 **Working sort** — Recommended, Price (low→high / high→low), Rating, Distance
- 🔨 **Vertical tabs** — Hotels (live) · Cars · Flights · Things to do (scaffold tabs/routes)
- 🧱 **Map view** toggle (list ↔ map with price pins)
- 🧱 **Date-range calendar** + guests/rooms popover (real picker, replaces native inputs)
- 🧱 Badges: "$X off" / strikethrough, "Reserve now, pay later", "VIP Access", "We have N left"

### Property page
- ✅ Gallery (lightbox) · ✅ choose-your-room (live rooms) · ✅ cost-plus promise · ✅ sticky mobile bar
- 🔨 **Highlights** (Loved by couples, great location…) · 🔨 **Popular amenities** grid + full list
- 🧱 **Reviews** — overall score, category breakdown, individual reviews
- 🧱 **Explore the area** — map + nearby landmarks with distances
- 🔨 **Policies** (check-in/out, important info) · 🧱 **You may also like** (similar hotels)
- 🧱 **Viator "things to do nearby"** package section (see §D)

### Checkout
- ✅ Guest form · ✅ payment-method selector · ✅ price-details box · ✅ confirmation
- 🧱 Price breakdown (taxes/fees lines), 🧱 "Protect your stay", 🧱 coupon — visual now, real in merchant phase
- 🕒 Real payment (LiteAPI Pay / Stripe) — merchant phase, needs Seller-of-Travel

### Account / cross-cutting
- 🧱 Sign in / account (ties to member-gate cost-plus pricing) · 🕒 real auth
- 🧱 Cars / Flights / Things-to-do landing + search (scaffold; real data later)

---

## B. Architecture (vertical-agnostic)

```
src/
  app/
    (search shell, shared)
    search/page.tsx            hotels results (live)
    hotel/[id]/page.tsx        hotel property (live, SSG)
    cars/ flights/ things-to-do/   vertical routes (scaffold pages now)
    book/  booking-confirmed/  checkout (shared across verticals later)
    api/ prices, rooms, (later) car-rates, flight-offers, viator
  lib/
    verticals.ts               Vertical enum + per-vertical config (label, icon, fee, enabled)
    providers/
      types.ts                 ProviderAdapter interface (search/details/rates/book)
      liteapi/  (hotels, live)
      duffel/   (flights+cars — stub adapter, flagged off)
      viator/   (things-to-do / packages — stub adapter)
    oahu.ts (content)  rates.ts (cached)  pricing.ts (cost-plus)  format.ts
    filters.ts                 filter + sort logic (pure, testable)
  components/
    search/  (SearchPanel, Tabs, FilterBar, FilterSheet, SortMenu, MapToggle, DateGuestPicker)
    results/ (ResultsList, HotelRow, CardCarousel, MapView)
    property/(PhotoGallery, Highlights, Amenities, Reviews, ExploreArea, RoomsPanel, SimilarHotels, ViatorPackages)
    checkout/(BookingForm, PriceDetails, ProtectStay)
    Header, Footer
```

**Provider adapter** (the seam): every vertical implements
`search() / getDetails() / getRates() / book?()`. Hotels = LiteAPI (live). Flights+Cars = Duffel (stub).
Things-to-do/packages = Viator (stub). Adding a vertical = new adapter + route + a `verticals.ts` row.

**Flags** (`lib/flags.ts`): `BOOKING_MODE`, and per-vertical `*_ENABLED` (cars/flights/things-to-do off
until their data lands; routes render a branded "coming soon" with the real layout behind the flag).

---

## C. Cars / Flights framework (scaffold now)

- `lib/verticals.ts` defines each vertical (label, icon, fee rule, enabled flag, search fields).
- `SearchPanel` tabs render all verticals; disabled ones link to a scaffold route.
- Routes `/cars`, `/flights`, `/things-to-do` exist now: same header/footer + search shell + a clear
  "Launching soon — built on the same engine" state. When `*_ENABLED=true` + adapter implemented, the
  real results render with **zero new plumbing** (Duffel does Flights + Cars on one integration).

## D. Viator packages inside hotels (scaffold now)

- `components/property/ViatorPackages.tsx` — a "Make it a trip — things to do nearby" section on the
  property page: cards (image, title, rating, duration, price, "Add to trip"). Data via a `viator`
  provider adapter (`getActivities(lat,lng)`), **stubbed now** (placeholder cards from the hotel's
  location) and swappable for the real Viator API later (we already harvested a Viator inventory format
  in the Hawaii project — reuse that shape).
- Later: a **bundle** flow (hotel + activities) → one cost-plus package price (parity-safe; bundles are
  opaque — see POSITIONING.md).

---

## E. Build phases (ordered; each commits + tests before next)

1. **Filters + sort (working)** — `lib/filters.ts` (pure) + FilterSheet/SortMenu UI wired to results.
2. **Vertical scaffold** — `verticals.ts`, tabs, `/cars` `/flights` `/things-to-do` routes (coming-soon).
3. **Property sections** — Highlights, Amenities grid, Policies (from local content) + ViatorPackages stub.
4. **Date/guest picker** — calendar range + guests popover (replaces native inputs).
5. **Reviews + Explore-the-area** — reviews UI (LiteAPI sentiment/reviews) + map with nearby points.
6. **Map view** — results map with price pins (list ↔ map toggle).
7. **Account/sign-in** scaffold → ties to member-gate cost-plus.
8. **Merchant checkout** (later) — real prebook→book→pay (sandbox first) + Seller-of-Travel.

Each phase: build → typecheck/lint/build green → test every affected route → commit → push.

---

## F. Invariants (never break)

- Content served from local store (instant); only rates/availability are live + cached.
- Cost-plus pricing is deterministic + non-personalized (POSITIONING.md guardrails).
- Every route renders fast (<300ms warm) and never 500s — graceful empty states everywhere.
- New vertical/feature = new module/adapter; the core search→results→detail→checkout flow is shared.
