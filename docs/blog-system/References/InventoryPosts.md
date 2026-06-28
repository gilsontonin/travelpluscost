# Inventory-forward & city posts — the playbook

> Banked from the build-in-public session that added the conversion widgets, the inventory-first
> layout, the CTR title formula, and the long-tail "where to stay in <city>" pSEO program. Read this
> alongside `TheBible.md` (gates), `Semrush.md` (keyword research), `WritingLessons.md` + `enhance-with-surfer.md`
> (raise the serp score without stuffing). Plumbing: `src/lib/blogBody.ts` (parse + helpers),
> `src/components/blog/PostBody.tsx` (render), `src/app/blog/[slug]/page.tsx` (pre-fetch + top search bar + hero rail).

## 1. Two post types
- **Brand/transparency** (e.g. `surveillance-pricing`) — editorial, the manifesto angle.
- **"Where to stay" destination** — two tiers:
  - **Ingested markets** (Oahu, Maui, Las Vegas, Seattle, San Diego — have `content/<slug>.json` + a `regions.ts` entry): rich neighbourhood guides, area-grouped, serp ≥90 achievable.
  - **Long-tail city pSEO** (any of the ~2,006 US cities with ≥8 directory hotels): dedicated, *researched* guides for under-covered towns the big brands template thinly. serp ~75 is fine here (see §6).

## 2. Conversion widgets (directives) — one per line, blank line around it
| Directive | Renders | Data |
|---|---|---|
| `::hotel <lpId>` | Photo-forward property card — score badge + a live **"from $X/night · all-in"** SSP + "See rooms" ("See your price" when no near-term availability) | `getDirectoryHotel` + `/api/prices` via `BlogPriceProvider` |
| `::rail <dest>` | Carousel of real area hotels | `searchDirectory` |
| `::map <dest>` | **"View on map" button** → `/search` (NOT an embedded Leaflet map — it broke mobile/screenshots) | link |
| `::compare <id> <id>` | Honest side-by-side (real fields, no fake "deal") | pre-fetched |
| `::areas <dest>` | Area cards with **live hotel counts** | `region.cities` + `cityHotelCount` (region markets only; skips otherwise) |
| `::search <dest>` | Inline honest-price search box → `/search` | also pinned at top via the template for `region` posts |
| `::cta <dest>` | Compact "See live <dest> prices" button | link |
| `::priceproof` | The "same price on every device" trust panel — our signature | static |
| `::infographic <key>` | Native infographic | `src/lib/infographics.ts` |
| `::details <summary> … ::/details` | Collapsible "Read more" (native `<details>`) — buries long-tail prose **while keeping it crawlable + serp-scored** | — |

The QA scripts strip `::` lines from the prose word count (post-stats + serp-optimize), so directives don't inflate the length band.

## 3. Inventory-first layout (Hotels.com-style, our honest version) — auto-rendered for `region` posts
Set `region: { name, destination }` and the blog template (`src/app/blog/[slug]/page.tsx`) renders, in order, all client-side and isolated to the blog:
1. **Hero photo + a white stacked search card overlapping it** — the cover image is the hero; `BlogSearch` sits over its bottom with **Where-to / Dates / Travelers stacked full-width + a full-width Search button** (`src/components/blog/BlogSearch.tsx`). (Non-region posts keep a normal cover figure lower down.)
2. **"Check prices for these dates" quick picker** — `BlogDatePicks` (Tonight / Tomorrow / This weekend / Next weekend, auto-computed); each opens `/search` **preprogrammed** with destination + those dates + travelers.
3. **The inventory as the REAL search-result card** — `BlogStaysList` reuses the `/search` card (`HotelRow`) and shows a **live "from $X/night · all-in" price** (client-fetched from `/api/prices`).
4. Then **TL;DR → body**. Body leads with inventory; **every `::hotel` card also carries a live price** (one batched `/api/prices` call via `BlogPriceProvider` wrapping `PostBody`).

Honest line preserved everywhere: **SSP (the public price, same for everyone), "from" + the property page has live rates for the reader's dates — never a stamped fake $X, "Deal" badge, or urgency.** `HotelList` (the old big-vertical-card hero) is **retired**, replaced by `BlogStaysList`. NEVER touch the home page for a blog ask (a home-page detour broke its rails — reverted).

## 4. CTR titles + descriptions (from the competitor study)
Every ranking "where to stay" page uses **keyword + (year) + "Best Areas" + "Hotels"/"Resorts"** (often + area names, "rates"). Generic "Area Guide" leaves CTR on the table.
- **Title** (≤60, doubles as H1): `Where to Stay in <City>, <ST>: Best Areas & Hotels (<year>)` — keep the exact keyword phrase contiguous (a comma/colon after the city is fine).
- **Description** (≤160): `Where to stay in <City> in <year>: best areas — <a1>, <a2>, <a3> — with real hotels and honest rates, matched to your trip.`
Google rewrites long-tail titles, but *from the ingredients you give it*; the **description is the snippet → the direct CTR lever**, so stack it with `hotels` / `rates` / `<year>` / area names.

## 5. Photos — use our own inventory, and ALWAYS inspect
We hold a huge amount of real hotel imagery (directory thumbnails + ~30 images per ingested-region hotel, on `static.cupid.travel`). The hero (`BlogStaysList` = the real `HotelRow` search card, see §3), the `::hotel` cards, and `::rail` render them with alt **"Name — hotel in City"**.

**Cover photo rules (owner-mandated):**
- **INSPECT every candidate before using it.** The `Read` tool can't open a URL, but it *can* view a local image — so `curl` each candidate to the scratchpad and `Read` it. Never pick a cover (or a card photo) blind. (This is how the dull gray Branson lake shot slipped through — don't repeat it.)
- For a **"where to stay" cover, prefer a famous property's best photo** (e.g. Branson → *Chateau on the Lake*, 9.0/1,616) — pull thumbnails from the directory by review count / name and inspect them. A **cute, colourful town/destination shot is fine too** (e.g. Telluride's autumn box-canyon) — the bar is *colourful and alive*, never grey/hazy/dead-tree stock.
- Pick a property that **isn't already the first hero card or a `::hotel` card** (avoid showing the same photo twice).
- A property cover credits as `{ name: "<Property>, <City>" }` (no `url`) — the cover caption only appends "on Unsplash" when the credit url is an unsplash link.

*Next:* a `::photo <id>` directive for standalone in-body hotel images, and count hotel photos toward the visual-cadence gate.

## 6. The long-tail pSEO program — "every city we can win"
**Selective, quality-gated, measured** — never spray-and-pray (that trips Google's scaled-content-abuse, fatal on a new domain). Real data-backed pages (property pages, city hubs, researched guides) are legitimate and strong; thin templated editorial at scale is not.

**One command to start:** `npm run blog:next -- <city>` is the macro — it pre-flights the city's inventory, emits the production scaffold (or a QA/redo note if the post already exists), and prints this entire runbook with every command **city-filled**. Work it top to bottom. The numbered steps below are exactly what it lists.

1. `npm run blog:opportunities` — US cities ranked by real directory inventory (≥8 hotels ≈ 2,006 cities). Skip big-comp metros; target under-covered tourist towns.
2. **Semrush-vet** candidates (vol + KD); aim KD ≤ ~30 + real demand. *Validated wins:* Branson KD 18/480, Telluride KD 21/480, Charleston KD 28/1,300.
2b. **STEP 1 scan + STEP 2 research (before writing):** `npm run blog:scan` + `blog:serp` (TARGET SPEC + ★gaps), then facet-driven research → `research-brief-<slug>.md` (10–30 facets by depth). See `BLOG-PROMPT.md §3` + `ResearchBrief.md`.
3. `npm run blog:hotels -- <city>` (directory mode, **rate-verified**) → rate-checks every candidate via `/api/prices` (a midweek night ~3 wk out) and returns **only hotels that come back with a live rate** + a name-spam guard, ranked, with paste-ready directives + each hotel's "from" price. This drops the junk that slipped the `kind=rental` purge: vacation-rentals mis-tagged `kind=hotel`, timeshares, direct-only resorts. **Only card hotels from this pool** (`--fast` skips the check). Set the post's `region: { name, destination }`; `::areas` skips for non-region cities — cover neighbourhoods in prose.
4. `npm run blog:scaffold -- <city>` (directory mode) → a **paste-ready production skeleton**: CTR title + region block, at-a-glance area table, one section per discovered area (city-scoped `::rail` + the top rate-verified hotel's `::hotel` card per the card rule), a roundup of more bookable hotels, the pricing block + `::priceproof`, and an FAQ stub — **every id real + rate-verified, every area city-scoped**, with a footer listing the full verified pool. Paste into `src/lib/posts.ts`.
5. Write the **dedicated, researched** prose into the `<!-- … -->` stubs (real serp-optimize brief + real neighbourhoods), inventory-forward, looping the §2 gates.
6. **Ship + measure** (GSC indexing + ranking, 4–8 weeks), then scale what works.

**Guardrails / lessons:**
- **Inventory gate:** ≥ ~8 **rate-verified** hotels or skip (`blog:hotels` warns when the verified pool is under 8).
- **Data hygiene — NEVER card a hotel that doesn't return a live rate.** The `kind=rental` purge missed vacation-rentals/timeshares/condos mis-tagged `kind=hotel` (e.g. "Luxury Condos … Beautifully remodeled", Palace View timeshare, direct-only Big Cedar). The live-rate check (`blog:hotels`, rate-verified by default) is the definitive filter — a card with no price is a dead end, and at 3,000 posts that's 3,000 broken cards.
- **Hit the playbook's serp ≥ 90 bar** (`BLOG-PLAYBOOK.md` §2/§4 — "stopping at 88–89" is forbidden corner-cut #1). Loop the scorer's ADD list top-down with the heading lever + match the competitor median length + add real subtopics/entities; **never stuff.** If a genuinely thin SERP density-caps the score below 90, that's an **EXEC-DECISION you STOP and report with the numbers** (§4.12) — *not* a default to "accept ~75." (Branson 74 / Telluride 82 shipped under an earlier shortcut and are slated to be redone to the playbook standard.)
- **Trust the serp SCORE over the word-band on these.** serp-optimize's length band is unstable on JS-heavy competitor pages — for Telluride it flickered between 1,119–1,287 and 1,848–2,507 across runs (same URLs) depending on how much each dynamic page rendered. The *score* is stable; the *band* flag is noisy. Build genuinely thorough coverage (match the deeper competitors), let the score confirm it, and don't pad/trim to chase the band. Telluride shipped at 1,669w / **serp 82** (heading 100%) — its competitors were genuinely deeper than Branson's.
- **Same-name cities** (Charleston SC/WV, Springfield, Portland) — directory queries mix states; add state disambiguation before those, or start collision-free.
- **Cannibalization:** the blog "where to stay" post vs the `/hotels/<city>` hub — different intent (guide vs listings); cross-link, don't compete.
- **Ramp** (new domain): publish in batches, measure, scale — not thousands at once.
- Slowest per-city steps: cover sourcing + reading-grade tuning.

## 7. CTA & relational linking — the marketing-hat pass (every section)
**Replicable rule for every post, every section.** Before shipping, wear the marketing hat at each H2/H3 and answer:
- **What's the CTA?** One action the reader should take here — *book this hotel · search this area · compare A vs B · see this area's stays*. Every section ships with a ready-made CTA; no section is a dead end.
- **Which hotels did I mention?** Any hotel named in the section → a `::hotel` **card** or a **link to that hotel**. Path of least resistance: see a hotel, book it right there (the "card rule" — also applies to hotel-named H2/H3s).
- **Is it relational + correct?** Every `::rail`/`::search`/`::map`/`::cta` and `/search` link must resolve to the **right hotel/city — never a leak.** `::rail <area>` is now **city-scoped** via `hotelsInArea` (NAME-SEED within the post's city — hotels whose name contains the area — condo-filtered, **≥3 else city-wide fallback**), so `::rail Thousand Hills` / `::rail Table Rock` return that area's hotels and never leak to the *Las Vegas* Strip; run `npm run blog:areas -- <city>` to see which areas have ≥3 hotels. **Inline `/search?destination=<area>` links are still city-level** — point those at the **city** (`/search?destination=Branson`) until the search page gets the same area support. `::areas` widgets remain clean only on **multi-city regions** (Maui → `::rail Wailea`).

**Tool:** `npm run blog:cta -- <slug>` (Gemini + the directory). Per section it surfaces the suggested CTA, the directory hotels mentioned (matched to real ids → carded ✓ or a **gap**), and any destination that doesn't resolve to this post's city (**🔴 LEAK?**). It SURFACES — *you* reason and **hand-curate**: did I maximise the CTA? Is every card/link the correct hotel? Fix gaps + leaks by hand; the matcher can miss or leak, so never apply blind. Target: 0 leaks, every mentioned hotel actioned, a CTA in every section.

## Session state (for the next run)
Live posts: `surveillance-pricing`, `where-to-stay-in-oahu`, `where-to-stay-in-maui`, `where-to-stay-in-branson` (city pilot #1 — **rewritten to the playbook standard: funny-first voice, serp 90, the full UI below**), `where-to-stay-in-telluride` (city pilot #2, serp 82 — slated for the same redo). Shipped: Semrush wiring + keyword ledger + `blog:keywords`; the **Hotels.com-style inventory-first UI** (§3: hero photo + stacked `BlogSearch` overlay + `BlogDatePicks` quick picker + `BlogStaysList` priced search cards + live prices on `::hotel` cards via `BlogPriceProvider`); the **card rule** (hotel-named heading → its card); `blog:cta` (per-section CTA + relational/leak auditor, §7); the pSEO toolkit — **`blog:next` macro** (one command: pre-flight + scaffold + city-filled runbook) wrapping `blog:opportunities` / `blog:hotels` rate-verified / `blog:scaffold` v2 (directory production skeleton) / `blog:areas` (neighbourhood discovery) / `blog:cta`; CTR titles + photo-inspection rule. **Next:** the 5-job template build is mostly DONE (2026-06-24 — JOB1 rate-verified pool, JOB2 `hotelsInArea` + city-scoped `::rail <area>`, JOB3 `blog:scaffold` v2, JOB4 `blog:next` macro); **JOB5 left: OTA UI patterns** (map pins, sticky CTA, review quote, intro stats). Then: the less-text/more-inventory `::details` restructure (PAUSED — owner call); roll the Branson treatment to Telluride/Maui/Oahu; Charleston (after SC/WV state disambiguation); GSC indexing + measure.
