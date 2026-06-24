# Google Hotels — how we get in (plain-English playbook)

_Goal: get travelpluscost prices to show inside Google's hotel results (the price box you see when you
search a hotel on Google). The free version is called **Free Booking Links (FBL)**. Companion to
`LAUNCH-PLAN.md` Track H._

## The one-line summary
We have to apply to **Google directly** to become a "booking partner." LiteAPI can't get us in.
Getting **approved by Google is the only real hurdle** — not the building (that part is code, and that's
on Claude). So we do a little groundwork to look legit, then apply.

## Why this is worth wanting
- Our prices appear on the highest-intent travel surface on the internet — people who are *ready to book*.
- It's **free** (no fee, no pay-per-click).
- Google punishes sites whose shown price ≠ the price at checkout ("price accuracy"). **Ours always
  match** because we never change prices. That's a built-in advantage almost no competitor has.

## Two kinds of "Google Hotels" — we're the harder kind
- A **single hotel** lists itself easily (via a Google Business Profile + a partner). Not us.
- An **OTA / booking site that resells many hotels** (us) must become a **Hotel Prices booking partner** —
  an application Google reviews and approves. It's selective, especially for brand-new sites.

> Note: "connectivity partners" (Cloudbeds / TravelClick / SynXis) and "match your Google Business
> Profile" are the **single-hotel** route — they do **not** apply to us. Our route is the direct
> booking-partner price feed (Claude builds it). And the biggest ongoing risk isn't *rejection* — it's
> later **algorithmic suspension** (shown price ≠ checkout price, fake/erratic reviews, hidden contact
> info). Our deterministic pricing + no-fake-anything brand is structurally safe on exactly those.

## Can we start today? Yes — but do groundwork first
You *can* open a free Google Hotel Center account today. But the partner application is reviewed by a
human team, so a few days of prep first = much better odds.

### Groundwork checklist (no coding — this is the owner's part)
What we already have ✓
- [x] A real, working site that can actually take a booking (live checkout).
- [x] Only real hotels (vacation rentals removed — Google requires this).
- [x] About page, Privacy, Terms, affiliate disclosure, a customer-support email, a cancel/manage page.

What to add / sort out before applying
- [ ] **Business legitimacy.** Google partners are normally registered businesses. Decide who/what the
      legal owner is (you, a parent/guardian, or an LLC). A business email on the domain
      (hello@travelpluscost.com) and ideally a contact phone help. _(Not legal advice — worth a quick
      adult/parent conversation. Ties to the Seller-of-Travel item we deferred.)_
- [ ] **Full business contact in the footer (hard Google requirement).** Business name, physical address,
      email, AND phone, permanently visible in the footer. Missing contact info is the #1 cause of the
      "misrepresentation" suspension. We have email; **address + phone still needed** (ties to the
      business-owner question above).
- [ ] **Make support + cancellation/refund policy easy to find** from any page (a footer link is enough).
- [ ] **One clear sentence of "why us"** for the application: *transparent, same-price-for-everyone
      pricing with perfect price accuracy.* That's our strongest pitch to Google.

### The technical part — Claude's job, not the owner's
Google needs a live "price feed" it can check. Claude builds that on top of LiteAPI's rates. The owner
writes **zero code**.

## The application steps (once groundwork is done)
1. Create a **Google Hotel Center** account (free).
2. Request **Hotel Prices / booking-partner** access (the OTA price-feed integration).
3. Fill in business details + point Google at the site.
4. Google reviews → if approved, Claude builds + connects the price feed → prices go live.

## Honest verdict
Realistic and high-value. The make-or-break is **Google approving us as a partner**, which we can't
control or buy our way into — but applying costs almost nothing, and our price-accuracy story is a real
edge. Best results come once the cheaper "member" price exists (then we look *cheaper* than the big OTAs
in Google's box, not just equal).
