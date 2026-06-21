# travelpluscost — Business Plan

*Working draft. Numbers are realistic planning estimates, not guarantees. Have counsel review all
pricing claims and travel-seller registrations before public launch.*

---

## 1. Executive summary

travelpluscost is a transparent, **cost-plus** online travel agency: we show the supplier's cost and
add a **flat fee that's the same for every customer and never based on your data.** It launches as a
hotel-search site (US first, then global), then adds flights, cars, and attractions on one
vertical-agnostic platform.

The wedge is timing. Regulators and the public are turning hard against **surveillance pricing**
(personalized prices set by your data). As the law forces incumbents to *disclose* that they
personalize, our entire brand is that confession read backwards: **the OTA that refuses to.**

- **Phase 1 (cheap, fast):** affiliate model — search + content, hand off the booking to partners.
  Zero payment/legal liability. Purpose: prove SEO works and build an audience.
- **Phase 2 (the business):** flip on **merchant cost-plus** — we set the price (cost + flat fee),
  take payment, members see below-public prices behind a free sign-in (compliant + list-building).
- **Funding path:** bootstrap on free tiers → reinvest early commissions into content/PR → raise an
  angel round *after* organic traction proves the thesis.

**Honest headline:** building the site is months; **earning real money is 6–18 months** — because the
engine is SEO, and SEO compounds slowly. This plan optimizes for that reality.

---

## 2. The problem & the thesis

Travel pricing has become opaque and personalized. Companies use location, device, and history to
estimate **how much you specifically will pay** and price accordingly. The backlash is live:

- FTC surveillance-pricing study (2025): personal data is used to set individualized prices.
- New York requires disclosure of personalized algorithmic pricing (2025); Maryland restricts it
  (2026); 40+ state bills in 2026; AG actions (e.g. Instacart, up to 23% price spread).

**Thesis:** a meaningful and growing segment of travelers will actively choose a booking site that
promises *"the price they charge us, plus a fee we show you — the same for everyone."* That promise is
hard for incumbents to copy because their margins depend on the opposite.

See [POSITIONING.md](POSITIONING.md) for the exact, defensible brand promise and guardrails.

---

## 3. Differentiation

| | Expedia / Booking | travelpluscost |
|---|---|---|
| Pricing | Opaque markup, often personalized | **Cost shown + flat fee, same for all** |
| Trust | "Trust us, it's a deal" | "Here's the math" |
| Data use | Pricing input | Never a pricing input (and we say so) |
| Brand story | Scale | **The honest one** (earned-media magnet) |

The differentiator is also the **marketing**: the surveillance-pricing news cycle is free
distribution for a brand that's the antidote. This is a PR/content/brand play, not a CPC war (see §10).

---

## 4. Product & verticals

One platform, four verticals, added in order of ROI:

| Vertical | Provider | Model | Why this order |
|---|---|---|---|
| **Hotels** | LiteAPI | Affiliate → cost-plus merchant | Pays the bills (net-rate room for a 10% fee); biggest SEO surface |
| **Flights** | Duffel | Flat service fee (not %) | Traffic magnet, thin margin — fee must stay small to compete |
| **Cars** | Duffel Cars | Flat fee | Same Duffel integration as flights — cheap to add |
| **Attractions** | Viator | Affiliate (8%) | High commission, zero liability — embed as a card, redirect to book |

**The signature UI = the booking card.** Every result celebrates the breakdown instead of hiding it:

```
Their cost   $182
Our fee      $18   (a flat 10% — the same for everyone)
You pay      $200
```

Attractions sit *inside* the card as an affiliate upsell ("add a snorkel tour for this stay").

---

## 5. Business model & revenue

| Stream | When | Take rate | Notes |
|---|---|---|---|
| Hotel affiliate | Phase 1 | ~4–6% | Travelpayouts/CJ; no liability |
| Hotel cost-plus | Phase 2 | ~10% flat markup | Merchant; the core business |
| Flight fee | Phase 2+ | small flat $ | % markup uncompetitive on air |
| Car fee | Phase 2+ | flat $ / small % | |
| Attractions | Phase 1+ | 8% (Viator affiliate) | embedded upsell |

---

## 6. Unit economics (realistic)

Assumptions: hotel AOV ~$600/booking; hotel look-to-book ~1–2%.

| Metric | Affiliate (Phase 1) | Cost-plus merchant (Phase 2) |
|---|---|---|
| Gross per booking | ~$25–35 (4–6%) | ~$60 (10%), **−~3% payment fees, −refunds/chargebacks** |
| 1,000 bookings/mo | ~$25–35k/mo gross | ~$55k/mo gross margin |
| Traffic needed for 1,000 bookings | **~50k–100k visitors/mo** | same |

**The hard truth in one line:** the model works; the constraint is the **~50–100k monthly visitors**
needed for 1,000 bookings. That is an SEO mountain (see §9 timeline). Flights/cars/attractions raise
revenue *per visitor* and aid SEO, but hotels carry the economics.

---

## 7. The payment decision (own vs rely on them)

Three options, increasing control + liability:

| Option | Who's merchant of record | Your liability | Cost-plus? | Recommendation |
|---|---|---|---|---|
| **A. Affiliate handoff** | Partner | None | No (partner sets price) | **Phase 1** |
| **B. LiteAPI Payment SDK** | LiteAPI rails collect; you earn your margin | Low (no PCI/chargeback machine) | **Yes** | **Phase 2 start — recommended** |
| **C. Own payment (Stripe) / LiteAPI wallet** | **You** | Full (PCI, refunds, chargebacks, fraud) | Yes, max control | Later, only if B limits you |

**Recommendation: start cost-plus on B (LiteAPI Payment SDK).** You set the markup, the customer pays
through LiteAPI's rails, you collect your margin, and you avoid building a payment/refund/fraud
operation on day one. Move to C (your own Stripe + branded checkout) only when volume justifies owning
the full stack for margin/control.

**Legal:** even on B, arranging travel for compensation can trigger **Seller-of-Travel** registration
in some states (CA, FL +$25k bond, WA, HI). B likely *reduces* exposure vs C but may not eliminate it.
**This is a lawyer question before Phase 2 — not a guess.**

---

## 8. Architecture (summary — full detail in [ARCHITECTURE.md](ARCHITECTURE.md))

Built vertical-agnostic from day one so flights/cars/attractions slot in without a rewrite:

- **Next.js (SSR+ISR) on Vercel** — server-rendered for SEO, renders the long tail on demand.
- **Supabase (Postgres)** — normalized, provider-agnostic inventory (a `listing` is a hotel *or* a
  flight *or* a car; provider is a field).
- **Typesense** — geo search + autocomplete + facets at scale.
- **Upstash Redis** — short-TTL cache for live rates.
- **Provider adapters** — `liteapi`, `duffel`, `viator` behind one interface; adding a vertical = a
  new adapter, not a new app.
- **Pricing engine** — a single deterministic `cost × multiplier` module (auditable, no A/B tests) so
  the cost-plus promise is enforced in code, not by hand.
- **Booking mode + per-vertical flags** — affiliate ↔ merchant, and each vertical toggled on
  independently.

---

## 9. Roadmap & realistic timeline

**Two clocks. Don't confuse them.** *Build* (how long to ship it, working with me) vs *Traction* (how
long until it ranks and earns — SEO-bound, mostly outside our control).

### Build clock (cumulative, focused effort)

| Milestone | Build | What "done" means |
|---|---|---|
| v1 — hotels, ~25 US metros, affiliate, SEO scaffold | **2–4 wks** | Real search → property pages → indexed, monetized |
| Full **US** hotels — all locations, programmatic SEO, sharded sitemaps, perf | **+4–6 wks** | Hundreds of thousands of pages, generated not hand-built |
| **World** hotels — global ingest, currency/i18n | **+3–4 wks** | LiteAPI is already global; mostly data + i18n |
| Merchant **cost-plus** engine — LiteAPI book + Payment SDK + member gate | **+3–5 wks** | + Seller-of-Travel lead time (legal, not code) |
| **Flights** (Duffel) | **+3–5 wks** | search + book |
| **Cars** (Duffel Cars) | **+2–3 wks** | shares Duffel integration |
| **Attractions** (Viator affiliate card) | **+1–2 wks** | embedded upsell |
| **→ Full-blown multi-vertical global site** | **~4–6 months** | everything above |

**Key reframe on "every US/world location":** you do **not** build location by location. LiteAPI ships
~2M+ global properties; "every location" = one ingestion pipeline run at scale + programmatic page
generation. US and world are the *same architecture* — world is just more rows + i18n.

### Traction clock (independent of build speed)

| | Realistic |
|---|---|
| First meaningful organic traffic | **3–6 months** after pages are indexed |
| Material traffic / first real revenue | **6–12 months** |
| ~1,000 bookings/mo (the "pays bills" goal) | **12–24 months**, *if* SEO + brand compound |

Building fast doesn't speed this up. The lever is content quality, brand/PR, and time.

---

## 10. Go-to-market & advertising

**Channel reality:** in travel, paid search is a bloodbath — Google Hotel Ads and Expedia outbid
everyone. **Do not fight a CPC war.** Our cheap, scalable, compounding channels:

1. **Programmatic + editorial SEO** (the core engine) — destination/theme/property pages at scale.
2. **The transparency brand as earned media** — every surveillance-pricing headline is our hook.
   Pitch press, ride the news cycle. "The OTA that shows its markup" is a story; "another OTA" isn't.
3. **Build-in-public on YouTube** — the construction *is* content and audience.
4. **The member gate as a list** — "sign in to see our cost-plus price" builds an email asset to
   re-market to for free.
5. **Reinvest, don't burn.** Put early commissions into content + PR (durable) — not CPC (rented).
   Paid ads only later, and only retargeting/brand, where transparency converts.

Your instinct — *"look at us, we're not another Expedia, we're transparent"* — is exactly right as a
**brand/PR** strategy. It is the wrong message to put behind generic CPC; it's the right message for
press, content, and the gate.

---

## 11. Growth & funding

**Bootstrap → traction → angel.** Investors fund *traction*, not ideas.

- **Bootstrap (months 0–6):** free tiers, your time + mine. Cost ≈ domain + ~$0–50/mo infra.
- **Reinvest (6–12):** first affiliate/cost-plus revenue → content + PR.
- **Angel (12+):** raise *after* you can show the chart that matters: **organic traffic growth +
  booking conversion + the differentiated brand + a growing member list.** That chart, plus the
  surveillance-pricing tailwind, is the pitch. Use proceeds to scale content, hire, and expand
  verticals/geographies — not to buy traffic you can't retain.

**What an angel will want to see:** sustained MoM organic growth, a real conversion rate, low CAC
(because SEO/PR), and evidence the transparency angle drives preference (repeat + direct traffic).

---

## 12. KPIs / milestones

- **Phase 1:** pages indexed; organic clicks (GSC); affiliate EPC; email signups.
- **Phase 2:** cost-plus conversion vs affiliate; AOV; refund/chargeback rate; member growth.
- **North star:** **organic-driven bookings/month** (not vanity traffic).

---

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **SEO ramp is slow** (the #1 risk) | Affiliate-first keeps burn ~$0 while it compounds; brand/PR shortens it |
| **Supplier dependence** (LiteAPI/Duffel terms, rate parity) | Compliant member-gate; multi-provider adapters reduce lock-in |
| **Thin flight margin** | Flights are a traffic/AOV play, not profit; hotels carry economics |
| **Merchant liability** (refunds, chargebacks, Seller-of-Travel) | Start on Payment SDK (B), counsel before Phase 2, register where required |
| **Overclaiming the promise** | Deterministic markup, no A/B price tests, exact copy (POSITIONING §guardrails) |
| **Incumbents copy "transparency"** | Their margin model resists it; first-mover + brand + the gated list |

---

## 14. Costs / burn

| Stage | Monthly infra | Notes |
|---|---|---|
| Bootstrap (v1) | **~$0–50** | free tiers: Vercel/Supabase/Typesense/Upstash |
| Full-US scale | **~$100–500** | paid Typesense cluster + DB + bandwidth for hundreds of thousands of pages |
| Merchant phase | **+ payment fees ~3%/booking + Seller-of-Travel** (CA $100, FL $300 + $25k bond) | |
| Growth | content/PR spend (variable) | the real investment is content, not infra |

**Bottom line:** the financial risk to *start and prove this* is tiny (domain + your time). The real
cost is **time-to-traffic**. That's why we build cheap, validate SEO, and only then spend.

---

## 15. Exit strategy

Build it so it's *sellable* even if you never sell — the same things that make it acquirable (owned
audience, clean books, supplier diversification, brand) also make it more profitable to keep.

### The paths (smallest → largest, by likelihood)

| Path | What it is | Realistic valuation | When |
|---|---|---|---|
| **A. Lifestyle / cash-flow** | Don't sell. The "exit" is annual profit in your pocket. | n/a (keep the cash) | anytime |
| **B. Flip the asset** | Sell the site via a broker (Empire Flippers, FE International, Quiet Light, Flippa) | **~30–35× trailing monthly net profit** (~2.5–3× annual) for a stable, diversified travel content/affiliate site | after ~12–24 mo of stable profit history |
| **C. Strategic acquisition** | An incumbent (Booking, Expedia, Trip.com, Hopper) or travel-media/PE buyer acquires the **brand + audience + member list + tech + the transparency positioning** | **revenue multiple (~1–4× revenue)** depending on growth — much larger, needs real scale | ~3–6 yrs with growth |
| **D. Acquihire** | A travel/fintech company buys the team + IP + brand | between B and C | opportunistic |
| **E. Venture path** | Angel → Series A → larger strategic exit | highest ceiling, most dilution/risk | only if clearly compounding |

**Real comps (2026):** content/affiliate sites sell at ~25–35× monthly profit (top-quality 30–34×); a
tech blog netting **$400k/yr sold for ~$1.1M (≈33× monthly)** on stable traffic + diversified
affiliates. ([Empire Flippers](https://empireflippers.com/selling-six-figure-affiliate-sites/),
[FE International](https://www.feinternational.com/blog/how-much-business-worth-valuation-2025))
The OTA M&A market is active ($850M+ in recent consolidation; Booking ~$22B and Expedia ~$14B revenue
fund acquisitions). ([PhocusWire](https://www.phocuswire.com/hot-25-travel-startups-2025-revisit))

**Worked example (Path B):** if the site nets **$20k/mo**, a flip is roughly **$600–700k**; at **$5k/mo**,
roughly **$150–175k**. That's the affiliate-phase exit — achievable without ever becoming a merchant.

### Why *this* asset is attractive to acquire
An incumbent can buy scale easily but **can't easily buy trust.** The cost-plus brand, the engaged
member list, and the timely anti-surveillance-pricing positioning are exactly the defensive/PR assets a
big OTA would pay a premium for — plus a clean, documented, multi-provider codebase that survives
diligence.

### Value drivers (what moves the multiple)
- **Defensible organic traffic** (an SEO moat, not paid-traffic dependence).
- **Owned audience** — the email/member list is the single most portable, valuable asset.
- **Brand strength** — high % of direct/repeat traffic signals a real brand, not a rankings fluke.
- **Revenue growth rate** — multiples track trajectory, not just size.
- **Supplier diversification** — LiteAPI + Duffel + Viator (the adapter architecture already avoids
  single-provider risk).
- **Founder-independence** — documented, transferable operations.
- **Clean books + clean cap table.**

### Do-now moves to protect exit value (cheap insurance)
1. **Separate entity + bank account + bookkeeping from day one** (a flip needs clean trailing financials).
2. **Own the audience** — capture the member/email list relentlessly (also your cost-plus gate).
3. **Diversify suppliers** — already architected; don't let one provider become a single point of failure.
4. **Document operations** — the build-in-public docs double as the diligence data room.
5. **Entity structure with the exit in mind** — an **LLC** is simplest for a flip; a **Delaware C-corp**
   is required if you'll raise venture (Path E). Decide *before* raising — converting later is costly.
   *(Accountant/attorney call, not a guess.)*

### Honest base case
Most travel startups never reach a big strategic exit. **Plan for A (cash flow) and B (asset flip) as
the probable outcomes; treat C/D/E as upside, not the assumption.** The good news: Paths A and B are
fully reachable on the affiliate model alone — the cost-plus merchant build raises the ceiling (C/E)
but isn't required to have something worth keeping or selling.
