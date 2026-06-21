# HANDOFF — current state & next steps

_Last updated: 2026-06-20. This is the living state doc. Update it as you work._

## TL;DR
A working hotel-booking demo on **real LiteAPI data**, styled as the Propel layout in Airbnb coral.
**Oahu** is the featured city. Flow works end-to-end: **search → property page → guest details →
confirmation**. Booking is a **safe demo** (no charge, no real reservation). No GitHub remote / not yet
deployed — see `docs/DEPLOY.md`.

## What works (real)
- **Home** (`/`) — hero + search panel (Cars/Hotels tabs) + popular chips (Oahu, Honolulu, Waikiki, …).
- **Search** (`/search?destination=…`) — real hotels w/ photos + live prices (SSP). "Oahu" aliases to
  Honolulu. Propel results layout: results bar, category chips, 2-col grid + filters sidebar, pagination.
- **Property** (`/hotel/[id]`) — gallery, description, facilities, star/rating, "Choose your room" with
  real room offers + prices, cost-plus promise box, Reserve buttons.
- **Book** (`/book`) — order summary + guest form.
- **Confirmation** (`/booking-confirmed`) — booking ref + details + "no charge / test booking" note.
- All routes typecheck/lint/build green. `/` static; the rest `force-dynamic` (live rates per request).

## What's placeholder / demo (be honest about this)
- **Booking does NOT charge or reserve.** It generates a `TPC-XXXX` ref and a confirmation screen. The
  real LiteAPI `prebook → book → payment` is the next step (sandbox key is wired + verified reachable;
  see "LiteAPI notes"). Real booking that takes payment = merchant-of-record = Seller-of-Travel/legal.
- **Visual-only (not wired):** category chips, filters sidebar, Latest sort, Map View, favorites heart,
  pagination, "Sign in". They look right; they don't act yet.
- **Cards** show star rating where Propel showed bed/bath (LiteAPI gives stars, not bed/bath per hotel).
- Images use plain `<img>` (no `next/image` optimization yet — fine; configure `remotePatterns` for
  `static.cupid.travel` if you switch to `next/image`).

## File map
```
src/
  app/
    layout.tsx            Header + Footer + light bg
    page.tsx              home (hero, SearchPanel, popular chips incl. Oahu)
    search/page.tsx       results (Propel layout) — searchHotels()
    hotel/[id]/page.tsx   property page — getHotel() + getRoomOffers()
    book/page.tsx         booking summary + <BookingForm/>
    booking-confirmed/page.tsx  confirmation screen
    globals.css           Tailwind v4 + --accent (#ff385c coral) + --accent-tint
  components/
    Header.tsx            floating header, mobile hamburger (client)
    Footer.tsx            dark footer
    SearchPanel.tsx       Cars/Hotels tabs + fields + Update Search (client)
    PropertyCard.tsx      result card (links to /hotel/[id])
    BookingForm.tsx       guest form -> /booking-confirmed (client)
  lib/
    liteapi.ts            raw LiteAPI client (X-API-Key, getHotels/getHotelDetails/getRates)
    hotels.ts             normalized: searchHotels, getHotel, getRoomOffers + Oahu alias
    format.ts             money()
    env.ts  flags.ts      env (zod) + feature flags
    typesense.ts redis.ts supabase.ts   scale infra wrappers (NOT used yet)
docs/  POSITIONING · BUSINESS-PLAN · ARCHITECTURE · HANDOFF (this) · DEPLOY
```

## LiteAPI notes (discovered via probes — saves you the round trips)
- Base `https://api.liteapi.travel/v3.0`, auth header **`X-API-Key`**.
- `GET /data/hotels?countryCode=US&cityName=Honolulu&limit=N` → `{ data: [{ id, name, main_photo,
  thumbnail, address, city, stars, rating(/10), reviewCount, latitude, longitude }] }`.
- `GET /data/hotel?hotelId=ID` → rich detail: `hotelImages[].url`, `facilities[]` (strings),
  `hotelDescription` (HTML), `starRating`, `rating`, `reviewCount`, `checkinCheckoutTimes`, `rooms`.
- `POST /hotels/rates` `{hotelIds, checkin, checkout, occupancies:[{adults}], currency, guestNationality}`
  → `{ data: [{ hotelId, roomTypes:[{ offerId, rates:[{ name, boardName, retailRate:{
  suggestedSellingPrice:[{amount,currency}], total:[...] } }] }] }] }`. **We display
  `suggestedSellingPrice` (SSP, parity-safe); `total` is the net cost — never display it.**
  Join rates→hotels by `hotelId`.
- **Sandbox** (`LITEAPI_SANDBOX` key, same base URL): rates return 200 for real hotels, BUT `rates/prebook`
  can 409 "provider price exceeds locked selling price" (rate drift). Real booking must: fetch fresh
  rates → prebook immediately → book within the lock window, and handle 409 by re-searching.

## Env keys
In `.env.local` (gitignored; template in `.env.example`):
- `LITEAPI_KEY` — **set** (production; powers all current data).
- `LITEAPI_SANDBOX` — **set** (for safe test bookings later).
- Empty/future: Supabase, Typesense, Upstash, Travelpayouts, Duffel.

## Next steps (priority order)
1. **Deploy + tie `travelpluscost.com`** — `docs/DEPLOY.md` (needs owner's Vercel/GitHub login).
2. **Wire real (sandbox) booking** — prebook→book on the sandbox key, handle 409, confirmation from the
   real booking ID. Keep it sandbox until merchant/legal is sorted.
3. **Make the UI controls real** — filters, category chips, sort, favorites, pagination, map.
4. **Scale infra** — ingest LiteAPI content → Supabase → Typesense (see ARCHITECTURE.md) for all-US/world.
5. **Member gate + cost-plus engine** (Phase 6) — the deterministic markup + login-gated below-SSP price.
6. **Verticals** — flights/cars (Duffel), attractions (Viator affiliate).

## Gotchas
- Node: `export PATH="$HOME/.local/node/bin:$PATH"` before npm/node.
- Dynamic routes use `export const dynamic = "force-dynamic"` (live rates; don't prerender).
- `searchParams`/`params` are **Promises** in Next 16 — `await` them.
- No git remote yet; commits are local.
