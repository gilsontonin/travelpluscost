# Linking & monetization — travelpluscost

> How a blog post links and earns. travelpluscost makes money when a reader books a hotel on **our own
> site** (we sell at SSP; LiteAPI is MoR) — NOT by sending traffic to third-party affiliates. So a post's
> "monetization" is **internal links to real inventory**, done helpfully. Replaces the Hawaii affiliate
> registry (Viator/Amazon), which does not apply here.

## The one rule: every post routes to real inventory, honestly
A post earns by helping a reader find and book the right stay **on travelpluscost**. Link to pages that
actually exist and serve the reader's next step — never a dead end, never a hard sell.

## Where to link (all internal, all real pages)
| Intent in the post | Link to |
|---|---|
| "find a hotel in {city}" | `/hotels/<city>` (the city hub) or `/search?destination=<City>&adults=2` |
| a named property | its property page `/hotels/<city>/<slug>` (only if it's real in our directory) |
| browse a state / region | `/destinations/<state>` or `/hotels` |
| "how does the price work" | `/#how` (honest-pricing explainer) or `/about` (the manifesto) |
| "is it really the same price" | `/about` / the "prove it" angle |

- **3–5 internal links per post**, descriptive anchors ("hotels in Waikiki", never "click here").
- **1 clear CTA**, woven in naturally, pointing at search or a city hub — the honest-price search *is* the
  offer. No popups, no urgency, no "limited time."
- Link a property **only if it exists** in our directory (grep/verify the slug). A 404 from a blog is the
  worst outcome.

## External links (authority, not money)
- 2–3 **authority** links per post (.gov / official / primary source) for facts — `rel="noopener
  noreferrer" target="_blank"`. Curl-200 every URL before it ships.
- We don't run third-party affiliate links by default. If one is ever added, it MUST carry
  `rel="sponsored nofollow"` **and** a visible FTC disclosure. (None today.)

## What NOT to do (brand-breaking)
- ❌ No fake "deal" framing, strikethrough "was" prices, scarcity, or countdowns to drive the click.
- ❌ Don't promise a price a post can't guarantee (rates are live; say "search current prices", not "$X").
- ❌ Don't imply membership/flights/cars are bookable yet (they aren't — stats.md §6).
- ✅ The honest move: give the genuinely useful answer first; the link is the obvious next step, not a trap.
