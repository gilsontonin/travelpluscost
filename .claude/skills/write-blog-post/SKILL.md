---
name: write-blog-post
description: RETIRED — superseded by the global unified write-blog-post skill (~/.claude/skills/write-blog-post) backed by the shared engine at ~/blog-system. This file just routes to it.
---

# Write Blog Post — moved to the shared engine

TravelPlusCost blog writing now runs on the **unified engine**, shared with Hawaii Picnics.
**Do not follow old per-repo steps.** Use the unified flow:

- **Global skill:** `~/.claude/skills/write-blog-post/SKILL.md`
- **Shared voice + rules** (edit once, both sites): `~/blog-system/references/`
- **This site's config + facts:** `~/blog-system/sites/travelpluscost/config.json`
- **Shared dev tooling:** `npm run blog:serp | blog:checklist | blog:stats | blog:voice | blog:qa | blog:dehyphenate` (these point at `../blog-system/scripts/`).

Build-time gates stay local: `npm run check` (`scripts/blog/check.mjs`) still runs `ai-slop-check.mjs`,
`claims-check.mjs`, and `style-clean.mjs` in-repo (Netlify only clones this repo), so `blog:style` and
`blog:slop` remain local on purpose. Improvements to voice/rules/dev-tooling are made ONCE in
`~/blog-system`. The original skill is in git history.
