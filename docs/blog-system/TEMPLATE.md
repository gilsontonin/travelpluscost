# Starter template — launch a new site (or a client's) from this one

This repo is built as **engine + brand config**. To stand up a new site, copy the **engine**
unchanged and fill in the **brand** files. Nothing in the engine mentions a specific business; all
brand facts live in a handful of clearly-marked places.

> Day-to-day operating instructions (writing, publishing, cadence, rollback) live in `OPERATIONS.md`.

---

## The engine (copy as-is — never brand-specific)

| Area | What it is |
|---|---|
| `app/`, `components/`, `lib/`, `next.config.mjs`, `tailwind.config.*` | The Next.js static-export site shell, rendering, markdown→HTML (`lib/markdown.ts`), infographics renderer, SEO/schema/OG plumbing. |
| `scripts/check.mjs` + `ai-slop-check.mjs` + `claims-check.mjs` + `audit-html.mjs` | The **QA gate** (`npm run check`) — AI-slop/diacritics, fake-claims, structural HTML audit. |
| `scripts/check-links.mjs`, `check-lh.mjs`, `post-stats.mjs`, image helpers | Manual/scheduled tools (external links, Lighthouse budget, length, image sourcing). |
| `.claude/skills/*` | The repeatable workflows: `write-blog-post`, `publish-post`, `create-money-page`, `add-infographic`. |
| `netlify.toml` | Build = `npm run build && npm run check` (gate fails the deploy), security headers, functions. |
| `References/` craft layer | `DanKennedyVoice.md`, `Humour.md`, `PassAISlopAndDetection.md`, `BlogStructure.md`, `OnPageSEOCheckList.md` — these are ~90% universal craft. Keep; tweak only the examples. |

## The brand config (the only things you change per site)

| File | Fill in |
|---|---|
| `content/site.ts` (`SITE`) | Name, domain, phone, email, locality/region, service area, social, hours, accent color, price range. **No legal suffix** (no "Inc."), **no rating/review fields** unless real. |
| `content/services.ts`, `content/packages.ts`, `content/addons.ts` | The offerings + real prices wired to Stripe checkout. |
| `content/blog.ts`, `content/infographics.ts` | Start empty (or seed). Posts get added by `write-blog-post` → `publish-post`. |
| `References/stats.md` | The canonical real numbers (prices, any *verified* track record) + the cool verified facts for the niche. **Never invent numbers.** |
| `References/Voice.md`, `Opinions.md`, `Stories.md` | The brand voice persona, the hot-takes, and the real stories (owner-provided — don't fabricate). |
| `Keywords/` | The keyword bank/CSVs + `Used_Keywords.md`, `RankTracker.md`, `IndexingPriority.md`, `content/drafts/QUEUE.md`. |
| `.env` | `UNSPLASH_ACCESS_KEY`, affiliate IDs/links, any checkout/email secrets. Never commit. |
| `public/og/*`, favicon, logo | Brand imagery. |

## Clone-and-fill (new site in ~an afternoon)

1. **Copy** the engine + the `References/` craft files + reference *templates*; clear `content/blog.ts` and the `Keywords/*` trackers.
2. **Fill** `content/site.ts` + `services.ts`/`packages.ts` + the brand `References/*` (Voice/Opinions/Stories/stats) for the new business.
3. **`grep` for leftovers** before launch: search the repo for the *old* business name, old domain, old phone — there should be zero hits outside git history. *(This is exactly the check that would've caught the "plumber template" drift.)*
4. **`npm install && npm run build && npm run check`** — gate must be green.
5. Wire up: Netlify site + domain, `.env` secrets, Stripe, Google Search Console (submit `sitemap.xml`), affiliate signups.

## Per-site launch checklist

- [ ] `content/site.ts` brand facts correct; **no "Inc.", no fake rating/review schema**
- [ ] Services + packages + Stripe checkout tested
- [ ] `References/*` are the **right business** (run the leftover grep)
- [ ] `.env` secrets set (Unsplash, affiliates, checkout)
- [ ] Privacy policy, terms, and **affiliate disclosure** pages present
- [ ] Domain + canonical on `www`; `robots.ts` + `sitemap.ts` resolve
- [ ] `npm run check` green; `npm run check:links` + `check:lh` clean
- [ ] Google Search Console property + sitemap submitted; `IndexingPriority.md` started
- [ ] Keyword bank loaded; first few posts drafted into `content/drafts/`

## Universal guardrails (true for any site)

- No fake reviews / unverifiable superlatives (enforced by `claims-check`).
- Every external link verified 200 before it ships; URL-encode parens; avoid bot-blockers.
- Real numbers only (from `stats.md`); one strong opinion + one story per post; tell people when *not* to buy.
- Non-English place names → ASCII in the main text, native spelling in parens on first mention (the
  Hawaiian rule generalizes to any locale).
- Drip cadence (1–2/day) from a queue; the QA gate is the last line, not human discipline.
