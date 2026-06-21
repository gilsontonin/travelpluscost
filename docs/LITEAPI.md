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
   `WALLET`/`CREDIT` (our LiteAPI balance), `TRANSACTION` (+`transactionId`, guest card via SDK),
   `ACC_CREDIT_CARD` (sandbox test). `clientReference` = idempotency key.
5. **Manage** retrieve / cancel on the book host.

> The price the guest legally owes comes from **prebook**, not search. Search is for display
> ("from $X approx"). We're display-only today, so this is fine.

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

## 6. Merchant of record — STILL OPEN
Docs describe two modes (Nuitee-as-MoR via the Payment SDK vs. you-as-MoR on net rates) but do
**not** state who is MoR in each, nor PCI/Seller-of-Travel implications. **Confirm in writing with
LiteAPI before taking real money.** See `PRICING.md §6` and `POSITIONING.md`.
