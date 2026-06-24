---
name: publish-post
description: >-
  Publish a finished travelpluscost blog post — final gates, a focused commit, and (only on the owner's
  "go live") push to deploy, then request indexing. Use when asked to "publish", "ship", "go live", or
  "/publish-post". Never pushes without an explicit go-live.
---

# publish-post (travelpluscost)

## Pre-flight (all must pass)
1. `npm run blog:qa -- <slug>` reads **SHIP-READY** (or an EXEC-DECISION the owner has accepted).
2. `npm run typecheck && npm run lint && npm run build` — **0 eslint errors** (an error fails the live
   Netlify build and the deploy silently keeps the old version — see CLAUDE.md / memory).
3. `npm run blog:related` ran (so `content/blog-related.json` has the new slug) and is committed.
4. `npm run check` is green (the deploy gate: AI-slop + claims).

## Commit
- Add 1–3 internal backlinks **into** the new post from existing posts (de-orphan), unique anchors, verified.
- **Focused commit** — just this post + its artifacts (posts.ts, blog-related.json, any self-hosted images).
  Message ends with the co-author trailer:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- **Commit only. Do NOT push until the owner says "go live."** Each push burns a Netlify build.

## On "go live"
- Push to `main` (auto-deploys to travelpluscost.com):
  `GIT_SSH_COMMAND='ssh -p 443 -o Hostname=ssh.github.com -o StrictHostKeyChecking=accept-new' git push origin main`
- After deploy: confirm the post is live + canonical, and in Google Search Console **Request Indexing**
  for `https://travelpluscost.com/blog/<slug>` (GSC tooling is a later add — do it by hand for now).
