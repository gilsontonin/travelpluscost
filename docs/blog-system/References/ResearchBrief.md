# Step 2 — Research (facet-driven)

_The deep-research pass that runs **after `blog:scan`/`blog:serp` (Step 1) and before writing.** The scan
tells you the SHAPE that wins; this tells you the SUBSTANCE so you write from your own research, not a
top-3 echo. Reverse-engineered from Jono's "50+ sources / 5 subagents" step and adapted for travel._

## ⛔ OWNER HARD FLOOR (2026-06-28, no leeway): 30 SOURCES MINIMUM
**Every post's `research-brief-<slug>.md` must document AT LEAST 30 distinct, credible sources in a SOURCE
LEDGER, grouped by facet.** Fewer than 30 is a FAIL — do not write a word until you are there. This is on
top of the facet rule below (facets drive WHAT you research; 30+ sources is the floor you must hit and show).
In practice ~20–30 facets at one search per facet clears 30 sources comfortably. **No "facets over count"
shortcut to dodge the floor** — the owner reads the ledger.

## The facet lesson (HOW to hit the floor without busy work): new facets, not re-digging
A deeper pass is worth it **only when it adds new FACETS, not when it re-digs the same one.** Tested on
"best restaurants in New Orleans": the first ~30 sources nailed famous/awarded/historic; pushing to ~55 by
querying **new angles** (brunch, cheap eats, by-neighborhood, global) surfaced whole missing categories and
two legends the 30 missed (Bacchanal, Jacques-Imo's). Re-searching "best restaurants" five more times would
have been pure busy work. So:
- **Hard band: 10–30 facets, scaled by keyword DEPTH** — **never fewer than 10** (no lazy skim, even on a
  narrow keyword) and **never more than 30** (deep pillars only; don't go infinite). A narrow keyword earns
  ≥10 angles from the core menu; a deep pillar expands each core facet into specific sub-angles up to 30.
- **Facets drive WHAT you research; the 30-source floor is non-negotiable.** Hit BOTH: ~20–30 distinct
  facets AND ≥30 sources in the ledger. 50 sources re-digging one angle is busy work, but fewer than 30 is
  a fail — the answer is always MORE FACETS (new angles), never fewer sources. **One search per facet**, not
  five per facet, and keep adding facets until the ledger clears 30.

## The core facet menu (≥10 — this is the FLOOR; pick the ones that exist)
- **Famous / iconic** — the names everyone expects
- **Awarded** — Michelin, James Beard, "50 Best", local critics' picks
- **Where locals eat** — Reddit/forums; the honesty angle (tourist-trap vs gem)
- **By dish / sub-type** — the signature things + where to get each
- **By neighborhood** — area-by-area (also feeds the where-to-stay link)
- **By occasion / segment** — brunch, budget/cheap, romantic, with-kids, late-night
- **New & buzzy** — recent openings (freshness; competitors list stale picks)
- **Practical / PAA** — reservations, hours, dress code, how-far-ahead (snippet bait)
- **Video / critic** — local critic video series, vlogs (real, current detail)
- **Our own data** — LiteAPI: neighborhoods, real prices/spreads, proximity to inventory

## Reaching 10–30: sub-divide the core facets by depth
A narrow keyword runs the ~10 core facets and stops. A **deep pillar** enumerates the broad ones into
specific sub-angles until you hit the depth the keyword deserves (cap 30). E.g. for "best restaurants in
New Orleans":
- **By neighborhood** → French Quarter · Garden District · Bywater/Marigny · Uptown/Magazine · Mid-City · CBD/Warehouse (≈6 facets)
- **By dish** → gumbo · po-boy · beignets · oysters · muffuletta · crawfish (≈6)
- **By occasion/segment** → brunch · cheap eats · fine dining · romantic · late-night · with-kids · vegan (≈7)
Stack those on top of famous/awarded/local/new/practical/video/our-data and a deep pillar naturally lands
in the 20–30 band. Stop at 30 — past that it's re-digging, not new facets.

## Travel source types (and what to SKIP)
USE: guides · local critics (Eater/nola.com-style) · Reddit/forums · awards bodies · video · practical
pages · **our own data**. **SKIP Jono's** industry reports / studies / gov data / product specs — those fit
"plumber cost"-type topics and return nothing for travel. Chasing them is the busy work.

## Localize
City posts research the CITY, not national/global (Toronto pricing ≠ Miami; New Orleans gumbo ≠ generic).

## Subagents — opt-in, for breadth only
For a **broad pillar**, optionally spin up ~5 subagents (each owning a cluster of facets) to parallelize —
his method, much faster. **Off by default** for narrow keywords (overkill) and whenever the owner hasn't
asked to spawn agents. Subagents are the expensive path; the facet checklist run inline is usually plenty.

## Output — the research brief
Synthesize everything into **`scripts/blog/research-brief-<slug>.md`** (the artifact the writer reads).
Structure (see the exemplar `research-brief-best-restaurants-in-new-orleans.md`):
1. **Header** — keyword · intent · date · ~N sources across M types
2. **Source ledger by type** — what was pulled where
3. **The picks, GROUPED** — by the facets above (famous / awarded / local / by-dish / neighborhood /
   occasion / new), each entry with the one detail that makes it worth including + source
4. **Real-traveler insight** — the Reddit/forum honesty (trap-vs-gem, local-only picks)
5. **Practical / PAA** — the questions to answer cleanly → featured snippet
6. **★ Our angle / gaps** — what beats the top 3: the booking path they lack (hotel cards + a table),
   cluster cross-links, freshness/honesty
7. **Compliance** — claims exactly true (superlatives must rest on awards/data), no fake scarcity

Then **write FROM this brief**, not from the top-3 pages.
