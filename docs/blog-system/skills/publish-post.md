---
name: publish-post
description: >-
  Publishing is now MERGED into write-blog-post (2026-06-08), which writes AND
  publishes a post in one run. Use this only as a pointer: if the user says
  "publish a blog post" / "publish the next draft" / names a queued draft, run
  write-blog-post — default mode to write+ship a new post, or its Steps 5-9 to
  ship an existing content/drafts/<slug>.md draft (insert, build, QA, deploy).
---

# Publish Post — merged into `write-blog-post` (2026-06-08)

**Publishing is no longer a separate skill.** `write-blog-post` now **writes AND publishes in one
run** (research → draft → insert into `content/blog.ts` → build → QA → auto-deploy on green). The
old "draft now, publish later" split is gone — the research is freshest the moment it ships, and
post-publish maintenance lives in the `review-blog` evergreen skill, not a pre-publish queue.

## What to do when the user says "publish a blog post"

- **They mean write a NEW post and ship it** → run **`write-blog-post`** in its default
  write+publish mode (the whole pipeline, auto-deploy on green QA).
- **They mean ship an EXISTING queued draft** (a `content/drafts/<slug>.md` made earlier in
  draft-only mode) → load that draft and run **`write-blog-post` Steps 5–9** on it: re-verify the
  external links + ai-slop, insert the `Post` object at the top of `content/blog.ts` + the
  infographic into `content/infographics.ts` (date = today), add 1–3 inbound backlinks, log the
  keyword + affiliate note + exec summary, mark the `QUEUE.md` row published, build, run the
  `References/BlogPostChecklist.md` gate + Lighthouse, then auto-push on green.

## The one gate
`References/BlogPostChecklist.md` — every box ✅ (or N/A) and Lighthouse ≥ 95/100/100/100, or you
do not push. Same gate for writing and publishing; that's the whole point of the merge.
