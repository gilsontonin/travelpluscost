# stats.md — travelpluscost canonical facts (the ONLY numbers a post may state)

Every figure in a blog post comes from here or from real LiteAPI data. **Never invent or round.** If a
number isn't here and you can't verify it at the source, omit it. (Replaces the Hawaii Picnics stats.)

> Cross-checks: `docs/POSITIONING.md` (the promise + hard guardrails), `docs/PRICING.md` (the money
> model). When those conflict with anything here, POSITIONING wins.

---

## 1. The brand promise (state it EXACTLY — over-claiming is a legal + trust risk)
- **"What the hotel charges us, plus one small flat fee — the same price for everyone, never based on
  your data."**
- The enemy is **surveillance / personalized pricing** (prices set from your device, location, history).
- We are the inverse: **deterministic pricing** — the same number for everyone, every search, every device.
- **Provable:** the same hotel, same dates, from any browser/phone/state = the identical price.

## 2. What we may say about price — and the HARD limits
- ✅ Public pages and posts show the **Suggested Selling Price (SSP)** — the market/parity price every
  major OTA shows for the same room. We sell at SSP today.
- ❌ **NEVER publish the wholesale/net cost.** ❌ **NEVER publish the exact markup %.** (Final price +
  exact % lets anyone derive our cost = a rate-parity breach that gets our supply cut. Show the
  *principle*, not the number — see POSITIONING.)
- ❌ Don't claim **"always the lowest price"** or **"no dynamic pricing anywhere."** We control *our*
  fee, not the hotel's base rate. Claim only: *"the same price for everyone, and you can prove it."*
- ❌ No fake discounts, no "1 room left," no countdown timers, no strikethrough "was" prices, no points,
  no VIP/"preferred" tiers. (These are the gimmicks the brand exists to reject — see `src/app/about`.)

## 3. What's real on the site (state freely)
- **Booking is live and real.** Real reservations, real card charge via LiteAPI's payment system
  (LiteAPI/Nuitée is the merchant of record). Confirmation by email; manage/cancel at `/cancel`.
- **Cancellation & refunds** follow each room's policy and are returned to the card automatically.
- **Inventory:** real hotels across the US (66,235 in the directory; rentals/vacation homes excluded).
- **Markets with rich local content today:** Oahu, Maui, Las Vegas, Seattle, San Diego. (Others have
  search + hotel pages from live data; lead local guides toward the five above first.)
- **The price you see is all-in:** room + taxes shown up front; any mandatory at-property fees are shown
  separately, never hidden.
- **Contact / support:** hello@travelpluscost.com.

## 4. Citable EXTERNAL facts (real, for the transparency posts — verify the link 200 before using)
- **FTC opened a "surveillance pricing" inquiry (2024–2025)** into prices set from personal data.
- **New York** requires disclosure of personalized algorithmic pricing (2025); **Maryland** restricts it
  (2026); **40+ state bills** on algorithmic/"surveillance" pricing in 2026.
- Use these to anchor the *"why transparent pricing matters now"* angle. Always link the primary source
  (FTC.gov, the state law text) and curl-200 it first.

## 5. Hotel/destination facts
- Pull hotel names, star ratings, review counts, locations, and amenities from **real LiteAPI data only**
  (the property pages already show them). Never invent walk-times, ratings, or "hidden gem" claims.
- Destination facts (neighborhoods, geography, when-to-go) must be verifiable; cite a .gov/official source.

## 6. Confirm / TODO (do NOT state until verified)
- Membership / "members save $X" pricing — **not live yet** (below-SSP member tier is a later phase). Do
  not promise member prices in a post.
- Any specific "average savings" number — we don't publish one; don't invent it.
- Flights / cars — scaffolded, not live. Don't imply we sell them yet.
- Exact company legal name, mailing address, support phone — **owner to confirm** (needed for the footer
  and for Google Hotel Center; see `docs/GOOGLE-HOTELS.md`). Until confirmed, don't state them.
