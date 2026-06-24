# Reference specs — patterns, not pixels

How we borrow proven OTA UX (Expedia/Booking/Hotels.com) **the right way**: we replicate the *blueprint*
— where things sit and why, which CTAs at which positions, how each page behaves, how pages interlink —
and rebuild it in **our own design** (Airbnb-coral, our components, our data). We never copy their code,
images, copy, brand, or dark patterns (fake scarcity, strikethrough "discounts", urgency timers — these
violate `docs/POSITIONING.md`). Take the proven *structure*, drop the manipulation.

## The loop
1. **Reference** — drop annotated screenshots into `design/refs/` (gitignored — they're someone else's IP).
2. **Blueprint** — fill the template's spec below: regions top→bottom, CTA positions, behaviors, interlinks.
3. **Build** — implement to match *layout & proportions* (not pixels), in our components.
4. **Shoot** — `npm run shoot -- /hotels/las-vegas` captures OUR page (desktop + mobile, full-page) to
   `design/shots/<timestamp>/`. Compare side-by-side with the reference; fix deltas.

Spec format per template: **Reference · Layout (top→bottom) · CTAs & positions · Behaviors · Interlinking
· Our build (status) · Deltas / TODO.**

---

## City hub — `/hotels/<city>`  ← current focus

The standard "Hotels in {City}" destination page (common across the majors).

**Layout (top → bottom)**
1. Breadcrumb: Home › Hotels › {State} › Hotels in {City}.
2. H1 "Hotels in {City, ST}" + compact summary (count, top guest score, a location anchor). *No wall of prose up top.*
3. Relevance row — one horizontally-scrollable chip line (sort/category), never wrapping.
4. Inventory immediately — the hotel list (photo collage + name + rating + location + price/night + the card is the CTA).
5. SEO content below the fold — about the city, FAQ, "why cheaper here".
6. Interlinking — same-state cities + "all {State} hotels"; footer link clusters.

**CTAs & positions**
- Whole card → property page (primary, repeated down the list).
- Sticky bottom bar (mobile-first) → **View map**.
- End of list → **See all {N} hotels in {city}** → full search.
- Each chip → re-slices the list in place (no reload).

**Behaviors**
- Prices: lazy, per visible card, debounced (indicative "tomorrow night"); dates ride into the card link so the click matches.
- Map: list⇄map toggle; map is lazy-loaded (not on first paint).
- Categories: client-side filter/sort; a chip only appears when it has a real set behind it.

**Interlinking**
- Up: city → state hub → /hotels index → home. Down: city → property. Lateral: city → sibling cities.

**Our build — status (live)**
- ✅ Breadcrumb w/ state · ✅ compact header · ✅ chip relevance row (`CityResults`) · ✅ inventory-first
- ✅ lazy tomorrow-night prices · ✅ list⇄map · ✅ sticky bottom "View map" bar · ✅ FAQ/promise below · ✅ same-state links
- Files: `src/app/hotels/[city]/page.tsx`, `src/components/CityResults.tsx`, `HotelRow`, `MapResults`.

**Deltas / TODO** (fill from your Expedia reference)
- [ ] Does the reference keep a sticky **date/search bar** at the top on scroll? (ours has none on the hub)
- [ ] Card anatomy match: photo ratio, where price/rating/badges sit vs. ours (`HotelRow`)
- [ ] Sticky bottom bar: map only, or split (Map + a price/sort action)?
- [ ] Inline mini-map near the top (desktop) vs. our toggle-only approach?
- [ ] "Popular/Top areas" or neighborhood module — only if we have the data (we don't yet)

### Observed Expedia mobile structure (recording 2026-06-23) — the SEO-rich stack

Top → bottom on `expedia.com` "Hotels in Las Vegas" (mobile). Each module targets a related search
intent + adds internal links. **Bold = honest fit for us. ~~strike~~ = skip (positioning).**

1. Header + breadcrumb (Nevada › Las Vegas) → hero destination photo → **H1 with price hook
   ("Find hotels in {city} from ${low}")** → search widget → value props (upfront price, etc.)
2. **Quick date chips** — Tonight / Tomorrow / This weekend / Next weekend (+ View map + Filter)
3. **"Our top choices"** — numbered cards: photo, name, stars, location, rating + review count,
   1-line blurb, $/night + total + "taxes & fees included"
4. ~~Vacation rentals carousel~~ · ~~"sign in to save 10%" member-price banner~~
5. **Top hotel reviews** (photo + quote) · **"More cheap stays"** (budget cards)
6. **"Hotels with {star} rating"** + **"by price"** groupings — query-targeted link sections
7. ~~Price trends / cheapest months~~ (no data) · **Attractions** (we have Viator real data)
8. **Destination editorial** (Recreation/Nightlife/etc.) — the hard one: needs real, accurate copy,
   not fabricated. Defer or generate only from data we actually have.
9. **"Find great hotels in {city}"** — paragraphs on specific top hotels (real, from our data)
10. **Footer link clusters** — popular cities / nearby / state hubs (we have the geo graph for this)

**Build plan for our SEO-rich city hub (honest data only):**
- [ ] H1 price hook "Hotels in {city} from ${low}/night" (real low from /api/prices)
- [ ] Quick date chips (Tonight/Tomorrow/Weekend) → drive the indicative price + into search
- [ ] Themed crawlable sections below inventory: **Top-rated · Budget/Cheapest · Luxury (4–5★) ·
      Resorts** — real hotels, each a query target + internal links
- [ ] **Things to do in {city}** via `ViatorPackages` (real attraction data)
- [ ] Footer/interlink clusters (popular + nearby + state) — extend what we have
- [ ] Honest destination context only (landmark proximity, star mix, price range) — never faked editorial

### Observed Trivago mobile structure (recording 2026-06-23) + the hybrid model

Trivago "Hotels in Las Vegas" (mobile). Bold = take it (honest fit). ~~strike~~ = skip.

- **Cards**: ~~"See prices from N sites" (meta-search price comparison)~~ — opposite of our one-price model.
  **Take**: "From $X" + a clear price/CTA; a **"Popular choice" badge** (honest: high review volume);
  amenity tags (need data we don't have at directory level); save/share on the card.
- **"These hotels may also be interesting for you"** — flat text-link list of specific hotels (cheap,
  crawlable internal linking). **Take it** (nearby/other top hotels as text links).
- **City Districts** (Hotels in Downtown…) + **Points of Interest** — neighborhood hubs. We have **no
  neighborhood data** → skip/honest until we do.
- ~~"When to book" seasonality~~ (no price-history data) · **Amenity FAQs** ("best pool/spa hotels in
  {city}") — needs per-hotel amenity flags in the directory (future enrichment).
- **Footer**: Top + More Destinations — we already have the Popular-destinations cluster.

**Hybrid model — what each does best, and our synthesis:**
- *Card display*: Expedia = whole card is the link, price bottom-right. Trivago = explicit "See prices"
  button + badges + save/share. **Us**: keep whole-card link, but our price block is our **edge** — lean
  into **"one honest price · same for everyone"** vs their "from $X across N sites" opacity. Add a real
  **"Popular" badge** (review volume) and (optional) a **save heart**.
- *Internal linking*: Expedia = themed module stack + footer clusters; Trivago = districts + "also
  interesting" hotel lists + Top/More destinations. **Us**: themed rails ✅ + popular cluster ✅; add a
  **text-link "you may also like" hotel list** (Trivago) and, when we have the data, **amenity sections**
  ("pool/spa hotels in {city}") and **neighborhood hubs**.
- *Honesty edge over both*: they obscure price (comparison/urgency); we show one transparent number.
  That's a feature to **emphasize on the card**, not hide.

---

## Backlog templates (stub — fill when we get there)

### Home — `/`
Reference · Layout · CTAs · Behaviors · Interlinking · Build · Deltas — _TODO_

### Search results — `/search`
Reference · Layout · CTAs · Behaviors · Interlinking · Build · Deltas — _TODO_
(Much of this already exists in `ResultsList`: chip row, sort, list⇄map, infinite scroll, live prices.)

### Property — `/hotels/<city>/<slug>`
Reference · Layout · CTAs · Behaviors · Interlinking · Build · Deltas — _TODO_
(Already built to the Expedia property pattern: hero carousel, rooms, sticky price CTA.)

### State hub — `/destinations/<state>` · Browse — `/hotels`
Reference · Layout · CTAs · Behaviors · Interlinking · Build · Deltas — _TODO (after city hub is dialed)_

### Checkout — `/book`
Reference · Layout · CTAs · Behaviors · Interlinking · Build · Deltas — _TODO_
