# Design system — read before building or restyling any page

The site uses a **Figma-style editorial system**: a monochrome black-and-white frame
interrupted by oversized pastel **color-block** sections. Source spec: `Design/FigmaLikeDesign.md`.
Tokens live in `tailwind.config.ts`; helper classes in `app/globals.css` (`@layer components`).

## Non-negotiables
- **Monochrome core.** Black ink (`text-black`) on white (`bg-white`). Weight, not gray, carries
  hierarchy. The one accent is **magenta `#ff3d8b`** — reserved for a *single* standout promo CTA
  (the sticky "Plan your event" button). Don't sprinkle it.
- **Pills only.** Every button is `rounded-pill`. Primary = black (`fig-btn fig-btn--primary` /
  `Button variant="primary"`), secondary = white + hairline border. No square buttons, no gradients.
- **Pastel color blocks** for storytelling sections — `bg-block-{lime,lilac,cream,mint,coral,navy}`,
  `rounded-[24px]`, generous padding (`fig-block`). Navy block uses white text. Return to white
  canvas between blocks.
- **Type:** Inter (`font-sans`) for everything, JetBrains Mono (`font-mono`) for **eyebrows + captions
  only** (uppercase). Helper classes: `fig-display` (hero), `fig-display-2` (section titles),
  `fig-headline`, `fig-eyebrow` (13px mono), `fig-tag` (mono chip).
- **Shadow-light.** Color blocks are the depth device — no drop shadows on sections/cards (hairline
  borders instead). The one shadow exception: the magenta sticky CTA + the checkout modal.
- **Buttons are 16px** (`fig-btn`) — the spec's literal 20px wrapped the nav, so we use a practical
  size. Eyebrows 13px (spec's 18px read too large).

## Layout patterns
- **Index/hub pages are cards-led:** tight hero (eyebrow + `fig-display-2` + one line) → cards →
  one slim supporting line that keeps the SEO internal links. No intro walls before the cards.
- **Hero:** photo with a dark gradient + overlapping display type; first in-body image eager (LCP).
- **Container:** `container-x` (max ~1200px). Section rhythm: `section-y`.
- Mobile: nav collapses to brand + the menu under a hamburger below `lg`; CTAs go full-width;
  display type clamps down.

## Accessibility (keep Lighthouse a11y = 100)
- Body/blurb text on pastels must be dark enough — use `text-black` / `text-black/70`, not faint grays.
  Don't put `text-black/50` or lighter on small text; on navy use `text-white/65`+.
- Links/buttons: visible text must match the accessible name (no aria-label that differs). Use real
  `<dt>/<dd>` only inside a true `<dl>` (or use plain divs).
- Every `<img>` needs a real `alt`. The QA gate (`npm run check`) enforces these.
- **Don't put text on top of photos** (cards = image on top, text below on white). Photos vary too much
  to stay legible. **The hero is the only exception** — and it needs a strong scrim + explicit
  `text-white` (the base `h1–h4 { color: ink }` rule otherwise renders headings dark). Lighthouse can't
  measure text-on-image contrast, so this is a hard design rule, not a checker rule.

## Visuals (it's a visual business — keep retention high)

- **Cadence:** a visual roughly **1 per 2 H2 sections** — image, infographic,
  `::tour` card, or color-block aside. `scripts/post-stats.mjs` reports a visual count vs target.
- **Photos:** real client photos > a cheap real styled shoot > **AI scene images** (`scripts/gen-image.mjs`,
  FLUX via fal.ai, needs `FAL_KEY`; ~$0.003–0.025/img) > free Unsplash/Pexels for real Hawaii scenery.
  AI = **representative scene-setting only**; never passed off as a real client event or a specific real
  property/person. Review every output (hands/faces/food). Save to `public/images/posts/*.webp`.
- **Infographics (`::infographic <key>`, data in `content/infographics.ts`):** kinds = island-selector,
  season-timing, cards, steps, compare, **stat-panel** (big scannable numbers in rotating pastel cells).
  Native HTML/SVG → visual *and* crawlable (don't use AI images for data — it garbles text). Add a new
  kind = type in `infographics.ts` + a `renderInfographic` case in `lib/markdown.ts` + `.ig-*` CSS in
  `globals.css` (use literal class names — Tailwind tree-shakes interpolated ones).
- **Maps:** when wired, branded location maps via **Mapbox Static API** (free tier) / MapLibre — not AI.

## Affiliate hubs (how to extend)
- **Things to Do** (`/things-to-do/`, Viator) — data in `content/viatorTours.ts` (code→tour), page
  groups by island. Add a tour: confirm its Viator URL maps to the **correct island** (group by the
  `/tours/<Island>/` path — wrong-island cached codes exist), then add the code to that island's list
  in `app/things-to-do/page.tsx`. Cards via `<TourCard code="…" />`; supplier media is hotlinkable.
- **Where to Stay** (`/where-to-stay/`, Expedia) — data in `content/hotels.ts`, grouped by theme
  (resorts/budget/boutique/family). Add a hotel object: name, island, `area`, `tier` ($$–$$$$),
  `theme`, blurb, `image`, `alt`, `expediaArea`. Evergreen with **no API**: cards link to your
  existing Expedia **affiliate destination link** via `expediaArea`; add an optional `url` for a
  direct property affiliate link later. Show a **tier, not a live price**. Images are
  **area-representative AI/scenery** (no on-photo text — see the no-text-on-photos rule) until real
  property photos exist — never imply a photo is the exact property.

## Adding a new experience/theme (e.g., Photoshoots)
1. Add a `packageGroup` + packages in `content/packages.ts`.
2. Add a `Service` entry in `content/services.ts` (renders via the service template).
3. Add a card to the home Experiences grid (`app/page.tsx` `CELEBRATIONS`) + the footer.
That's the whole pattern — the affiliate/subcontract model (sell the package, keep a %, hire the
vendor) slots in as just another theme.
