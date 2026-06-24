---
name: embed-related
description: >-
  Build/refresh the semantic "Read next" index for the blog — vectorizes every post with
  Gemini embeddings (gemini-embedding-001), computes similarity, and writes content/related.json
  (top related posts per slug). The blog template renders a "Related guides" block from it, and
  it's a candidate source for internal linking. Improves retention (pages/session) + SEO (topical
  clusters), static-export-friendly. Use after publishing posts, or when the user says "rebuild
  related posts", "refresh read-next", "/embed-related", or asks to improve internal linking.
---

# Embed Related — semantic "Read next" + internal-link candidates

Turns all ~155 posts into vectors (Gemini embeddings) and writes the top-N semantically related
posts for each → `content/related.json`. The blog post template (`app/blog/[slug]/page.tsx`) reads
it to render the **"Read next · Related guides"** grid (falls back to newest posts if a slug is
missing). Static-export safe: it's a build-time JSON, no runtime calls.

**Why:** related-by-meaning recommendations lift pages/session (retention + the session-depth
signal Google rewards) and reinforce topical clusters (SEO). It also gives `/internal-linking` a
real "these two posts are about the same thing" signal instead of keyword matching.

## Prerequisite
`GEMINI_API_KEY` in `.env` (the embeddings endpoint needs **billing enabled** for >a handful of
posts — embeddings have their own quota, separate from TTS).

## Run it
```bash
node scripts/embed-related.mjs
```
- Parses posts from `content/blog.ts`, embeds `title + cleaned body` (capped ~8k chars) with
  **`gemini-embedding-001`** (`taskType: SEMANTIC_SIMILARITY`, 768-dim), 8 concurrent requests.
- Cosine-similarity → top **4** related per slug → `content/related.json`
  (`{ slug: [{slug,title,score}] }`).
- Cost: ~155 cheap embedding calls (pennies).

## When to run
- **After publishing or materially editing a post** (so it appears in / re-ranks others' read-next).
  It's safe and fast to re-run anytime; commit the refreshed `content/related.json` with the post.
- Note: it reads the FULL current `blog.ts`, so a new post is included as soon as it's inserted.

## Verify + ship
- `npm run build` clean; on a post page the "Related guides" grid shows topically-related posts
  (not just the newest) — spot-check one: e.g. best-restaurants-in-maui → best-places-to-eat-oahu.
- `npm run check` green; Lighthouse unaffected (it's server-rendered links, no client JS/CLS).
- Commit `content/related.json` (+ `scripts/embed-related.mjs` / template if changed). Hold push
  until "go live".

## Gotchas
- `gemini-embedding-001` supports `embedContent` only (no synchronous `batchEmbedContents`) — the
  script does single calls with concurrency.
- If `related.json` is stale (new posts not in it), the template still renders (fallback to newest),
  so it never breaks — just re-run to refresh.
- Don't hand-edit `related.json`; regenerate it.

## Acceptance criteria
- `content/related.json` covers every post with top-4 related; build clean; the "Related guides"
  block renders semantic matches; npm check green; committed; held for go-live.
