# Positioning — travelpluscost

## The thesis

Travel pricing is going the way of surveillance: companies use your location, device, and history to
decide how much they can extract from *you specifically*. The regulatory and cultural backlash is
already underway (FTC surveillance-pricing study 2025; New York's algorithmic-pricing disclosure law
2025; Maryland's restriction 2026; 40+ state bills in 2026; AG actions against personalized pricing).

**travelpluscost is the inverse.** We charge the supplier's cost plus a flat fee we show you — the
**same fee for every customer, never based on your data.** As competitors are forced to *disclose*
that they personalize prices, our brand is the headline read backwards.

## The promise (must stay exactly true)

> The price they charge us, plus a fee we show you. The same for everyone.

- **Flat** — a fixed, deterministic markup (`cost × multiplier`), computed identically every time.
- **Transparent** — the fee is shown on the price breakdown, not hidden.
- **Non-personalized** — never varied by user, device, location, history, or A/B test.

### Per-vertical fee (the number differs; the principle does not)
- **Hotels:** cost + ~10% (net-rate room supports it).
- **Flights:** a small flat **service fee** (a % markup would be uncompetitive — rivals add ~$0 and
  earn airline commission). Principle identical: flat, shown, non-personalized.
- **Cars / tours:** calibrated per vertical, same rules.

### What we do NOT claim
- We do **not** claim "no dynamic pricing anywhere" — hotels/airlines set their own demand-based base
  rates; we don't control that. We control *our* fee.
- We do **not** claim "always the lowest price." We claim "no personalized markup from us, shown."

## Guardrails (brand integrity == legal safety)

1. **Deterministic markup, logged and auditable.** `cost × multiplier`, same path every time.
2. **No price A/B tests, ever.** Varying price by user is the exact thing we condemn — and a lie.
3. **Exact wording.** Overclaiming flips us from the honest actor to the deceptive one (FTC deception
   / NY disclosure exposure). Have counsel bless launch copy.

## Compliance: how transparent cost-plus stays policy-safe

Wholesale suppliers require **rate parity** — net rates aren't to be shown publicly, and selling below
the Suggested Selling Price (SSP) in public is a violation. The compliant pattern:

- **Public, indexable pages show the SSP** (the SEO traffic engine — parity-safe).
- **Below-SSP cost-plus price lives behind a free member sign-in** (LiteAPI explicitly permits
  below-SSP behind a login/app). The gate doubles as the **email-list + conversion engine.**
- Optional later: **opaque deals** (hide hotel name until booking) and **bundles** (package price is
  opaque) for deeper public discounts.

This is a **merchant-of-record** model (we set the price and take payment). It ships in Phase 6 behind
the `BOOKING_MODE=merchant` flag; v1 stays affiliate-first to validate SEO cheaply first.
