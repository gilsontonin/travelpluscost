# Blog-writing system (travelpluscost)

The blog-writing **operating system**, ported from `HawaiiPicnicsByWemberWebsite` on 2026-06-23 and made
**ours** — brand files rewritten for travelpluscost, the auto-grading robots ported to this repo, keyword
research left behind on purpose.

---

## Start here (read in this order)
1. **`TheBible.md`** — the master operating contract. The one file to paste when you say "write the next
   blog post." Repointed to travelpluscost (`src/lib/posts.ts`, the `scripts/blog/` robots, our facts).
2. **`References/Voice.md`** + **`DanKennedyVoice.md`** + **`Humour.md`** — how we sound.
3. **`References/BlogStructure.MD`** + **`BlogPostChecklist.md`** + **`OnPageSEOCheckList.md`** — how a post is built.
4. **`References/PassAISlopAndDetection.md`** — how to not sound like AI.
5. **`drafts/maui-swap-meet.md`** — a gold-standard example post for voice (Hawaii topic, but the *voice* transfers).

## The robots (full system, ported & verified — in `scripts/blog/`, wired as npm scripts)
| Command | What it does |
|---|---|
| `npm run blog:qa -- <slug>` | **one-command QA** — the full 14-block consolidated verdict; runs the rest, classifies each fail EASY-FIX vs EXEC-DECISION, logs to `qa-logs/<slug>.md` |
| `npm run blog:checklist -- <slug> --kw "<kw>"` | the BlogPostChecklist as a live AUTO/👁 table (source-based; gate) |
| `node scripts/blog/serp-optimize.mjs "<kw>" --urls "u1,u2,…" --draft <slug>` | SEO coverage score + gap brief (curl-based, **no API key**) |
| `npm run blog:slop -- <slug>` | AI-tell detector (0 HARD to ship) |
| `npm run blog:stats -- <slug>` | length band + thin-section + visual-cadence check |
| `npm run blog:voice -- <slug>` | voice/concise/reading/humour scorecard |
| `npm run blog:dehyphenate -- <slug> --apply` | de-AI hyphen cleanup |
| `npm run blog:related` | rebuild `content/blog-related.json` — **Gemini embeddings** (gemini-embedding-001) when `GEMINI_API_KEY` is set, else TF-IDF |
| `npm run blog:photo -- "<scene>"` | source a cover photo (Unsplash → Pexels) with credit |
| `npm run blog:paa -- <slug>` | People-Also-Ask gap questions (**Gemini**) |
| `npm run blog:freshness -- <slug>` | flag perishable claims to re-verify (**Gemini**) |
| `npm run blog:fable -- <slug>` | optional Opus voice-polish pass (**Anthropic**) |
| `npm run blog:internal` | internal-link graph: orphans + under-budget |
| `npm run blog:links` | curl every external link in the posts (200 check) |
| `npm run blog:lh -- /blog/<slug>` | Lighthouse budget (needs a running server) |
| `npm run check` | **deploy gate** — AI-slop + claims-integrity; wired into the Netlify build |

All read `src/lib/posts.ts` and run from the repo root. The AI/photo scripts load `.env.local` (keys
cloned from the Hawaii repo). Verified on the live `where-to-stay-in-oahu` post (the pipeline flags real
gaps; Gemini PAA + embeddings + Unsplash search all confirmed working).

## Skills (`.claude/skills/` — type `/<name>`)
`write-blog-post` (the end-to-end workflow) · `review-blog` (grade + fix a post) · `publish-post`
(gates → commit → go-live push → reindex) · `internal-linking` · `add-infographic`. Each points at
`TheBible.md` + the robots above.

## The blog engine was upgraded to match (so every check applies)
travelpluscost's blog now has the same quality features the Hawaii checklist grades:
- **TL;DR answer box** — `Post.tldr = { answer, points[] }` (featured-snippet ready; checked for 35–60w + 3–5 bold-led).
- **Table of contents + heading anchors** — auto from H2s (self-slugged, no rehype-slug dep).
- **Infographics** — `::infographic <key>` → `src/lib/infographics.ts` registry + native (crawlable) renderer.
- **Hotel cards** — `::hotel <hotelId>` → server-fetched from the Supabase directory, links to the property page.
- **Related guides** — by content similarity (TF-IDF), never chronological (`src/lib/relatedPosts.ts`).

Files: `src/app/blog/[slug]/page.tsx`, `src/lib/blogBody.ts`, `src/lib/infographics.ts`,
`src/lib/relatedPosts.ts`, `src/components/blog/{PostBody,Infographic,BlogHotelCard}.tsx`.

## Parity status vs Hawaii
**At parity for the blog-post system:** 17 robots, 5 skills, the upgraded blog engine, the deploy gate,
and the AI/photo functionality (Gemini vectors + PAA/freshness, Unsplash/Pexels photos, Opus polish).

**The one piece that needs YOUR setup (can't clone):** Google Search Console integration
(gsc-fetch/opportunities/rank) — needs travelpluscost's own GSC OAuth (Hawaii's token is account-specific).

**Deliberately different (not gaps):** Viator tours/affiliate → we use **hotel cards** (we earn on our own
bookings); podcasts → retired in Hawaii too; the keyword-research/campaign system → left out by request
(so `write-blog-post` takes a keyword you hand it instead of auto-picking from a cluster).

`audit-html` (built-HTML structural audit) stays N/A — travelpluscost is SSR, not a static export, and the
blog route already auto-emits the JSON-LD it would check.

## What's been made ours (rewritten for travelpluscost)
- `TheBible.md` · `References/Voice.md` · `stats.md` · `Opinions.md` · `Stories.md` · `AffiliateLinks.md`
  (now our internal-linking/monetization rules — we earn on our *own* bookings, not third-party affiliates).

## Still ~universal craft — use as-is (Hawaii examples are illustrative only)
`References/`: DanKennedyVoice, Humour, PassAISlopAndDetection, BlogStructure, BlogPostChecklist,
BlogPost-SimpleGuide, OnPageSEOCheckList, QA-Master, FablePlaybook, SkimmabilitySpotCheck, WritingLessons,
serp-optimize-system, DESIGN, `lighthouse/`. (Owner to provide real brand **stories** — `Stories.md` is
seeded + flagged TODO.)

## Reference only (Hawaii-specific — don't apply literally)
`References/SiteArchitecture.md`, `ItineraryConcierge-Architecture.md`, the `skills/*` workflow docs (they
describe the Hawaii scripts), and the `drafts/` posts (Hawaii topics, kept for voice).

## Left behind on purpose (keyword research)
The `Keywords/` and `Money Keywords/` folders, `Used_Keywords.md`, `RankTracker.md`, and the
`serp-brief-*.md` outputs.

## To write a post
Paste `TheBible.md`, pick a topic, run `serp-optimize` over real competitor URLs, draft in our voice, add
it to `src/lib/posts.ts`, then loop `npm run blog:qa -- <slug>` until SHIP-READY. Don't push until "go live."
