# LiteAPI — verified integration reference

Studied against docs.liteapi.travel on **2026-06-21** and checked against our live calls.
Complements `ARCHITECTURE.md` (our stack) and `PRICING.md` (the money model).

---

## 1. Two hosts (this bit us once, now fixed)
- **Search + static content** → `https://api.liteapi.travel/v3.0` (`LITEAPI_BASE_URL`)
  - `GET /data/hotels`, `GET /data/hotel` — static content (ingest pipeline)
  - `POST /hotels/rates` — live rates
- **Booking flow** → `https://book.liteapi.travel/v3.0` (`LITEAPI_BOOK_BASE_URL`)
  - `POST /rates/prebook`, `POST /rates/book`, `GET /bookings/{id}`, `PUT /bookings/{id}` (cancel)

`liteApiFetch(path, { base: "book" })` selects the booking host. Auth on both: `X-API-Key` header
(case-insensitive; ours works). **Status: search/content host correct and live. Booking host
wired in config + client, but the flow itself is PARKED behind `NEXT_PUBLIC_BOOKING_MODE`.**

## 2. The canonical flow
1. **Static content** (offline ingest) → our `content/<region>.json`. Already done.
2. **Search** `POST /hotels/rates` with `hotelIds[]`, `checkin`, `checkout`, `occupancies[{adults,children[]}]`,
   `currency`, `guestNationality`. Returns `data[].roomTypes[].rates[]`. **Indicative** prices.
3. **Prebook** `POST /rates/prebook` `{ offerId }` → re-checks availability, returns the **FINAL price**,
   a fresh rate, a `prebookId`, and `changed` flags (price/cancellation/board). `usePaymentSdk:true`
   → returns `secretKey` + `transactionId` to collect the guest card via LiteAPI's SDK.
4. **Book** `POST /rates/book` `{ prebookId, holder, guests[], payment }`. `payment.method`:
   `WALLET`/`CREDIT` (our LiteAPI balance), **`TRANSACTION_ID`** (+`transactionId`, guest card via the
   Payment SDK — the production path), `ACC_CREDIT_CARD` (sandbox test, no real card). `clientReference`
   = idempotency key.
5. **Manage** retrieve / cancel on the book host.

> The price the guest legally owes comes from **prebook**, not search. Search is for display
> ("from $X approx"). We're display-only today, so this is fine.

### 2a. Production payment flow — VERIFIED against the official example app (2026-06-21)
Source: `github.com/liteapi-travel/build-website-example` (SDK `liteapi-node-sdk@^3.0.4`; we use raw
fetch, equivalent). Their reference does it like this — this is the path to build for real money:
1. `preBook({ offerId, usePaymentSdk: true })` → returns `prebookId`, **`secretKey`**, **`transactionId`**,
   and the **binding `price`** (show this as the total before payment).
2. Client-side **Payment SDK (Stripe-based)** initialised with `secretKey` collects + charges the card
   (sandbox test card `4242 4242 4242 4242`). LiteAPI/Stripe is the processor → supports LiteAPI-as-MoR.
3. `book({ prebookId, holder, guests[], payment: { method: "TRANSACTION_ID", transactionId } })`.

**Our current sandbox uses the `ACC_CREDIT_CARD` shortcut (no card collected) — fine to *demo* a booking,
but NOT the production path.** Switch to `usePaymentSdk:true` + Payment SDK + `TRANSACTION_ID` for real money.

**Pricing pattern their app uses (validates our member view):** it displays `retailRate.total`
(net + margin) as the price and `suggestedSellingPrice` **struck through** as the "Public Rate." That's
exactly our cost-plus member display — show cost+fee, cross out SSP as the savings anchor.

**Things we already do better than the demo:** offline content ingest (not live `getHotels` per search),
POST /book (they GET with `transactionId` in the URL = leaks to logs), real pages, room grouping + all-in fees.

## 3. Price fields (what we display, what we hide) — VERIFIED
| Field | Meaning | We |
|---|---|---|
| `retailRate.suggestedSellingPrice` (SSP) | Public/market price; hotel's **recommended minimum**, the parity benchmark. *Not guaranteed tax-inclusive.* | **Display** |
| `retailRate.total` | "Amount due to book" = **our cost** (net) + our configured commission + `included:true` taxes. With our account at commission 0, this is pure NET. | **Hide** (compare/margin only) |
| `retailRate.initialPrice` | Pre-discount rack rate (only meaningful on direct contracts). | — |
| `commission` / `priceType` | Our account is `priceType:"commission"`, commission **0** → we get NET rates. | — |
| `taxesAndFees[].included:true` | Already inside `retailRate.total`; paid online. | in SSP/total |
| `taxesAndFees[].included:false` | Mandatory, **paid at the property** at check-in (resort/facility fee). There can be **several** (sum them all). | **all-in** |
| `cancellationPolicies.refundableTag` | `RFN` refundable / `NRFN` non-refundable. | shown |

**All-in we display** = `SSP + Σ(included:false fees)`. LiteAPI's own "guest final payment"
formula is `retailRate.total + Σ(included:false)` — same shape; differs only because we **sell at
SSP** (public parity) rather than at cost. Verified against Priceline's real checkout for Prince
Waikiki: their pay-today ≈ our SSP, their "total cost" = pay-today + at-property fees = our formula.

**Empirical guard check:** across 7,865 live Oahu rates, SSP was **never** below net and never
missing — so "displaying SSP = selling below cost" is theoretical today. Add a `max(SSP, net+fee)`
guard only in the merchant phase (prebook gives the binding number there anyway).

## 4. Revenue / markup — RESOLVED
- The dashboard markup is **percentage-only** (`margin` / `additionalMarkup`), **no fixed amount**.
- Setting `margin:15` makes `retailRate.total = net × 1.15` (you keep the 15%); it does **not**
  change SSP. SSP stays the parity benchmark.
- **You keep the markup; LiteAPI does not take a cut of it.**
- For our membership model we are MoR and compute the price ourselves (`net + flat card fee`),
  so the %-only limit doesn't constrain us. Below-SSP pricing is allowed only behind a **closed
  user group** (login/membership) — which is exactly the member tier.

## 5. Limits & resilience
- **500 RPS per customer**, across all endpoints. We chunk rates at 20 hotelIds/call + 10-min
  in-memory cache → nowhere near the ceiling.
- Docs recommend **exponential-backoff retry on HTTP 429**. We don't have it yet — low priority
  (add a small retry wrapper in `liteApiFetch` before high traffic).

## 6. Merchant of record — RESOLVED (2026-06-21)
**LiteAPI / Nuitée is the merchant of record when we use their payment system (the Payment SDK
flow we already build: `prebook usePaymentSdk:true` → SDK charge → `book TRANSACTION_ID`).**
Confirmed in LiteAPI's docs (owner-verified 2026-06-21). So Nuitée's name is on the charge and they
own payment liability: **PCI, refunds, and chargebacks are theirs, not ours** — and as MoR they issue
the guest payment receipt. (The you-as-MoR alternative on net rates is the path we are NOT taking.)
**Still separate: Seller of Travel** — a *state storefront* registration that can attach to us as the
price-setter even though LiteAPI is MoR. MoR ≠ an SoT exemption; get an attorney read before real
money. See `PRICING.md §6` and `POSITIONING.md`.
