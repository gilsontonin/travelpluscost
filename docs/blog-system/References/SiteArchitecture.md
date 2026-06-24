# Site Architecture — the hub-layer plan (island × topic, max 3 deep)

> Written 2026-06-12 (Fable). The owner's ask: organize the site by **island → activity,
> later by town/beaches/best-of — "a medium between some organization," never more than
> 3 pages deep.** This file is the blueprint; build it in phases with `/site-health`-grade
> link sweeps after each phase.

---

## The four principles (decide everything from these)

1. **Post URLs never move.** All ~104 guides stay flat at `/blog/<slug>/` forever. They're
   indexed, ranking, and earning; URL depth is not a ranking factor, internal linking is.
   Organization is a **hub layer on top** — new pages that link the same flat posts.
   (This also means zero redirects, zero ranking risk, and every phase is purely additive.)
2. **Two axes, not three.** ISLAND (`/oahu/`…) × TOPIC (`/best-beaches/`… — already built).
   Towns/regions nest *inside* an island later; "best of" is a curated section on hubs,
   never its own directory. Three axes = thin-page bloat and crawl waste.
3. **The 3-click rule.** Home → island hub → post (2 clicks) for most journeys;
   Home → island hub → sub-hub → post (3) for the deep topics. Nothing is ever 4 away.
4. **A hub page must earn its existence: ≥8 posts.** Under that, the topic is a *section
   on the parent hub* (anchored heading + cards), not a page. When a section crosses ~8
   posts, promote it to a page and leave a link in its old place. This is the "medium
   between some organization" — structure grows only where content mass exists.

## The map

```
Home
├── /oahu/  /maui/  /kauai/  /big-island/        ← NEW island hubs (Phase 1) — nav "Islands ▾"
│     ├── sections: Start here · Beaches · Things to do · Food · Where to stay · Regions · Best of
│     └── /oahu/beaches/ /oahu/food/ …           ← Phase 2 sub-hubs, only where ≥8 posts
│           └── /oahu/north-shore/ /oahu/waikiki/ …  ← Phase 3 region hubs (same depth rule)
├── /things-to-do/ /where-to-stay/ /hawaiian-food/ /best-beaches/   ← EXISTING topic hubs (keep; nav "Guides ▾")
├── /blog/<slug>/                                ← every guide, flat, forever
└── /services/<slug>/                            ← money pages (untouched)
```

Both axes link the same posts: a Lanikai guide is reachable from `/oahu/` (island axis)
AND `/best-beaches/` (topic axis). That's by design — two crawl paths, one URL.

## Island hub anatomy (cards-led per DESIGN.md, like the 4 existing hubs)

- `CollectionPage` schema, canonical, OG image; **no intro wall** — a 2-3 sentence stance
  in the house voice ("First trip? Make it Oahu — here's the whole island, sorted"), then cards.
- **Start here** (curated 4): itinerary · where to stay · best time · things to do.
- **Auto sections by topic** (Beaches, Food, Hikes, …): card grids fed by the new `island`
  field — zero per-post maintenance once tagged.
- **Best of <island>**: a curated strip of the best-series posts (the owner's "best of" ask).
- **Regions** (Phase 3 seed): plain links/sections for North Shore, Waikiki, Kailua… until
  each crosses the 8-post bar.
- One soft services line on `/oahu/` only (the island we actually operate on).

## Data prerequisite (Phase 1, step 0)

Add `island?: "oahu" | "maui" | "kauai" | "big-island" | "hawaii"` to the `Post` type and
backfill all posts once (mechanical: slug/title/category make it obvious; `"hawaii"` = the
multi-island pillars, which list on every island hub's "planning" section or none).
Don't try to derive island from `category` — it's 80× generic "Hawaii Guide" and can't carry
this. (Optional cleanup later: normalize `category` for display, NOT for routing.)

## Phases

| Phase | Build | Done when |
|---|---|---|
| **1** | `Post.island` backfill · 4 island hubs · "Islands ▾" nav · breadcrumb on hubs · sitemap auto-includes | Every post reachable in ≤3 clicks via its island; Lighthouse 100 a11y holds |
| **2** | Promote sections with ≥8 posts to sub-hubs (first candidates: `/oahu/beaches/`, `/oahu/food/`, `/oahu/things-to-do/`) + internal-link sweep so posts link UP to their hubs | Each sub-hub has CollectionPage schema + ≥8 cards + inbound links from its posts |
| **3** | Region hubs as mass accrues (`/oahu/north-shore/` is closest — shrimp trucks, Haleiwa, Sunset Beach, Papailoa, Waimea…) | Same bar; never deeper than `/island/region/` |

Each phase ends with: build static ✓, `npm run check` green, Lighthouse on one new hub
≥95/100/100/100, and a backlink sweep (posts → their hubs) so hubs aren't link islands.

## Guardrails

- Never create a hub to "complete the grid" (no `/kauai/food/` with 3 posts — it stays a
  section on `/kauai/`).
- Post breadcrumbs stay `Home → Blog → Post` (URLs unchanged); hub breadcrumbs are
  `Home → Island → Topic`.
- The 4 existing topic hubs keep their URLs and nav slot — they're indexed and earning.
- New posts: `write-blog-post` sets `island` at insert time (one line in the skill once
  Phase 1 lands).
