# TheBible — Blog Post Operating Contract (travelpluscost)

> **Paste this at the top of any "write the next blog post / redo a post / review a post" task.** It is
> the authoritative operating contract: every §2 gate is **non-negotiable** (the gates win; voice/humour
> serve the post *within* the gates). **Print the gate numbers every run. Never `git push` until the
> owner says "go live"** (each push burns a Netlify build). Ported from the Hawaii Picnics system and
> de-Hawaii'd for travelpluscost — the craft is the same, the brand + plumbing are ours.
>
> Source files (authoritative if anything here drifts): `References/Voice.md`, `DanKennedyVoice.md`,
> `Humour.md`, `PassAISlopAndDetection.md`, `BlogStructure.MD`, `OnPageSEOCheckList.md`, `stats.md`,
> `Opinions.md`, `Stories.md`, `AffiliateLinks.md` (= our internal-linking rules).

---

## 0. House style — write to CONVERT (see `References/Voice.md`, applied from the first keystroke)
1. **Short paragraphs (max 3 sentences).** One idea each.
2. **Active voice, subject first.** "Your phone changes the price," not "the price is changed…".
3. **Plain high-school words** — unless a fancier word is the actual search term (then keep it).
4. **Contractions always. No exclamation marks. No emoji. No AI tells** (`ai-slop` 0 HARD).
5. **Tell the honest downside, including about us** — we're not always the lowest *headline* price; say so.
6. **One dry beat per section** (Humour.md) — a smile every ~200–300 words, deadpan, never at the reader.
7. **Explain the price/point in 30 seconds, in plain words.** If you can't, the post is off-brand.

## 1. Standing owner rules (non-negotiable)
1. **Print every QA on screen, every run** — never summarize. The single command is `npm run blog:qa --
   <slug>`; also paste the individual gate outputs it rolls up.
2. **Don't push until "go live."** Commit only. **Run `npm run lint` BEFORE committing** — an eslint
   error fails the live Netlify build (see CLAUDE.md / memory).
3. **Real numbers only** (`stats.md` + real LiteAPI data). Never invent or round. Unverifiable = deleted.
4. **HARD brand limits (POSITIONING.md):** never publish the wholesale/net cost or the exact markup %;
   never claim "lowest price anywhere" or "no dynamic pricing." No fake discounts, scarcity, countdowns,
   points, or VIP tiers — those are what the brand exists to reject.
5. **The ONE CTA = the honest-price search / a city hub** (`AffiliateLinks.md`). No third-party affiliate
   stacking, no popups, no urgency. The honest search *is* the offer.
6. **Markets with rich local content:** Oahu, Maui, Las Vegas, Seattle, San Diego — lead local guides
   toward these. Brand/transparency posts work anywhere.

## 2. The gates — run from the repo root, PASTE the numbers every time
`export PATH="$HOME/.local/node/bin:$PATH"` first. A post does not ship unless ALL are green.

| Gate | Bar | Command |
|---|---|---|
| **One-command QA** (rolls up the rest) | verdict **SHIP-READY** | `npm run blog:qa -- <slug> [--build pass] [--lighthouse P/S/A/B]` |
| SEO coverage score | **≥ 90** | `node scripts/blog/serp-optimize.mjs "<kw>" --urls "u1,u2,…" --draft <slug>` (writes `scripts/blog/serp-brief-<slug>.md`) |
| AI-slop | **0 HARD** (chase SOFTs) | `npm run blog:slop -- <slug>` |
| Length: in the SERP band + no thin H2 | total in band; every content H2 **≥ 250w** | `npm run blog:stats -- <slug>` |
| Voice scorecard | concise/reading/active green + **a dry beat listed per section** | `npm run blog:voice -- <slug>` |
| Dehyphenate | applied | `node scripts/blog/dehyphenate.mjs <slug> --apply` then re-score |
| Build + lint | clean (route `○`/`●`), **0 eslint errors** | `npm run typecheck && npm run lint && npm run build` |
| Lighthouse (optional now) | ≥ 95/100/100/100 | serve + `npx lighthouse <url> …` → pass `--lighthouse` to `blog:qa` |

**Length = the SERP band** from `serp-optimize` (floor = competitor median, ceiling = longest genuine
competitor; the ≥1.5×-median outlier is excluded). Over the ceiling → trim/merge, never deepen. Section
count ≈ working-target ÷ ~280.

> **Deferred robot:** the built-HTML `post-checklist` (title/meta/JSON-LD/img-dims structural audit) isn't
> ported yet — the blog route already auto-emits BlogPosting + BreadcrumbList + FAQPage JSON-LD from the
> `Post` fields, so for now verify those by reading `src/app/blog/[slug]/page.tsx`. (See blog-system README.)

## 3. The corner-cutting catalogue (confirm each, every run)
1. **Stopping at 88–89.** Loop the serp-brief ADD list top-down; land 92+.
2. **Wrong length (too short OR too long).** Fatten thin sections when under; merge/cut when over. Never pad.
3. **Spot-checking QA.** Run `blog:qa` and paste it; answer every 👁 row.
4. **Editing after stats, not re-running.** Re-run `blog:stats` + `blog:voice` + `blog:slop` after every edit batch.
5. **Inventing/rounding facts.** Only `stats.md` + real LiteAPI data. Years/counts verified or dropped.
6. **Humour as a garnish.** 1–2 dry beats per major section, written INTO the section, deadpan, never at the reader.
7. **No contractions.** Always use them (voice + scorer).
8. **FAQ that re-answers the body.** FAQ = genuine leftover/long-tail questions only.
9. **First stock photo / no credit.** One cover (real, on-topic, WebP), keyword alt, photographer credit.
10. **Linking without curling.** Every external URL `curl`-200 before it ships; internal links must hit a real page.
11. **Publishing a price.** Rates are live — say "search current prices", never a hard "$X".
12. **Declaring done with anything red.** Sub-90, ▲ over-band, ❌ in `blog:qa`, or an eslint error never ships.

## 4. Drafting method (order)
1. **Pick the topic** (brand/transparency angle first, then destination). Avoid cannibalizing an existing post's intent.
2. **Research the SERP:** run `serp-optimize` over ~6–10 genuine competitor URLs (fresh WebSearch, no pinning). Read the brief: must-have subtopics, questions, fact candidates, length band.
3. **Plan structure + the ONE CTA together** (`AffiliateLinks.md`): which city hub / search the post routes to. Headings carry the exact keyword phrases (heading match is the biggest lever).
4. **Intro formula:** sentence 1 = the answer with the primary keyword verbatim, the answer phrase **bolded**; one dry hook within 50 words; then what it covers, who it's for, a visible "as of 2026".
5. **Body unit per section:** benefit H2 → prose with a beat → 2–3 sentences of real detail → a quick-facts strip or a table. One opinion (Opinions.md, number/principle-backed), ≤1 true story (Stories.md), ≥2 honest "when not to" beats.
6. **Add the post** to the TOP of `POSTS` in `src/lib/posts.ts` (fill every `Post` field + `faqs[]` → schema is automatic). `date`/`updated` = today.
7. **Loop §2 gates until green**, add 3–5 internal links, dehyphenate, build, lint, then commit (held for go-live).

## 5. What every run's final report MUST contain
- [ ] **The `npm run blog:qa` verdict** pasted in full + a one-line answer to every 👁 row.
- [ ] **Length band** (floor–ceiling), the post's word count, and the verdict (✅ in band / ▲ over / ▼ under).
- [ ] **SEO score**, **AI-slop** (0 HARD), **voice scorecard** (with one dry beat listed per section).
- [ ] **Build + lint + typecheck** results (lint = 0 errors).
- [ ] The §3 catalogue confirmed; any cut called out with its fix.
- [ ] The exec note: **committed `<hash>`, held for go-live (not pushed).**
