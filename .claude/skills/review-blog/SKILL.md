---
name: review-blog
description: >-
  Review and fix an existing travelpluscost blog post to the full quality bar — run the QA robots,
  read it as a tired traveler on a phone, fix every failing gate, and re-run until SHIP-READY. Use when
  asked to "review", "audit", "fix", or "improve" a post, or "/review-blog".
---

# review-blog (travelpluscost)

Standard = `docs/blog-system/TheBible.md` (every §2 gate + the §3 corner-cutting catalogue + the §8
pre-commit ritual). Read the post in `src/lib/posts.ts` first.

## Steps
1. **Run the full QA:** `npm run blog:qa -- <slug> --kw "<primary>"`. Paste the verdict in full.
2. **Run the pieces it rolls up** and read each: `blog:checklist`, `blog:stats`, `blog:voice`, `blog:slop`.
   If there's no SERP brief, build one: `node scripts/blog/serp-optimize.mjs "<kw>" --urls "…" --draft <slug>`.
3. **Fix every ❌ / EASY-FIX**, in our voice, without breaking other axes (watch the concise-vs-humour
   tension — `References/QA-Master.md`): deepen thin sections (or merge if over-band), add the missing
   SERP heading terms, bold answer phrases, add a dry beat to dry sections, fix AI-tells, add the "as of
   2026" line, ensure 3–5 internal links + the ONE CTA, add a TL;DR / infographic / hotel card if missing.
4. **Re-run after every edit batch** (the numbers shift). `node scripts/blog/dehyphenate.mjs <slug> --apply`.
5. **Read it top to bottom** as a tired traveler on a phone (TheBible §8): does each section say what to
   *do*? Is the one useful thing findable in 10 seconds? A smile every ~300 words?
6. **Close out:** `npm run typecheck && npm run lint && npm run build` (0 lint errors). Paste the final
   `blog:qa` SHIP-READY verdict + numbers. Commit only when asked; don't push until "go live".

EXEC-DECISION rows (e.g. SERP score the owner accepts below target) → flag the numbers, let the owner decide.
