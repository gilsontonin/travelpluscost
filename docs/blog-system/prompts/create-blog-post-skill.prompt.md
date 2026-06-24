# PROMPT — Create the "write-blog-post" skill for this workspace

> This file is a **specification you hand to Claude Code** to generate a reusable
> skill. Review/edit anything below, then tell Claude: "Build the skill from
> `Prompts/create-blog-post-skill.prompt.md`." Nothing is built until you approve.

---

## Goal

Create a Claude Code **skill** that writes one fully SEO-optimized, on-brand blog
post for the **Hawaii Picnics by Wember** site, end to end — from keyword
selection through research, drafting in the house voice, image sourcing, adding
it to the codebase, building, and (after my approval) committing.

## Deliverable

Create `.claude/skills/write-blog-post/SKILL.md` with YAML frontmatter:

```yaml
---
name: write-blog-post
description: >-
  Write one SEO-optimized, on-brand blog post for the Hawaii Picnics by Wember
  site. Picks the next unused primary keyword from the cluster, researches the
  top 3 ranking pages, drafts in the house voice, sources Pexels images, adds the
  post to content/blog.ts, and verifies SEO + Lighthouse rules. Use when asked to
  "write a blog post", "create a post", or "/write-blog-post".
---
```

The skill body must encode the workflow below. Optionally accept an argument:
`/write-blog-post [primary keyword]`. If no keyword is given, auto-pick the next
unused one (see step 1).

---

## Workspace facts the skill must rely on

- **Node toolchain:** `~/.local/node/bin` (prepend to PATH). Build: `npm run build`
  (static export → `out/`). Preview: `npm run serve`.
- **Content store:** posts are objects in `content/blog.ts` (`Post[]`). Schema:
  `slug, title, seoTitle?(≤33 chars), description(≤160), excerpt, date, dateModified?,
  author, category, icon (IconName), coverImage?{src,alt,width,height}, body (Markdown)`.
- **Author byline:** `"Hawaii Picnics & Beach Events"`.
- **FAQ → schema is automatic:** any `## FAQ …` section with `### Question` H3s is
  turned into `FAQPage` JSON-LD by `lib/markdown.ts` (`extractFaqs`). Just write the FAQ.
- **Detail route** `app/blog/[slug]/page.tsx` already exists and renders ToC,
  author bio, breadcrumbs, BlogPosting + FAQ schema, back-to-top.
- **Pexels API key:** `PEXELS_API_KEY` in `.env` (gitignored). Use it to search images.

---

## Reference files the skill MUST read before writing a single sentence

| Purpose | File |
|---|---|
| Brand voice (Dan Kennedy style) | `References/DanKennedyVoice.md` |
| Humour rules (mandatory) | `References/Humour.md`, `References/FunnyHumor.md` |
| **Real numbers (prices, ratings, policies)** | `References/stats.md` |
| Hot takes / opinions (max 1 per post) | `References/Opinions.md` |
| Recurring stories (max 1 per post, don't invent) | `References/Stories.md` |
| Post format strategy | `References/BlogStructure.MD` |
| On-page SEO checklist (must pass every item) | `References/OnPageSEOCheckList.md` |
| Lighthouse rules (images, contrast, etc.) | `LightHouseBestPractices/LighthouseBestPractices.md` |
| **Keyword clusters (pick next unused primary)** | `Keywords/KeywordClusters.md` |
| Used keywords (never reuse a primary) | `Keywords/Used_Keywords.md` |

> Note: the brand is a **luxury beach-picnic company in Oahu**, not the plumbing
> business the reference files use as examples. Translate the voice/humour rules
> to the picnic context; ignore plumbing specifics. Adapt — don't copy — stories.

---

## Workflow the skill must perform

**1. Choose the keyword cluster.**
- Read `Keywords/KeywordClusters.md` (master list of 30 clusters) and `Keywords/Used_Keywords.md`.
- Pick ONE cluster whose **primary keyword** is NOT in `Used_Keywords.md`
  (the argument if given; else follow the "Priority order for this brand" at the
  bottom of the clusters file — highest picnic-conversion fit first). Use that
  cluster's listed **4–5 secondary keywords**.
- If the primary is already used, pick the next one — never reuse a primary.
- Honor the cluster's **Link rule**: picnic CTAs go to `/#packages` or `/#contact`
  (the location pages like `/ko-olina-picnic` don't exist yet).

**2. Research the SERP (do NOT skip).**
- Google-search the primary keyword.
- Open and analyze the **top 3 ranking pages**.
- Match their **format** (listicle / guide / comparison / tutorial).
- Match their **length** to within 20% of the top-3 average.
- Cover **every** topic all three share; **add 1–2** topics they missed.
- Write a **direct answer to the query in the first paragraph** (featured-snippet ready).
- Build an **FAQ** from "People Also Ask" + the cluster's question keywords.

**3. Draft in the house voice.**
- Follow `DanKennedyVoice.md` + the humour rules: open with a hook in the first 50
  words; ~1 funny/aside moment per 300–500 words; no exclamation marks; no emojis;
  punch at yourself/the topic, never the reader.
- Use **max one** opinion (from `Opinions.md`) and **max one** story (from
  `Stories.md`), each adapted to the picnic brand and backed by a real number.
- Pull every real figure (prices, $349 entry point, 4.712% GET, 400+ events,
  5.0 rating, deposit terms) from `References/stats.md`. Never invent a number —
  if it's only in the file's "Confirm / TODO" section, don't state it.
- End with a CTA back to the site (`/#packages` or `/#contact` — on-page anchors,
  not 404 paths). Tie in the picnic angle naturally.

**4. Satisfy the On-Page SEO checklist** (`References/OnPageSEOCheckList.md`) — every
applicable item, including: title ≤60 chars w/ keyword (use `seoTitle`), meta
description ≤160, slug w/ keyword (hyphens, lowercase), one H1, logical H2/H3,
keyword in first 100 words, **Table of Contents with anchor links**, 3+ internal
links to existing on-page anchors / real pages (never to non-built routes), 2–3
external authority links (`rel="noopener noreferrer" target="_blank"` — the
markdown renderer adds these for `http(s)` links automatically), and the FAQ.

**5. Source images via the Pexels API** (`PEXELS_API_KEY`), per
`LighthouseBestPractices.md`:
- Set `coverImage` (Pexels URL with `?auto=compress&cs=tinysrgb&fm=webp&w=800&h=500`,
  descriptive alt with keyword, width 800, height 500).
- Place 2–4 in-body images, each above an H2, using Pexels WebP URLs with
  `&w=1200&h=800`. Alt text describes the image + keyword naturally.
- Credit the photographer in an italic caption line under each image.

**6. Add the post** as a new object at the TOP of the `posts` array in
`content/blog.ts` (newest first; `date` = today, `dateModified` = today). Choose a
fitting `icon` from the existing `IconName` set and a `category`.

**7. Log the keyword.** Append the used primary (+ its secondaries) to
`Keywords/Used_Keywords.md` so it's never reused.

**8. Build & verify.**
- `npm run build`; fix any type/build errors.
- Run the on-page SEO audit (grep the built `out/blog/<slug>/index.html`) and
  confirm: title length, meta length, one H1 w/ keyword, FAQPage + BlogPosting +
  BreadcrumbList JSON-LD present, all images alt+lazy(except first eager)+WebP+
  dimensions, internal links resolve, ToC + back-to-top present.

---

## Human review checkpoints (important)

The skill must PAUSE for my approval at these points, not run straight through:

1. **After step 1** — show the chosen primary + secondary keywords and the post
   angle/format. Wait for my OK.
2. **After step 3** — show the full draft (or a tight outline + intro) for edits
   before it touches `content/blog.ts`.
3. **Before committing** — never `git commit`/`push` without me asking. Build and
   show results; I decide when to push.

---

## Acceptance criteria for the generated skill

- One command produces a complete, build-passing post that meets every applicable
  `OnPageSEOCheckList.md` item and the `LighthouseBestPractices.md` image rules.
- Reads the brand voice/humour/opinions/stories refs first and reflects them.
- Never reuses a primary keyword; logs each use.
- Uses real Pexels images with attribution.
- Stops for my review at the three checkpoints above; never auto-commits.

---

## Open questions for me (the reviewer) to answer/edit

- [ ] Auto-pick the next keyword, or always require me to pass one?
- [ ] Should the skill also screenshot the rendered post for me to eyeball?
- [ ] Default post length target, or always derive from the SERP top-3?
- [ ] Want a `--draft` mode that writes to a scratch file instead of `content/blog.ts`?
