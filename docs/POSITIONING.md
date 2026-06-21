# Positioning — travelpluscost

## The thesis

Travel pricing is going the way of surveillance: companies use your location, device, and history to
decide how much they can extract from *you specifically*. The regulatory and cultural backlash is
already underway (FTC surveillance-pricing study 2025; New York's algorithmic-pricing disclosure law
2025; Maryland's restriction 2026; 40+ state bills in 2026; AG actions against personalized pricing).

**travelpluscost is the inverse.** We charge the supplier's cost plus one flat fee — the **same fee for
every customer, never based on your data.** As competitors are forced to *disclose* that they
personalize prices, our brand is the headline read backwards.

## The promise (must stay exactly true)

> The price they charge us, plus one flat fee — the same for everyone.

- **Flat** — a fixed, deterministic markup (`cost × multiplier`), computed identically every time.
- **Same for everyone** — never varied by user, device, location, history, time, or A/B test.
- **Provable** — you can verify it yourself in real time (see "the core marketing asset").
- **Transparent about the principle, not the wholesale number** — we tell you it's one flat fee; we do
  **not** show the supplier's cost or publish the exact percentage (see "Pricing disclosure").

## Pricing disclosure — market the principle, NOT the number

Two things we deliberately never publish — for the same reason, and it's not cowardice, it's what keeps
us alive *and* flexible:

1. **The wholesale / net cost.** Suppliers' rate-parity contracts forbid showing it publicly. Breaching
   it gets our supply cut off — the single biggest existential risk.
2. **A precise fixed markup %.** Because **final price + exact % lets anyone compute the net**
   (`price ÷ 1.10 = cost`). Publishing "exactly 10%" is therefore a **back-door wholesale disclosure** —
   the same parity violation, by arithmetic. It also boxes us into one number forever and doesn't fit
   every vertical.

The fee multiplier is **internal operational config, never a public claim.** What we say publicly is the
*principle*: **"one small flat fee, the same for everyone, never based on your data."**

> Note: the *Costco* move — publicly capping the markup and living by it — is brilliant in **retail**,
> where cost isn't parity-protected. In **travel**, net rates are contractually protected, so a public
> cap/percentage reintroduces the net-derivation problem. Principle + proof gets ~95% of Costco's trust
> with none of the parity exposure.

## The core marketing asset — provable non-personalization

"We're fair" is what every OTA already claims. Our differentiator is **specific and provable**: the
price is identical for everyone, and you can check it yourself.

- **Split-screen proof video:** California vs New York vs Texas, incognito vs logged-in, iPhone vs
  Android, VPN-hopping states — same hotel, same second → identical price.
- **A public "try to break it" page:** *"Open this in another browser. Send it to a friend in another
  state. Same price. Go ahead."* Invite people to disprove it — they can't.
- **Contrast demos:** competitors flexing price by device/location vs ours flat.
  **Caution:** any claim *about a competitor* must be our **own reproducible, recorded, factually-framed
  test** ("here's what I got, here's what we got, same time") — never an unprovable accusation
  (defamation risk).

This proof is what makes "we don't use your data" believable — far more than a percentage could.

## Values & the 30-second test

- **No fake discounts. No points games. No nonsense.** One honest price.
- **The 30-second test:** if we can't explain *why you're paying what you're paying* in 30 seconds,
  we're running a gimmick and we have the wrong business model.
- **Elevator pitch:**
  > Every hotel, one honest price: what the hotel charges us, plus one small flat fee — the same price
  > for you, your mom, your cousin, and the relative you haven't seen in 20 years. Same number from any
  > phone, any city, any day. We never touch your data to decide what you pay. No fake discounts, no
  > points games, no nonsense. If we can't explain your price in 30 seconds, we don't deserve the booking.

## Per-vertical fee (internal config — NOT published)

The number differs by vertical; the principle does not. These are **operational settings, never
displayed as a public fixed %**:

- **Hotels:** cost + a flat markup (net-rate room supports it).
- **Flights:** a small flat **service fee** (a % would be uncompetitive — rivals add ~$0 and earn
  airline commission).
- **Cars / tours:** calibrated per vertical, same rules.

## What we do NOT claim

- We do **not** show the wholesale cost or publish the exact markup %.
- We do **not** claim "no dynamic pricing anywhere" — hotels/airlines set their own demand-based base
  rates; we don't control that. We control *our* fee.
- We do **not** claim "always the lowest price." We claim "no personalized markup from us — the same
  price for everyone, and you can prove it."

## Guardrails (brand integrity == legal safety)

1. **Deterministic markup, logged and auditable.** `cost × multiplier`, same path every time.
2. **No price A/B tests, ever.** Varying price by user is the exact thing we condemn — and a lie.
3. **Never publish wholesale or the exact %** (see Pricing disclosure) — protects supply + flexibility.
4. **Exact wording.** Overclaiming flips us from the honest actor to the deceptive one (FTC deception /
   NY disclosure exposure). Have counsel bless launch copy.

## Compliance: how transparent cost-plus stays policy-safe

Wholesale suppliers require **rate parity** — net rates aren't shown publicly, and selling below the
Suggested Selling Price (SSP) in public is a violation. The compliant pattern:

- **Public, indexable pages show the SSP** (the SEO traffic engine — parity-safe).
- **Below-SSP cost-plus price lives behind a free member sign-in** (LiteAPI explicitly permits
  below-SSP behind a login/app). The gate doubles as the **email-list + conversion engine.**
- **Even behind the gate, we show the *total* + the *promise* — never the itemized wholesale cost.**
- Optional later: **opaque deals** (hide hotel name until booking) and **bundles** (package price is
  opaque) for deeper public discounts.

This is a **merchant-of-record** model (we set the price and take payment). It ships in Phase 6 behind
the `BOOKING_MODE=merchant` flag; v1 stays affiliate-first to validate SEO cheaply first.
