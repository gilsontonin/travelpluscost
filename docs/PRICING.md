# Pricing & business model — the plan (living doc)

Captures the pricing/model thinking as it evolves. Complements `POSITIONING.md` (hard
guardrails) and `BUSINESS-PLAN.md` (economics/exit). When this conflicts with POSITIONING.md,
POSITIONING.md wins (those are the non-negotiable compliance rules).

---

## 1. The thesis — we sell "un-rigged," not "cheapest"
The brand is **transparency + no surveillance pricing**, NOT lowest price.

> The same price for everyone, every search — never computed from your data.

The enemy is **personalized / surveillance pricing**: prices that move based on what big data
infers about you (the "you googled "baby fever" + looked at Instacart, so your diapers/Tylenol
are 30% more — to *you*, not store-wide" problem). Same thing happens in travel. We don't do it,
and we make that provable (search from any browser/city/device → identical number).

Why this position over "cheapest": we can't win a price war with Expedia (scale + ad budgets),
but we **can** own trust. Surveillance pricing also has regulatory + public-sentiment tailwinds
(the FTC opened a "surveillance pricing" inquiry). Price *level* becomes a feature of fairness,
not the whole pitch.

---

## 2. What price we show today
- Public price on cards/rooms = LiteAPI `retailRate.suggestedSellingPrice` (**SSP**), Booking.com
  parity ≈ live Expedia. This is the "fair public" number.
- `retailRate.total` = **NET** (our cost; LiteAPI's profit already inside it). **Never displayed.**
- So today we *match* the market with a trust angle — we are not yet cheaper. The cheaper
  member price (below SSP) is the membership phase (§4) and must be login-gated (parity).

**SSP validation (Prince Waikiki, Jul 24–25, 2 adults — via /compare + Google Hotels):**
SSP is **NOT inflated** vs the mainstream. Our SSP $412 = the price *every* trusted OTA showed
(Expedia, Booking, Priceline, Kayak, Orbitz, Hotels.com, momondo… all $412). So SSP is a reliable
"what Expedia/Booking charge" reference and the margin math holds.
- Our **NET ($294) sits near the public floor.** Only opaque deep-discounters were lower
  (Super.com $286, trivago/Traveluro $297) — at/below our cost; we don't compete there (they sell
  on opacity, we sell on trust).
- **Member price (net + card fee ≈ $303) beats every mainstream OTA (~$412) by ~$100 (~26%)**,
  and beats the official site ($367) and Expedia/Hotels "member" prices ($375). That's the product.
- **It's lumpy:** near-parity hotels have no room (Halepuna: NET $349 / SSP $354 = $5). Member
  savings are hotel-dependent → "Members save $X here" loud on high-spread, *match* on flat ones.

Tools: `node scripts/margin-check.mjs <region>` (net vs SSP) · `/compare` (net + SSP + live OTA links
+ "live $" input). Observed SSP−net spreads: Las Vegas ~38% median, Oahu ~22%, Seattle ~13%.

---

## 3. Why NOT a flat fee
Rejected. Card processing is **%-based**, so a flat fee gets distorted, and you leave real money
on high-value bookings. The fee should be **proportional** (a %) or **decoupled from the booking**
(a subscription). → points to the membership model.

---

## 4. The model: free transparent tier + paid membership (cost + card fee, $0 markup)
Hybrid. "Costco for hotels."

| | Free | Member |
|---|---|---|
| Public price (transparent, same for everyone) | ✅ | ✅ |
| Book at **NET + card fee, $0 markup** | — | ✅ |
| Price-drop refunds, savings dashboard, trip support | — | ✅ |
| Price | $0 | **~$29/mo or ~$99/yr** · *save more than the fee or it's refunded* |

- **Free tier** = the transparency/anti-surveillance story + full browsing. This is the SEO engine
  and audience funnel (already what the site does — public SSP, "same for everyone").
- **Member tier** = book at our cost **plus the card-processor fee passed through, nothing else.**
  Revenue is the membership, not per-booking margin.
- **Pass the card fee through — do NOT eat it.** At $0 markup, a $5k booking would cost ~$150 in
  card fees with nothing to cover it. Member price = `net + processor fee`. Fair + self-funding.
- **Compliance fit:** near-net pricing is a parity breach in public, but a **paid membership is a
  "closed user group"** — exactly the structure wholesale rates are meant for (Costco Travel,
  AAA, employer perk sites). Satisfies LiteAPI's "below-SSP behind a login" rule better than a free
  account does.

Alternative considered — **public "cost + 15%"** (no paywall): simpler, % covers card + high-value
upside, but lands *above* Booking in thin-spread markets (bad look while preaching transparency),
and below-SSP cases still need gating. Kept as a fallback, not the lead.

### 4a. Payment architecture — DECIDED 2026-06-21: LiteAPI payment + % margin (LiteAPI = MoR)
Go to market lean. Use **LiteAPI's payment system** (their SDK/wallet), set a small **margin %**
(passable per request, NOT just the dashboard slider — proven: `margin:20` → `retailRate.total`
= net × 1.20; SSP unaffected). LiteAPI charges `retailRate.total` = **net + our margin** = literally
**"cost + one small fee."** This avoids us becoming merchant of record / registering Seller of
Travel in every state up front — the cumbersome path a lean startup should defer.

Consequences this locks in:
- **The fee is a % (of net), not flat.** Matches §3 (we already rejected flat). → the tagline
  "one **flat** fee" should read "one **small** fee."
- **What LiteAPI's payment charges = `retailRate.total`, NOT our frontend number.** Hard-coding a
  price in our UI does nothing to the charge. So **display must equal `retailRate.total`** (net +
  margin), not SSP. (Today we display SSP but would charge net at margin 0 — that gap must close.)
- **Cost+fee is below SSP → it MUST be behind a membership/login (closed user group)** per LiteAPI
  parity. So this is the **member price**; the public/ungated price stays ~SSP. → the next real
  build is the **membership/auth gate**; until then public = SSP (parity-safe).
- **MoR ≠ Seller-of-Travel exemption** — see §6. Confirm both before real money; sandbox until then.

---

## 5. The "subscribe → book → cancel" worry, and how it's handled
Reframe: **monthly IS the per-trip fee in a subscription costume.** If monthly is priced fairly
(~$25–30), someone who subscribes, books a trip saving $180, and cancels just paid us $25 to save
$180 — a great deal for them, a profitable transaction for us. No leak. (The mistake is pricing
monthly too low, e.g. $5 — *then* it leaks.) Annual (~$99, ~70% off monthly) is the loyalty lane.

Anti-churn mechanisms — all **on-brand, no traps** (a dark pattern would betray the whole thesis):
1. **Money-back guarantee** — "save more than your membership costs on your first trip, or we refund
   the membership." Removes signup risk, and anyone who'd book-and-drop already got real value.
   Most on-brand retention tool possible (we only keep the fee if we actually saved you money).
2. **Cumulative savings dashboard** ("Your savings this year: $620") — loss aversion, done honestly.
3. **Price-drop refunds** for members (auto-refund if our cost drops post-booking).
4. **Founder rate** — early members lock a low lifetime price *while subscribed* (carrot, not cage).
5. **Cancel anytime, one click.** No contracts (nobody signs contracts anymore), no expensive fee,
   no cancellation maze. Churn that leaves a happy customer is marketing we got paid for.

---

## 6. Compliance ties (see also POSITIONING.md + the MoR notes)
**Three distinct concepts — do not collapse them:**
1. **Payment processing / PCI** — who handles card data. LiteAPI's SDK does this. ✅ settled.
2. **Merchant of Record (MoR)** — whose name the charge is under; owns refunds/chargebacks/liability.
   Per the §4a decision we want **LiteAPI to be MoR** (their payment flow). Docs describe two modes
   but don't explicitly assign MoR → **get it in writing.**
3. **Seller of Travel (SoT)** — *state* registration to sell/advertise travel to consumers
   (**CA, HI, WA**; FL if added; NV none). This can attach to **us** as the price-setting storefront
   **even if LiteAPI is MoR.** MoR ≠ an SoT exemption.
- So LiteAPI-as-MoR likely removes PCI/chargeback burden and *may* reduce SoT exposure, but doesn't
  automatically eliminate it. **Before charging a real card, confirm two things:** (a) LiteAPI's MoR
  status in writing, (b) a travel-compliance attorney's read on our SoT obligation given the
  structure. Stay in sandbox until both land. (None of this blocks building.)
- **ToS reviewed 2026-06-21** (liteapi.travel/terms): SILENT on payment MoR and SILENT on customer
  licensing — but grants a license "to deliver travel services *to your end users*" (frames US as the
  seller to consumers), and indemnity (§7) covers only our "misuse/breach," not regulatory
  non-compliance. So their onboarding approval protects THEM (fraud/KYB), is NOT evidence we're
  SoT-compliant. Reality check that lowers the worry: only **4 states** have SoT laws (CA/FL/HI/WA);
  realistically launch = home state (if one of the 4) + maybe CA (~$100/yr); FL is the only heavy one
  ($300 + $25k bond) and isn't required. Action: email LiteAPI "who is MoR in your payment flow?" +
  read CA SoT FAQ / 1-hr attorney consult. Cheap, not a 50-state gauntlet.
- Markup is **percentage-only** (resolved 2026-06-21): `margin:15` → `retailRate.total = net×1.15`,
  does NOT move SSP, LiteAPI takes no cut of it. Since we charge via LiteAPI's payment, **that
  `retailRate.total` is what the guest pays** — so display must equal it (see §4a). See `docs/LITEAPI.md`.
- Never display NET or the exact margin math that lets a user derive NET (parity + the derivation
  problem). Show the *principle*, not the number. Below-SSP (cost+fee) only behind the membership login.

---

## 7. Open questions / next steps
- [x] Validated SSP ≈ mainstream parity (Prince Waikiki: SSP $412 = Expedia/Booking/Priceline/Kayak
      all $412) — NOT inflated. Net near the public floor; only opaque discounters undercut net
      (their catch: usually non-refundable + fees added at checkout + reliability risk). Re-check a
      few more, esp. near-parity hotels (e.g. Halepuna NET $349 / SSP $354 = no member room).
- [x] Markup is **%-only** (no fixed amount) — resolved from docs (`docs/LITEAPI.md §4`).
- [x] Payment architecture DECIDED 2026-06-21 (§4a): LiteAPI payment + % margin, LiteAPI as MoR —
      go to market without becoming MoR / SoT-registered up front.
- [ ] **Before real money** — confirm in writing: (a) LiteAPI is MoR in the Payment-SDK flow;
      (b) travel attorney's read on our Seller-of-Travel exposure (CA/HI/WA) given LiteAPI is MoR.
- [ ] Decide the member fee % (modeling ~10%) and the membership price points ($/mo, $/yr).
- [ ] Build (real next step): **membership/auth gate** → behind it, display & charge `net + margin%`
      (= cost + fee), display == `retailRate.total`. Public/ungated stays SSP (parity). This is the
      feature that turns the site from "a nice OTA clone" into "the un-rigged travel club."
- [ ] Wire `margin` into the rates/prebook calls (the cost-plus engine) — gated behind the above.
- [ ] GA4 + Search Console now (measure the SEO bet from day one).
