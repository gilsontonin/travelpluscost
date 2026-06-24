---
name: internal-linking
description: >-
  Add or improve internal links between travelpluscost blog posts (and to city hubs / search) — find
  orphans and link gaps, add descriptive-anchor links in our voice. Use when asked to "add internal
  links", "fix orphans", "interlink", or "/internal-linking".
---

# internal-linking (travelpluscost)

Goal: every post links to 3–5 real pages and is linked *into* by ≥1 other post (no orphans). Links route
to genuinely-relevant places: other posts, `/hotels/<city>` city hubs, `/destinations/<state>`, `/search`,
`/about`, `/#how`. Descriptive anchors only ("hotels in Waikiki", never "click here"). The ONE CTA per
post is the honest-price search / a city hub (`docs/blog-system/References/AffiliateLinks.md`).

## Steps
1. `node scripts/blog/internal-link-audit.mjs` — lists each post's outbound/inbound internal links,
   flags orphans (0 inbound) and thin posts (<3 outbound).
2. Use `content/blog-related.json` (Gemini neighbors, via `npm run blog:related`) to pick the most
   *relevant* posts to link — never link by date.
3. For each gap, add a contextual link **inside a sentence** (not a bare list) in the source post's body
   in `src/lib/posts.ts`. Verify the target page exists (a 404 from a blog is the worst outcome).
4. Re-run the audit; confirm no orphans and 3–5 links/post. `npm run blog:slop` + `blog:stats` if you
   edited prose. Commit only when asked.
