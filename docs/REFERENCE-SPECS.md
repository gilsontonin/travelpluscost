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
