# LiteAPI — full capability map, monetization & "fall back, don't reinvent"

_Crawled from docs.liteapi.travel on **2026-06-23** (full `llms.txt` index + deep read of the ~15
highest-leverage pages). Companion to `LITEAPI.md` (the verified reference for the calls we actually
make), `PRICING.md` (the money model), and `POSITIONING.md` (brand guardrails). Where this names a
revenue or compliance fact, it's flagged **[doc]** (stated in their docs) or **[infer]** (our reading)._

**Standing directive (owner):** stay lean — **before building anything, check whether LiteAPI already
does it** (payments, refunds, CS, amendments, analytics, content, price context) and wire their endpoint
instead of reinventing.

---

## 0. How to navigate their docs (so we never guess)
- **Machine index:** https://docs.liteapi.travel/llms.txt — lists every guide + every API endpoint.
- **Clean markdown of any page:** append `.md` to any `docs/…` or `reference/…` URL.
- **API reference root:** https://docs.liteapi.travel/reference
- **MCP server (live queries during dev):** `https://mcp.liteapi.travel/api/mcp?apiKey=YOUR_API_KEY`
  — exposes hotel search / rates / places / details / prebook / book as agent tools. Sandbox key works.
- **Dashboard:** https://dashboard.liteapi.travel/ · **Support:** https://liteapi.travel/contact/

Three hosts now (was two): `api.liteapi.travel` (search/content/rates), `book.liteapi.travel`
(prebook/book/manage), and `da.liteapi.travel` (dashboard API — vouchers, etc.).

---

## 1. How we make money

### 1a. The mechanism (current, live)
We charge **SSP**; we set a per-request `margin` that lifts `retailRate.total` to ≥ SSP; we keep the
**SSP − net spread**. **[doc]**
- `margin` (%) **overrides** the dashboard default commission; `additionalMarkup` (%) **adds** to it.
  Both percentage, decimals supported. **LiteAPI takes no cut of the margin.**
- `retailRate.total` = net + our margin (what their payment charges). `suggestedSellingPrice` (SSP) =
  the hotel's recommended **minimum public** price (the parity benchmark). Net = `margin:0`.
- Observed spreads: ~13% Seattle · ~22% Oahu · ~38% Las Vegas (median). Lumpy per-hotel.

### 1b. Payout timing — the non-obvious cash-flow fact **[doc]**
> "A booking is confirmed when a guest completes their stay and checks out." Commissions pay out
> **weekly**, after that.

So **cash lags the booking by (trip date + ~1 week)**, not the booking date. A July booking for an
August stay settles in early September. First *booking* ≠ first *dollar in the bank*. Pull actuals from
`POST /commissions/report` (`from`/`to`/`sandbox` → daily `amount` + average `percentage`).

### 1c. Two MoR models — we use one, avoid the other
- ✅ **LiteAPI as MoR** (our path): Payment-SDK flow (`prebook usePaymentSdk:true` → SDK charge →
  `book TRANSACTION_ID`). LiteAPI/Nuitée is on the charge; **they own PCI, refunds, chargebacks, CS,
  and issue the guest receipt.** **[doc, owner-confirmed]**
- ❌ **You as MoR** (`margin:0`, your own processor) — this is what **External Checkout** is (see §4).
  Opposite of what we want. Keeps us off it.

---

## 2. Fall back on LiteAPI — concrete "don't reinvent" map

| What we'd otherwise build | LiteAPI endpoint / feature | Status for us |
|---|---|---|
| **Confirmation email + record sync** | **Webhooks** (`booking.book`, `.cancel`, `.refund`, `.amendment`, `.checkinInstruction`, `.book.hotelConfirmationNumber`) | `email.ts` built but **unwired**; should hang off a webhook, not inline — see §3 |
| Booking changes (dates / occupancy / name) | `POST /bookings/{id}/alternative-prebooks` → `POST /rates/rebook`; `PUT /bookings/{id}/amend` | not built; add to manage page |
| Cancellation + refunds | `PUT /bookings/{id}` (cancel); refunds auto per policy (LiteAPI) | **built** (`/cancel`, `/api/booking-cancel`) |
| Customer service / chargebacks / PCI | LiteAPI (MoR) | rely on it; thin contact only |
| Earnings / analytics dashboard | `POST /commissions/report`, `/analytics/report|weekly|hotels|markets`, `GET /bookings/*-report` | not built; pull theirs |
| "Average price in {city}" content | `GET /prices/city` (`countryCode`,`cityName`,`fromDate`,`toDate` → daily `avgPriceUsd`) | not built; **$0.05/req, 10/min — cache hard** |
| Reviews | `GET /data/reviews` | check if already used |
| Guest CRM / history | `GET /guests`, `/guests/{id}/bookings|vouchers|loyalty-points` | not built |
| Natural-language "vibe" search | `GET /data/hotels/semantic-search` (query → tags/persona/style/story + `score`); `aiSearch` on `/hotels/rates`; `GET /data/hotel/{id}/ask` (beta); `/data/hotels/room-search` (beta) | site has `vibeSearch.ts` — verify it uses these vs. hand-rolled |
| Price index per hotel | `POST /hotels/price-index` | not built |

**Webhook payload gotcha [doc]:** envelope is `event_id`, `event_name`, `request`, `response`,
`sandbox`. `request`/`response` are **stringified JSON — parse twice**. At-least-once delivery →
**dedupe on `event_id`**; return 2xx to stop retries; optional shared-secret auth header (use it).

---

## 3. The one gap to close next — confirmation email via webhook
Today `/booking-complete` finalizes the booking (`book TRANSACTION_ID`) and `redirect()`s to
`/booking-confirmed`, but **never sends the receipt**. `src/lib/email.ts` (Resend) exists, is correct,
and is **untracked + uncalled**. Doing it inline on a `force-dynamic` page that immediately redirects is
fragile (can fail or double-fire).

**Right shape:** `POST /api/webhooks/liteapi` → on `event_name === "booking.book"`, parse the inner
booking, dedupe on `event_id`, call `sendBookingConfirmation()`. Register the endpoint in dashboard →
Developer tools → Webhooks with a shared secret. Same endpoint later handles `.cancel`/`.refund`/
`.amendment` for record-keeping. Needs `RESEND_API_KEY` in Netlify (and a verified sender domain to
email anyone, not just our own Resend account).

---

## 4. On-brand monetization levers (don't betray the thesis)

- **Exclusive Rates** (Perks & Promotions) **[doc]** — privately negotiated, **hotel-funded** discounts
  that surface in `retailRate.promotions` (name, date range, value/type, optional code) and render as
  honest strikethrough (`~~$210.00~~ $163.66`). On-brand: a **real** discount off the verified market
  price, not a fake "was." Free conversion lift — just render the field. (Contrast: don't invent "$X
  off" — POSITIONING.md.)
- **Tier perks** **[doc]** — `perks[]` per rate (`perkId`, `name`, `amount`, `currency`, `level` =
  HOTEL/RATE/ROOM), gated by a `guestLevel` you configure via `PUT /loyalties`. Free breakfast, upgrades,
  credits, early/late checkout, free laundry. This is the **member-tier *value*** engine.
- **Add-ons at prebook** **[doc]** — eSIM data packages + Uber ride vouchers ($10–100). Passed in the
  prebook payload (`addon:"esimply"|"uber"`, `value`, details); non-refundable; codes returned on book.
  eSIM fits a transparency-first travel brand; incremental per-booking revenue.
- **The member tier** (planned, PRICING.md §4b) — below-SSP, login-gated. Price via **margin-per-request
  (5%)** or the **Vouchers API**. Vouchers = %-discounts **we fund** (our account card covers the gap,
  lowering our commission): `POST /vouchers` (`discount_value`, `minimum_spend`, `maximum_discount_amount`,
  `validity_*`, `usages_limit`, `status`) on `da.liteapi.travel`; applied via `voucherCode` in prebook
  with `usePaymentSdk:true`. Good for promo codes (`WELCOME10`). The systematic member price is cleaner
  as margin-per-request; vouchers are the marketing/campaign tool.

---

## 5. New verticals — Flights (and Cars)
- **Access [doc]:** request-only, off by default even in sandbox (dashboard → Request Assistance; state
  use case + traffic). Production requires a completed sandbox integration first; subject to provider
  restrictions, stricter rate limits, commercial review. **Revenue/MoR model not disclosed in the
  public docs** — must ask LiteAPI.
- **Complexity [doc]:** materially harder than hotels — a **6-state machine** (SEARCH→VERIFY→PREBOOK→
  [services]→BOOK→manage), SSE-streamed rates, aggressive TTLs (verified ~5 min, prebooked ~15 min),
  `offerId` is irreplaceable, ancillaries (bags/seats) regenerate `transactionId`, and the dangerous
  "card charged but booking failed" path needs a recovery job. Flights currently book **via credit
  only** (SDK flow in development).
- **Verdict:** real surface, but **defer.** Thin margins + high operational risk + gated access. Finish
  hotels (member tier, email, content) first. Our `/flights` + `/cars` routes already scaffold behind
  `verticals.ts` flags, so turning them on later is an adapter, not a rewrite (`FRAMEWORK.md`).

---

## 6. Avoid-list (fights the brand or the model)
1. **External Checkout** **[doc]** — partner runs **their own payment processor** while LiteAPI does
   search/confirmation. That makes **us the MoR** — the exact opposite of our chosen model. Don't.
2. **Loyalty *points*** — LiteAPI has a points program (`/loyalties`, `/guests/{id}/loyalty-points/
   redeem`). Our `/about` manifesto **condemns "vanity points… confusing by design."** Using points
   would contradict the brand. Use loyalty **only** as the `guestLevel` gate for perks/exclusive rates —
   **never** as a points game.
3. **Whitelabel pre-built site** — LiteAPI offers a hosted booking site (custom domain, appearance,
   SSO). We already built our own (better SEO control). Useful only as a reference, not a path.

---

## 7. Prioritized opportunities (impact × effort)
1. **Confirmation email via webhook** (§3) — small, contained, fixes a live gap, textbook fallback win.
2. **Render Exclusive Rates / promotions** (`retailRate.promotions`) — honest strikethrough, free lift.
3. **City price-index content** (`/prices/city`) — feeds "from $X / typical price in {city}" editorial,
   cached. On-brand transparency angle.
4. **Member tier** (PRICING.md §4b) — the real business model: login-gate + margin-5% (or vouchers) +
   strikethrough "subscribe to unlock." Biggest build; biggest payoff.
5. **Internal earnings view** (`/commissions/report` + `/analytics/*`) — measure the bet.
6. **eSIM/Uber add-ons** — incremental revenue, low effort, traveler-useful.
7. **Defer:** Flights/Cars (gated + complex), points (anti-brand), External Checkout (wrong MoR).

---

## Appendix — endpoint inventory (from `llms.txt`, 2026-06-23)

**Hotel rates & booking:** `POST /hotels/rates` · `POST /hotels/min-rates` · `POST /rates/prebook` ·
`POST /rates/book` · `GET /prebooks/{id}` · `POST /rates/rebook`
**Booking mgmt:** `GET /bookings` · `GET /bookings/{id}` · `PUT /bookings/{id}` (cancel) ·
`PUT /bookings/{id}/amend` · `POST /bookings/{id}/alternative-prebooks` · `POST /bookings/search` ·
`GET /bookings/list`
**Hotel data/content:** `GET /data/hotels` · `GET /data/hotel/{id}` · `GET /data/hotel/{id}/ask` (beta) ·
`GET /data/hotels/semantic-search` · `GET /data/hotels/room-search` (beta) · `GET /data/reviews` ·
`GET /data/places` · `GET /data/places/{id}` · `GET /data/facilities` · `GET /data/hoteltypes` ·
`GET /data/chains` · `GET /data/countries` · `GET /data/cities` · `GET /data/currencies` ·
`GET /data/languages` · `GET /data/iatacodes`
**Pricing index:** `GET /prices/city` · `POST /hotels/price-index`
**Analytics:** `POST /commissions/report` · `POST /analytics/report|weekly|hotels|markets` ·
`GET /bookings/guest-nationality-report|hotels-sales-report|source-markets-report`
**Guests & loyalty:** `GET /guests` · `GET /guests/{id}` · `/guests/{id}/bookings|vouchers|loyalty-points`
· `POST /guests/{id}/loyalty-points/redeem` · `GET|PUT /loyalties`
**Vouchers (`da.liteapi.travel`):** `GET|POST /vouchers` · `GET|PUT|DELETE /vouchers/{id}` ·
`PUT /vouchers/{id}/status` · `GET /vouchers/history`
**Supply config:** `GET|PUT /supply-customization`
**Flights:** `POST /flights/rates` (SSE) · `POST /flights/verify` · `POST /flights/prebooks` ·
`POST /flights/prebooks/{id}/services` · `POST /flights/bookings` · `GET /flights/bookings[/{id}]` ·
`POST /flights/matrix` · `GET /data/flights/airlines|airports[/iatas[/{code}]]`
**AI/tooling:** MCP server (`mcp.liteapi.travel/api/mcp`) · Booking Assistant chatbot · webhooks.
