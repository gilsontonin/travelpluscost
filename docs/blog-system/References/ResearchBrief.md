# Step 2 — Research (facet-driven)

_The deep-research pass that runs **after `blog:scan`/`blog:serp` (Step 1) and before writing.** The scan
tells you the SHAPE that wins; this tells you the SUBSTANCE so you write from your own research, not a
top-3 echo. Reverse-engineered from Jono's "50+ sources / 5 subagents" step and adapted for travel._

## The one lesson that matters: facets, not source count
A deeper pass is worth it **only when it adds new FACETS, not when it re-digs the same one.** Tested on
"best restaurants in New Orleans": the first ~30 sources nailed famous/awarded/historic; pushing to ~55 by
querying **new angles** (brunch, cheap eats, by-neighborhood, global) surfaced whole missing categories and
two legends the 30 missed (Bacchanal, Jacques-Imo's). Re-searching "best restaurants" five more times would
have been pure busy work. So:
- **Scale to keyword BREADTH, never a fixed 50.** Broad pillar = ~8–10 facets (~40–60 sources); narrow
  keyword = ~3 facets (~15). 50 sources on a narrow keyword ("New Orleans in December") IS the busy work.
- **One search per FACET**, not five per facet.

## The facet checklist (pick the ones that EXIST for the keyword)
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
