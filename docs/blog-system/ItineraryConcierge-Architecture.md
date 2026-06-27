# Hawaii Itinerary Concierge — Architecture & Build Plan

> **Status:** Phases 1–4 built (2026-06-16). Owner approved building "a proper architecture."
> **Working name:** the **Aloha Planner** (placeholder — rename freely).
> **One line:** an interactive, per-island, pill-driven trip planner that builds a real day-by-day
> schedule as the visitor answers, prices it, tells them exactly what to book and where to stay
> (affiliate-monetized), and **emails a personalized LINK to capture the lead.**
>
> **DECISION (2026-06-16) — no PDF.** The lead magnet is an emailed **personalized link** to a hosted,
> mobile-first itinerary page (`/plan/?t=<token>`), NOT a PDF. Reasons the owner gave: PDFs read badly
> on mobile and suppress link clicks, and the last PDF attempt "didn't look right." The link reads
> beautifully on a phone, every booking link is tappable, and (because the site is a static export)
> the page rebuilds the exact plan client-side from a token — no server state, no render deps. The
> page is `noindex, follow` (a lead magnet reached from inside posts, not a ranking page).

This is a product, not a widget. The north star: a visitor lands on a blog post, taps **"Build my
Hawaii itinerary,"** answers ~6 tap-only questions, watches a real plan assemble live, and leaves
their email to get a **personalized link** back to it. We capture a **highly-qualified lead** (island
+ dates + party + interests) and earn **affiliate revenue** on every tour/hotel they book.

---

## 0. The single most important design decision (read this first)

**Rules + our own curated content build the itinerary; the LLM only personalizes and converses.**

The itinerary skeleton — which beaches, which tours, which region each day, the prices, the "book
ahead" flags, the affiliate links — is assembled **deterministically from a structured inventory we
control** (largely an index of our existing blog posts + `viatorTours.ts` + the per-island Expedia
links). The LLM (our existing chat function) is used **only** for: understanding free-text answers,
writing the friendly per-trip framing, and answering ad-hoc questions mid-flow.

Why this matters: an LLM that invents a hotel, a price, or a closed attraction is a legal and trust
liability for a site that monetizes bookings. By assembling from trusted, curated data, **we never
ship a hallucinated fact or a dead affiliate link**, the experience is near-instant and nearly free,
and every recommendation links back to a post we actually wrote (SEO + engagement compounding).

The corollary: **our blog IS the inventory.** 160+ posts already cover the beaches, tours, food, and
resorts island by island. The concierge is the structured, monetized front-end to content we already
own. That's the unfair advantage.

---

## 1. What the visitor experiences (UX flow)

**Entry points**
- A chat-bubble CTA **under the Table of Contents** on every blog post ("Build my {Island} itinerary"
  — island pre-filled from the post). Sibling styling to the teal first-screen chat bubble, distinct
  color so the two don't compete.
- A standalone **`/plan`** landing page (static shell + the same client builder) for ads/social/email.
- Optionally a "turn this guide into a plan" nudge inside the existing chat.

**The guided flow (all tap-only pills; free-text always allowed but never required)**
1. **Which island?** (pre-filled from the post; pills: Oahu · Maui · Kauai · Big Island · "help me pick")
2. **How long?** (pills: 3 / 5 / 7 / 10 days · custom)
3. **Who's going?** (couple · family with kids · friends · solo — drives pace, beaches, luau, etc.)
4. **Your vibe?** (multi-select pills: beaches · hikes · food · snorkeling · culture/history · adventure
   · chill · romance — maps to inventory tags)
5. **Pace?** (packed · balanced · slow — controls items/day)
6. **Where are you based / budget?** (region pills + budget tier — drives the Expedia hotel pick)

**As they answer, the itinerary builds live** in a "Your trip so far" panel: Day 1 / Day 2 … fill in
with real spots, each as a card (photo, what it is, time, ~cost, "book ahead" tag, a link to our guide,
and the affiliate **Book** button). Drive-time chips between regions ("~55 min to the North Shore").
A running **est. cost** strip (tours + lodging range + food estimate).

**The payoff / lead capture**
- "**Email me this itinerary**" is the primary CTA. Email-gated: they get a personalized **link** to
  their saved, mobile-first plan with all the tappable affiliate links, prices, and a soft Oahu-picnic
  mention — NO PDF (see the top decision note). We store the lead + the full trip profile.
- Secondary: "**Tweak it**" (swap a day, add a rest day, "more food"), "**Add another island**."
- Every **Book** button is an affiliate link (Viator / Expedia / Booking / Amazon-when-live).

---

## 2. System architecture (where each piece runs)

Constraint: the site is **static export** (`output: 'export'`, Netlify). No Next SSR/API routes. All
dynamic work runs in **Netlify Functions** (precedent: `netlify/functions/chat.ts`) or **client-side**.

```
┌─────────────────────────── CLIENT (static, React) ───────────────────────────┐
│  <ItineraryBuilder>  (new client component, dynamic-imported like ChatWidget) │
│   • pill question flow (state machine)   • live "Your trip so far" panel       │
│   • rule-based assembler (imports the inventory data at build time)            │
│   • renders item cards + affiliate Book buttons + drive chips + cost strip     │
│   • calls functions only for: LLM glue, email-the-link                         │
│   • builds the share token (lib/itinerary/share.ts) + reads ?t= to rehydrate    │
└───────────────┬───────────────────────────────────────────────┬──────────────┘
                │ (optional, selective)                          │ (on "email it to me")
                ▼                                                ▼
   /.netlify/functions/plan-llm                       /.netlify/functions/plan-email
   • free-text → structured prefs                       • email a personalized link
   • personalization / ad-hoc Q&A                        • Resend + store the lead
   • Anthropic SDK (reuse chat.ts patterns,              • store lead (reuse chat
     prompt caching, Haiku/Sonnet)                         lead pipeline + GA4)
                │                                                │
                ▼                                                ▼
        Anthropic API                                   Resend + lead store
```

**Shared static data (bundled at build, importable by client AND functions):**
`content/itinerary/inventory.ts` (+ per-island files) — the curated catalog (see §3).

**Reuse, don't rebuild:** the existing chat function (`netlify/functions/chat.ts`), the lead-capture +
Resend backstop, GA4 events, the `.ig-ask` open pattern, the Viator/Expedia affiliate plumbing in
`lib/markdown.ts`, and the per-island Expedia mapping we just shipped in `app/blog/[slug]/page.tsx`
(lift it into a shared `lib/islands.ts`).

---

## 3. Data model

### 3a. The inventory (the knowledge base = a structured index of our content)
`content/itinerary/inventory.ts` — one entry per bookable/visitable thing, **mostly derived from
existing posts**, hand-enriched for the fields a planner needs:

```ts
type InvItem = {
  id: string;                 // stable slug
  island: "oahu" | "maui" | "kauai" | "big-island";
  region: string;             // "north-shore" | "waikiki" | "wailea" | ...
  kind: "beach" | "sight" | "hike" | "tour" | "food" | "lodging" | "luau" | "snorkel";
  title: string;
  geo: { lat: number; lng: number };
  durationMin: number;        // typical time on site
  costPerPerson?: number | [number, number];  // from stats / corpus — ranges, honest
  bestTime?: "sunrise" | "morning" | "afternoon" | "sunset" | "any";
  bookAhead?: boolean;        // Hanauma reservation, Molokini boat, luau, Haleakala sunrise
  tags: string[];             // "beaches","snorkeling","family","romance","adventure","chill","food"
  postSlug?: string;          // our guide → internal link (engagement + SEO)
  affiliate?: { kind: "viator" | "expedia" | "booking" | "amazon"; code_or_url: string };
  blurb: string;              // one honest line (reuse the post's voice)
};
```

- **Seeding:** ~80% can be **auto-scaffolded** from `content/blog.ts` (each location post → an item:
  island/region from slug+title, postSlug, blurb from excerpt) + `viatorTours.ts` (tours, with price/
  rating/island already cached) + the Expedia island map (lodging). The remaining 20% (geo coords,
  durationMin, bestTime, bookAhead, costPerPerson) is a **hand pass on the ~top 100 items** — a
  bounded, one-time effort. A `scripts/build-inventory.mjs` does the scaffold; humans enrich.
- **Single source of truth:** when we publish a new spot post, a line in the inventory keeps the
  planner current. (Could later auto-sync via the same embeddings index.)

### 3b. The itinerary (the thing we build + render + PDF)
```ts
type Itinerary = {
  island; days: number; party: { adults; kids; childAges? };
  interests: string[]; pace: "packed" | "balanced" | "slow"; budgetTier: "value" | "mid" | "splurge";
  base?: { region: string; expediaUrl: string };
  schedule: Day[];                 // Day = { n, region, items: ScheduledItem[], driveFromPrevMin? }
  estCost: { tours: [n,n]; lodging: [n,n]; food: [n,n]; total: [n,n] };
  affiliateLinks: string[];        // deduped, for the PDF "book these" section
};
```

---

## 4. The conversation + assembly engine

**A deterministic state machine drives the questions** (cheap, fast, controllable). Each state emits a
prompt + pills; answers update the `prefs`. After enough prefs, the **rule-based assembler** runs:

1. **Pick the base/region** from budget + island → Expedia link (reuse `lib/islands.ts`).
2. **Select candidate items** by island + interests (tag match) + party (kid-friendly, romance) +
   `bookAhead` priorities, ranked (rating, our editorial "pick" flag, distance from base).
3. **Distribute across days** by **region clustering** (don't bounce the island) — group nearby
   regions per day; respect a per-day budget set by `pace` (packed=4–5 items, slow=2).
4. **Order within a day** by `bestTime` + geography (sunrise hike → beach → lunch → sight → sunset),
   inserting **drive chips** from a **static per-island distance matrix** (hand-coded, free, accurate
   enough; e.g., Waikiki↔North Shore ≈ 55 min). Flag `bookAhead` items prominently.
5. **Price it** from `costPerPerson × party` + lodging range × nights + a food/day estimate → honest
   ranges (never invent a precise number — same discipline as the blog).

**Where the LLM helps (selective, via `plan-llm` function):**
- Map free-text ("we love waterfalls and poke, hate crowds") → interest tags + constraints.
- Write the warm, personalized intro + per-day one-liners (in the house voice — funny-first).
- Handle "can you swap X / is Y worth it / we're vegetarian" mid-flow Q&A.
- Never selects facts/prices it can't see in the inventory; it reorders and narrates the rule output.

**Cost:** the pill flow + assembly are **$0** (no LLM). LLM touches are short and prompt-cached →
~**$0.005–0.02 per completed plan**. PDF/email is a cheap function call. Effectively free at our volume.

---

## 5. Emailed link + lead capture (the lead magnet) — BUILT 2026-06-16

**No PDF** (see the decision note at the top). The deliverable is an emailed **personalized link** to
the visitor's saved plan, plus the live booking links.

- **Trigger:** "Email me this itinerary." Capture email (the trip profile is already in state).
- **The token:** `lib/itinerary/share.ts` `encodeTrip()` packs `{ prefs, intro?, notes? }` into a
  URL-safe base64 string **client-side**. The engine is deterministic, so the saved view only needs
  the prefs (+ the non-deterministic LLM intro/notes). The link is `${SITE}/plan/?t=<token>`.
- **The view:** `/plan` reads `?t=` **client-side** (`useEffect`, no server `searchParams` — static
  export), `decodeTrip()`s it, and re-runs `planItinerary()` → the identical day-by-day plan, with
  photo slots (deferred) and live tappable affiliate links. `noindex, follow`.
- **The send:** `netlify/functions/plan-email.ts` — validates the email, builds the link, sends a
  branded **Resend** HTML email (brand header, the personalized intro, a teal "View your itinerary"
  button, the "Book these" affiliate links inline, FTC disclosure, reply-to owner, **bcc owner**).
  Self-contained (no `@/` imports) so esbuild bundles it. 503 if Resend isn't configured.
- **Lead store:** reuses the chat lead pipeline (`LEADS_WEBHOOK_URL` + `LEADS_SHARED_SECRET`, Apps
  Script → Sheet, upsert by `sessionId = planner-<email>`, `target:"chat"` `source:"planner"`) with a
  **Resend owner backstop** if the webhook is down. Stores `{ email, island/days/profile summary, the
  full plan text, sourcePage:"/plan" }`. The **goldmine** — segmented, intent-rich.
- **Photos (deferred):** `InvItem.image?` slot exists and renders only when present. Owner will do a
  one-month top-tier paid stock pass (download → cancel), high-def; performance is NOT a constraint on
  this page (it's noindex, a lead magnet). Dropping the images in is a pure data change — no code.
- **Honesty/compliance:** FTC affiliate disclosure in the email + page footers. One soft, honest
  Oahu-picnic line (only when the island is Oahu) — TODO in the builder copy.

---

## 6. Placement, branding, design

- **Under-ToC bubble** on every post (the owner's ask) → opens the builder with the post's island
  pre-set. Distinct on-brand color from the teal first-screen bubble (e.g., a warm **gold `#dda53a`**
  or **lilac** block) so they read as two different offers, not a repeat.
- **`/plan`** standalone page for off-site traffic.
- Design per `DESIGN.md`: pills, Inter/JetBrains Mono, pastel blocks, **magenta stays reserved** for
  the sticky CTA. Mobile-first (full-screen sheet); desktop = two-pane (chat/pills left, live itinerary
  right). Lighthouse a11y must stay 100 (focus management, labels on every pill).

---

## 7. Phased build plan (each phase ships independently)

| Phase | Deliverable | Notes |
|---|---|---|
| **0** | **This doc + owner decisions** (§9) | the gate before code |
| **1** | **Inventory foundation** — `inventory.ts` schema + `scripts/build-inventory.mjs` scaffold from posts/tours + hand-enrich the top ~100 items; `lib/islands.ts` (lift the Expedia map); static distance matrices | the data is the moat; do it first |
| **2** | **Builder UI + rule engine (no LLM)** — `<ItineraryBuilder>` client component, pill state machine, assembler, live preview, affiliate cards, cost strip. Fully usable, $0 to run | the product is real here |
| **3** | **LLM glue** — `plan-llm` function for free-text → prefs, personalized prose, ad-hoc Q&A | reuse chat.ts patterns |
| **4** | ✅ **Emailed link + lead capture** — `plan-email` function, Resend, share-token codec, lead store, `noindex` page, photo slots | the lead magnet (NO PDF) |
| **5** | **Distribution + polish** — under-ToC entry site-wide, the deferred high-def photo pass, analytics/GA4 event, A/B the hook, "add another island," seasonal/weather awareness, luau-thin-day tuning | growth |

Recommended first milestone to **demo value fast:** Phases 1–2 on **Oahu only** (our deepest content),
rule-based, no LLM, no PDF — a working live planner. Then Maui, then LLM, then the emailed-link lead magnet.

---

## 8. Risks & mitigations

| Risk | Mitigation |
|---|---|
| LLM hallucinates a hotel/price/closure | Rule-based assembly from curated inventory; LLM never sources facts |
| Static export can't do dynamic | All dynamic in Netlify Functions (chat.ts precedent) + client compute |
| Inventory upkeep burden | Auto-scaffold from posts (our single source of truth); enrich incrementally |
| Affiliate link rot / wrong island | Reuse the per-island map + the existing `curl`/island-verify discipline |
| Serverless PDF cold-start/size | Start server-side; client-side `@react-pdf` fallback if heavy |
| Drive-time accuracy | Static hand-tuned matrix (free, good enough); optional Maps API later |
| Privacy (storing emails/trips) | Same handling as current leads; clear consent on the email-gate; disclosure |
| Cost creep | Pills/assembly are $0; LLM short + prompt-cached; monitor per-plan cost |

---

## 9. Open decisions for the owner (I need these before Phase 1)

1. **Email gate:** preview the plan free, **email-gate only the PDF/save** (recommended — best
   lead/friction balance)? Or email-gate the whole thing (more leads, more bounce)?
2. **Launch islands:** start **Oahu + Maui** (deepest content), add Kauai/Big Island later — or all four
   day one?
3. **Inventory enrichment:** OK to invest a **one-time hand pass on ~100 top items** (geo/duration/
   price/bookAhead)? (This is the main human effort; everything else is code.)
4. **PDF path:** server-side (brand control, recommended) vs client-side (simpler) for v1?
5. **Name + entry color:** "Aloha Planner"? and which pastel block for the under-ToC bubble (gold/lilac)?
6. **Standalone `/plan` page** at launch, or under-ToC bubble only for v1?
7. **Maps/drive-times:** static matrix for v1 (free, recommended) — any appetite for a Maps API later?
8. **Model:** Haiku for the cheap glue, Sonnet for the personalization pass — or all Sonnet for quality?

---

## 10. Why this is worth building (the business case)

- **Lead magnet:** a personalized itinerary PDF is a far stronger email capture than a newsletter
  box — the visitor gets real, immediate value and we get island + dates + party + interests.
- **Affiliate revenue:** every plan is a basket of bookable tours + a hotel pick — monetized at the
  exact moment of intent, not hoped-for later.
- **Engagement + SEO:** the planner links back into our posts (session depth, the truest ranking
  signal), and turns 160 standalone guides into one connected product.
- **Moat:** it's built on content we already own and trust — competitors with a bare LLM can't match
  the accuracy or the affiliate integration without the underlying guides.
- **Synergy with the core business:** an Oahu trip profile is a warm lead for picnics/proposals/events.

---

*Built from the existing stack: Next 15 static export, Netlify Functions, Anthropic SDK (chat.ts),
Resend, Viator/Expedia affiliates, GA4. No new top-level folders; new code lives in
`components/`, `lib/`, `content/itinerary/`, `netlify/functions/`, `scripts/`.*
