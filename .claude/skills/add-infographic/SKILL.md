---
name: add-infographic
description: >-
  Add a native infographic to a travelpluscost blog post — register it in src/lib/infographics.ts and
  embed it with `::infographic <key>`. Use when asked to "add an infographic", "add a visual/compare/
  stat panel", or "/add-infographic".
---

# add-infographic (travelpluscost)

Infographics are **native, crawlable HTML** (no images = fast LCP) defined in `src/lib/infographics.ts`
and rendered by `src/components/blog/Infographic.tsx`. A post embeds one with a line: `::infographic <key>`.
They carry their OWN visual-cadence count (the SEO scorer can't read them — keep an entity-rich prose
sentence beside each).

## Kinds available (the `Infographic` union)
- `stat` — a panel of `{ value, label }` stat cards
- `compare` — an X-vs-Y table (`left`, `right`, `rows[{ label, left, right }]`) — great for honest-vs-surveillance
- `steps` — a numbered `{ title, detail }` flow — great for "how pricing works"
- `callout` — a single `{ title, body }` highlight

## Steps
1. Pick the kind that fits the point (compare for "us vs them", steps for a process, stat for numbers).
2. Add an entry to `INFOGRAPHICS` in `src/lib/infographics.ts` with a kebab-case key. **Real numbers only**
   (`docs/blog-system/References/stats.md`); never publish the wholesale cost or the exact markup %.
3. Embed `::infographic <key>` on its own line in the post body where the prose makes that point, and keep
   a prose sentence beside it.
4. `npm run typecheck && npm run lint && npm run build` to confirm it renders; `npm run blog:stats -- <slug>`
   to confirm the visual cadence (~1 visual per 500 words). Re-use existing keys across posts when they fit.
