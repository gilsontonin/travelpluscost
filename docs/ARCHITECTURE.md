# travelpluscost — Architecture

Goal: build once, add verticals (flights, cars, attractions) and geographies (US → world) **without a
rewrite.** The shape below is chosen so that adding a vertical = adding an *adapter + a few config
rows*, never a new app.

---

## Principles

1. **Vertical-agnostic core.** A bookable thing is a `Listing`. Hotel, flight, car, attraction are
   *types*; the provider is a *field*. The search/results/detail/booking pipeline doesn't care which.
2. **Provider adapters.** Every supplier (LiteAPI, Duffel, Viator) implements one interface. Swapping
   or adding a provider never touches the UI or the pricing engine.
3. **Pricing is one deterministic module.** `cost × multiplier`, auditable, no per-user variation. The
   cost-plus promise is enforced in code, not by discipline.
4. **Scale by data, not by code.** "Every location" = ingest more rows + generate pages
   programmatically. US and world are the same code path.
5. **SEO is a first-class constraint.** SSR + ISR, structured data, sharded sitemaps — never
   client-only rendering for indexable pages.
6. **Flags everywhere.** Booking mode (affiliate↔merchant) and each vertical toggle independently.

---

## Layers

```
┌─ UI (Next.js App Router, SSR+ISR) ──────────────────────────────┐
│  search · results · listing detail · the cost-plus booking card │
├─ Domain ────────────────────────────────────────────────────────┤
│  search service · pricing engine · booking service              │
├─ Provider adapters (one interface) ─────────────────────────────┤
│  liteapi (hotels) · duffel (flights, cars) · viator (attractions)│
├─ Data ──────────────────────────────────────────────────────────┤
│  Supabase/Postgres (content) · Typesense (search) · Upstash (cache)│
└──────────────────────────────────────────────────────────────────┘
```

---

## Data model (provider-agnostic)

```
Listing
  id, vertical ('hotel'|'flight'|'car'|'attraction'),
  provider ('liteapi'|'duffel'|'viator'), providerId,
  name, slug, description, images[], amenities[]/attributes(jsonb),
  geo { lat, lng, city, region, country }, rating, reviewCount,
  updatedAt
```

- One table, `vertical` discriminates. Vertical-specific fields live in a `jsonb attributes` column so
  we never migrate the schema to add a vertical.
- **Rates are NEVER stored** — they're live, per-date, per-occupancy. Fetched on demand, cached briefly.

---

## Provider adapter interface (the seam that makes verticals cheap)

```ts
interface ProviderAdapter {
  vertical: Vertical;
  ingest(params): AsyncIterable<Listing>;        // content → Postgres → Typesense
  getDetails(providerId): Promise<ListingDetail>;
  getRates(query): Promise<RateOption[]>;         // live price(s), provider's NET cost
  // merchant phase only:
  prebook?(rateId): Promise<PrebookResult>;
  book?(prebookId, payment): Promise<BookingResult>;
}
```

- `liteapi` implements all of it (hotels, incl. book via Payment SDK).
- `duffel` implements flights now, cars later (same vendor).
- `viator` implements `ingest`/`getDetails`/`getRates` (price for display) but **no book** — it returns
  an affiliate URL; the card redirects.

Adding "cars" = write `duffel.cars` ingest/rates, flip the `cars` flag. No app changes.

---

## Pricing engine (the heart of the brand)

```ts
// One module. Every displayed price goes through it. No exceptions, no per-user inputs.
function sellPrice(netCost: Money, vertical: Vertical): PriceBreakdown {
  const fee = FEES[vertical];          // hotel: {type:'pct', value:0.10}; flight: {type:'flat', value:…}
  const feeAmount = fee.type === 'pct' ? round(netCost * fee.value) : fee.value;
  return { netCost, feeAmount, total: netCost + feeAmount, feeLabel: '…' };
}
```

- Returns the full breakdown the UI renders ("their cost / our fee / you pay").
- **Auditable + logged.** Same input → same output, always. **No A/B price testing** is even possible
  through this path (enforced by code review + a test that asserts determinism).

---

## Request flows

- **Search:** Typesense (destination/geo/facets) → for the visible result set, `adapter.getRates()` →
  `sellPrice()` → cache in Redis (key: provider+listing+dates+occupancy, TTL ~5–15 min) → render cards.
- **Listing detail:** content from Postgres (ISR, pre-rendered for popular listings) + live rates on
  selected dates (edge/client) → cost-plus card.
- **Book (merchant phase):** `prebook` → payment (affiliate redirect | LiteAPI Payment SDK | own
  Stripe, per flag) → `book` → confirmation/voucher. Gated below-SSP prices live behind member sign-in.

---

## SEO at scale

- **Routes:** `/hotels/[country]/[city]` · `/hotels/[city]/[theme]` · `/hotel/[id]/[slug]` (and the
  same shape per vertical later: `/flights/...`, `/cars/...`).
- **Rendering:** ISR — pre-build top destinations/listings, render the long tail on demand and cache.
- **Structured data:** `Hotel`/`Product`, `BreadcrumbList`, `FAQPage`, `AggregateRating` (only with
  real reviews).
- **Sharded sitemaps:** sitemap index → per-region shards (hundreds of thousands of URLs).
- **Member gate is SEO-safe:** public pages render the SSP for crawlers; the cost-plus price is the
  signed-in enhancement — Google indexes the public price, users sign in for ours.

---

## Search index (Typesense)

- `listings` collection: geo point, `vertical`, `provider`, facets (price band, stars, rating,
  amenities), `name` for typo-tolerant autocomplete.
- `destinations` collection: cities/regions for the autocomplete box (geo + popularity).
- Search-only API key in the browser; admin key server-side (indexing) only.

---

## Scale path: US → world

Same code, more data:
1. Ingest runs per country/region (LiteAPI is global, ~2M+ properties).
2. Add **currency** (display + booking) and **i18n** (route locale, translated templates).
3. Per-country sitemaps + hreflang.
No architectural change — "world" is a config + data scale-up, not a new build.

---

## Feature flags

- `NEXT_PUBLIC_BOOKING_MODE` = `affiliate` | `merchant`
- `NEXT_PUBLIC_FLIGHTS_ENABLED`, `…_CARS_ENABLED`, `…_ATTRACTIONS_ENABLED`
- Per-vertical fee config in one place (`FEES`), env-overridable.

---

## Proposed folder structure

```
src/
  app/                       # routes (hotels, hotel/[id], later flights/cars)
  components/                # UI incl. <BookingCard/> (the cost-plus breakdown)
  lib/
    env.ts  flags.ts         # (built)
    pricing.ts               # the deterministic cost-plus engine
    search.ts booking.ts     # domain services (provider-agnostic)
    providers/
      types.ts               # ProviderAdapter interface
      liteapi/  duffel/  viator/
    db/ (supabase) search/ (typesense) cache/ (redis)
scripts/
  ingest.ts                  # provider-agnostic ingestion runner
docs/                        # this folder
```

---

## Security / secrets

- Server secrets via `env.ts` (`requireEnv`), never `NEXT_PUBLIC_*`.
- Only search-only keys reach the browser.
- `.env.local` gitignored; `.env.example` is the committed template.
- Payment: prefer LiteAPI Payment SDK (their PCI scope) before owning card data.
