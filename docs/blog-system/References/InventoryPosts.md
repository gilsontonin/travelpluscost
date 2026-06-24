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
| `::hotel <lpId>` | Photo-forward property card (score badge, "See your price", no $) | `getDirectoryHotel` (pre-fetched) |
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

## 3. Inventory-first layout (the OTA pattern, our honest version)
For market posts (`region: { name, destination }` set) the template renders **H1 → search bar → hero rail of top hotels → cover → TL;DR → body**, and the body **leads with inventory** (`::areas`/`::rail`/`::hotel`) with the deep editorial prose **collapsed in `::details`** below. "Where to stay" intent = research hotels; the big brands lead with property and bury the text. We match the structure but keep the honest line: **review scores + "search current prices," never a stamped $X, a "Deal" badge, or urgency.** Collapsed text still counts for SEO, so we lose nothing.

## 4. CTR titles + descriptions (from the competitor study)
Every ranking "where to stay" page uses **keyword + (year) + "Best Areas" + "Hotels"/"Resorts"** (often + area names, "rates"). Generic "Area Guide" leaves CTR on the table.
- **Title** (≤60, doubles as H1): `Where to Stay in <City>, <ST>: Best Areas & Hotels (<year>)` — keep the exact keyword phrase contiguous (a comma/colon after the city is fine).
- **Description** (≤160): `Where to stay in <City> in <year>: best areas — <a1>, <a2>, <a3> — with real hotels and honest rates, matched to your trip.`
Google rewrites long-tail titles, but *from the ingredients you give it*; the **description is the snippet → the direct CTR lever**, so stack it with `hotels` / `rates` / `<year>` / area names.

## 5. Photos — use our own inventory, and ALWAYS inspect
We hold a huge amount of real hotel imagery (directory thumbnails + ~30 images per ingested-region hotel, on `static.cupid.travel`). The hero (now **`HotelList`** — big vertical cards, see §3) and `::hotel` / `::rail` render them with alt **"Name — hotel in City"**.

**Cover photo rules (owner-mandated):**
- **INSPECT every candidate before using it.** The `Read` tool can't open a URL, but it *can* view a local image — so `curl` each candidate to the scratchpad and `Read` it. Never pick a cover (or a card photo) blind. (This is how the dull gray Branson lake shot slipped through — don't repeat it.)
- For a **"where to stay" cover, prefer a famous property's best photo** (e.g. Branson → *Chateau on the Lake*, 9.0/1,616) — pull thumbnails from the directory by review count / name and inspect them. A **cute, colourful town/destination shot is fine too** (e.g. Telluride's autumn box-canyon) — the bar is *colourful and alive*, never grey/hazy/dead-tree stock.
- Pick a property that **isn't already the first hero card or a `::hotel` card** (avoid showing the same photo twice).
- A property cover credits as `{ name: "<Property>, <City>" }` (no `url`) — the cover caption only appends "on Unsplash" when the credit url is an unsplash link.

*Next:* a `::photo <id>` directive for standalone in-body hotel images, and count hotel photos toward the visual-cadence gate.

## 6. The long-tail pSEO program — "every city we can win"
**Selective, quality-gated, measured** — never spray-and-pray (that trips Google's scaled-content-abuse, fatal on a new domain). Real data-backed pages (property pages, city hubs, researched guides) are legitimate and strong; thin templated editorial at scale is not.

1. `npm run blog:opportunities` — US cities ranked by real directory inventory (≥8 hotels ≈ 2,006 cities). Skip big-comp metros; target under-covered tourist towns.
2. **Semrush-vet** candidates (vol + KD); aim KD ≤ ~30 + real demand. *Validated wins:* Branson KD 18/480, Telluride KD 21/480, Charleston KD 28/1,300.
3. `npm run blog:hotels -- <city>` (directory mode) → real hotel ids + paste-ready directives. Set the post's `region: { name, destination }`. `::areas` skips for non-region cities — cover neighbourhoods in prose from the SERP/WebSearch research instead.
4. Write a **dedicated, researched** post (real serp-optimize brief + real neighbourhoods), inventory-forward, looping the §2 gates.
5. **Ship + measure** (GSC indexing + ranking, 4–8 weeks), then scale what works.

**Guardrails / lessons:**
- **Inventory gate:** ≥ ~8 hotels or skip (thin pages hurt).
- **serp-90 is a BIG-city bar.** On thin, small-band, low-KD city SERPs the no-stuff ceiling is ~mid-70s — accept it (a KD < ~25 keyword ranks well below 90). Use the heading lever + real coverage; never stuff to a number on a long-tail page.
- **Trust the serp SCORE over the word-band on these.** serp-optimize's length band is unstable on JS-heavy competitor pages — for Telluride it flickered between 1,119–1,287 and 1,848–2,507 across runs (same URLs) depending on how much each dynamic page rendered. The *score* is stable; the *band* flag is noisy. Build genuinely thorough coverage (match the deeper competitors), let the score confirm it, and don't pad/trim to chase the band. Telluride shipped at 1,669w / **serp 82** (heading 100%) — its competitors were genuinely deeper than Branson's.
- **Same-name cities** (Charleston SC/WV, Springfield, Portland) — directory queries mix states; add state disambiguation before those, or start collision-free.
- **Cannibalization:** the blog "where to stay" post vs the `/hotels/<city>` hub — different intent (guide vs listings); cross-link, don't compete.
- **Ramp** (new domain): publish in batches, measure, scale — not thousands at once.
- Slowest per-city steps: cover sourcing + reading-grade tuning.

## Session state (for the next run)
Live posts: `surveillance-pricing`, `where-to-stay-in-oahu`, `where-to-stay-in-maui`, `where-to-stay-in-branson` (city pilot #1, serp 74), `where-to-stay-in-telluride` (city pilot #2, serp 82). Shipped: Semrush wiring + keyword ledger + `blog:keywords`; the widgets + inventory-first layout; the pSEO toolkit (`blog:opportunities` / `blog:hotels` directory mode / `blog:scaffold` / `blog:areas`); the post-stats directive-strip fix; CTR titles + hotel-photo alt. **Next:** `::photo` + cadence-count hotel photos; Charleston (after SC/WV state disambiguation, KD 28 / vol 1,300); then the next tier from `blog:opportunities`; request GSC indexing for the live posts + measure rankings.
