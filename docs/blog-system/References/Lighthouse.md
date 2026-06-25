# Lighthouse / performance best practices (blog pages)

The blog "where to stay" pages are image-heavy (a hero cover, priced cards, a map), so they're
the most performance-sensitive pages on the site. This is the contract. **Run `blog:lh` before
shipping any post — it's a gate, like serp/slop/cta.**

## Budget (the `blog:lh` thresholds)
`Performance ≥ 90 · Accessibility = 100 · Best Practices = 100 · SEO = 100`

## How to run it
Lighthouse needs a **running server** (the blog is SSR, not a static export):
```bash
npm run build && npm start          # terminal 1 — serves :3000
npm run blog:lh -- /blog/<slug>     # terminal 2 — scores that page
BASE=https://travelpluscost.com npm run blog:lh -- /blog/<slug>   # score prod instead
```
It's also step 4 of the `blog:next` runbook and listed in CLAUDE.md's mandatory gates.

## The rules (what keeps Performance ≥ 90)

1. **Every image goes through `next/image` — never a raw `<img>`.** Raw `<img>` ships the
   full-res original (a LiteAPI/cupid cover is ~772 KiB); `next/image` resizes + converts to
   WebP/AVIF via the Netlify Image CDN (~30–80 KiB) and caches it for 30 days. This was the
   Performance-77 culprit: the hero cover was a raw `<img>`, so it was the LCP element at 6.5 s.
2. **The hero cover (the LCP element) MUST use `priority`.** That sets `fetchpriority=high`,
   adds a preload, and disables lazy-loading — the three things the "LCP request discovery"
   audit checks. Use `fill` + `sizes` inside a sized `relative` box, or explicit `width`/`height`.
3. **New cover/image hosts must be whitelisted** in `next.config.ts` → `images.remotePatterns`
   (we allow `static.cupid.travel` + `images.unsplash.com`), and any non-default `quality` must
   be in `images.qualities` (we ship `[65, 75]`), or `next/image` silently falls back to the raw URL.
4. **Heavy/below-the-fold JS loads lazily.** The `::map` Leaflet map is `dynamic(ssr:false)`
   via `MapView`, so the map JS + CARTO tiles never block first render. Keep it that way; don't
   add eager client maps or large libraries above the fold.
5. **Accessibility (the 100 target):** avoid `text-black/40`–`/45` and bare `text-accent`
   (coral on white ≈ 3.4:1) for **small body text** — they fail AA contrast; use `/55`+ or a
   darker token for anything under ~16px. Give repeated link text a **unique purpose** (e.g.
   "See all Lake Delton", not five identical "See all"s) — the "identical links" audit flags it.

## Known follow-up
A targeted **contrast pass** on the lightest greys (`text-black/40–45`) and small accent text
would take Accessibility from 97 → 100. It's a design change across shared components, so do it
deliberately (owner reviews the look), not in a blind sweep.
