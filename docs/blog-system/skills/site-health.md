---
name: site-health
description: >-
  Run a periodic SEO/monetization health check on the Hawaii Picnics & Beach Events
  site using the in-repo audit tools, then ACT on the highest-value findings. Four
  legs: (1) affiliate coverage gaps (check:affiliates), (2) internal-link graph —
  orphans/under-linked/broken (check:internal), (3) Google rankings — striking-distance
  pages to re-optimize + authority-gated pages to leave alone (check:gsc), (4) freshness/
  accuracy — stale prices/hours/closures/reservation rules on time-sensitive posts
  (check:freshness). Surfaces the work, then applies fixes behind the standard gates
  (build + Lighthouse ≥95 + 0 HARD slop + ToC), one focused commit, held for "go live".
  Use monthly, or when asked to "check site health / find SEO or monetization wins / what should I improve next".
---

# Site Health — Hawaii Picnics & Beach Events

A maintenance loop, not a content generator. It finds where effort *pays* (and, just as
important, where it won't), then applies the fix. Read this whole file before acting — the
biggest value is the **lessons** that stop you re-grinding low-ROI work.

> **Node:** prepend `~/.local/node/bin` to PATH before any `node`/`npm`. Build = `npm run build`.
> **Never push** until the user says "go live" (each push burns a Netlify build credit). One run = one focused commit, held.

---

## The toolkit (all read-only; live in `scripts/`)

| Command | Surfaces |
|---|---|
| `npm run check:affiliates` | Posts with NO affiliate link (🔴), or missing a relevant Expedia/Booking hotel link or Amazon gear link (🟡). Per-program coverage %. |
| `npm run check:internal` | Internal-link graph: broken links, ORPHANS (0 inbound), under-linked posts, + the best related posts that should link to each. `--post <slug>` = outbound opportunities. |
| `npm run check:gsc` | From a Search Console CSV export: striking-distance pages (pos ~8-20 — one push from page 1), high-demand-but-deep pages, CTR fixes, striking-distance queries. Auto-finds the newest `*Performance-on-Search*` export folder (gitignored). |
| `npm run check:freshness` | Stale facts on time-sensitive posts: Gemini 2.5 Flash + Google Search grounding checks each post's perishable claims (prices, hours, days open, reservation/permit rules, fees, open/closed) against the live web → a re-review queue. Stalest-first by default; `--slug <slug>` for one, `--limit N` / `--all` to scale. Read-only — flags only, never edits a post. |
| `npm run check:tour-islands` | Gate: wrong-island / dangling Viator codes. |
| `node scripts/serp-optimize.mjs "<kw>" --draft <slug> --urls "..."` | The per-page re-optimization engine: scores a draft vs live competitors, lists heading/term/length gaps. |

Run the audits first; report a compact status board (coverage %, orphan/gap counts, top GSC opportunities, freshness queue) before touching anything.

---

## Leg 1 — Affiliate coverage (`check:affiliates`)

**Act:** close 🔴 (unmonetized) first, then 🟡. **Only add VERIFIED links** — never hand-build a Viator URL (wrong-island codes have shipped before): pull tours from `content/viatorTours.ts`, Expedia from the verified per-island IDs, Amazon as `amazon.com/s?k=<thing>&tag=hawaiipicnics-20`, Booking.com via the CJ deep link `https://www.tkqlhce.com/click-101771406-17293132?url=<encoded booking.com/searchresults?ss=<Island>>`.
- The cleanest monetization with zero prose risk is adding a `tours: [...]` field (renders the related-tours footer) using codes already live on same-island posts.
- For lodging-gap posts, weave one natural "Where to stay: compare [Island hotels on Booking.com](…) or [on Expedia](…)" line before the FAQ.
- **Don't force affiliates onto info/culture posts with no natural fit** (e.g. a flowers explainer) — "useful first" wins. Mark those intentionally skipped.

## Leg 2 — Internal links (`check:internal`)

**Act:** de-orphan (0 inbound) first, then under-linked. Add the inbound link by **weaving it into the linker post's EXISTING related-link cluster sentence** (the "…see also our [X], [Y]…" line), never as a bolted-on sentence. Verify the target slug exists (no broken links). The flagship hub posts especially must not be orphans.

## Leg 3 — Google rankings (`check:gsc`)  ← highest ROI, but know where it pays

Export GSC → Performance → (Pages + Queries) → CSV into a `*Performance-on-Search*` folder, then run. For each candidate page, run `serp-optimize` and **diagnose before editing**:

- **Striking-distance page (pos ~8-20) with an INTENT or HEADING gap → biggest win.** e.g. a Hawaii-wide keyword served by an island-only post → broaden to all islands (`best-sunset-in-hawaii` went 28→81 this way). The single most reliable lever is **the exact primary phrase in an H2/H3** (often 0× on otherwise-good posts).
- **Already-comprehensive page that's still deep (pos 30+) and scores ~90 on serp-optimize, with many inbound links + recent date → it's an AUTHORITY gap, not a content gap. LEAVE IT ALONE.** (`best-time-to-visit-hawaii`: 93/100, 45 inbound, pos 42 — more tweaking is busywork; the ceiling is off-site backlinks + time.) Don't fake-bump the date on a page changed in the last few days.
- **Name-density-gated SERPs (e.g. "best luau …"):** the local serp score can undercount real improvements — adding a genuinely-missing entity (a popular luau competitors all cover) is worth it for readers + coverage even if the number barely moves. Judge the post, not just the score.

**Re-optimization steps:** broaden intent if mismatched → put the exact phrase + competitor heading terms in H2/H3s → fill genuine content gaps with VERIFIED facts (web-search to confirm; never invent prices/details) → bump `dateModified` only with a real change → keep all affiliate/internal links + infographics.

## Leg 4 — Freshness / accuracy (`check:freshness`)  ← protects the "honest + current" promise

Travel facts rot: admission prices, hours, days open, reservation/permit rules, resort fees, open/closed status. `check:freshness` runs Gemini Flash + Google Search grounding over time-sensitive posts (stalest `dateModified` first) and prints a re-review queue of posts whose facts the live web contradicts.

- **Run it batched, prioritized.** Default is the stalest ~6; use `--limit 10-15` for a sweep. Prioritize the intersection of **(a) GSC striking-distance** (a stale price on a page about to crack page 1 is worth fixing; on a buried page it isn't) **and (b) money/logistics posts** (resort/tour/attraction pricing, reservation rules). Skip pure explainers (what-is-hula, hawaiian-food) — they carry no perishable facts.
- **It's a detector, not an editor — confirm before you change a live page.** Gemini grounding is ~80% reliable (same skepticism as the PAA tool). For each STALE flag, **verify the new value yourself against the primary/official source** (WebFetch the cited URL), then apply the correction in the house voice and **bump `dateModified`** (the sitemap lastmod re-crawl signal). Never paste Gemini's wording, and never trust a single flag blind.
- **Then re-audit the slug** (`check:freshness --slug <slug>`) to confirm the flags clear, and run the shared gates below.

A confirmed freshness fix IS a re-optimization — fold it into the same Leg 3 pass on that post where they overlap.

---

## Shared gates (every edit, before commit)
- `npm run build` → `○ (Static)`, no errors.
- `node scripts/ai-slop-check.mjs <slug>` → 0 HARD tells.
- **Lighthouse ≥ 95 / 100 / 100 / 100** (note: tour-card posts can read bp ~77 due to third-party-cookie images from the tripadvisor CDN — a pre-existing site-wide issue, NOT caused by your edit; flag it, don't block on it).
- ToC anchors resolve (0 missing) — re-check after any heading rename (anchor = slugified heading text).
- `check:tour-islands` still passes if you touched tours.

## Report + commit
- Report a ✅/status line per fix (what changed, the before→after serp score where relevant, gate results) — a skimmable board, not prose.
- One focused commit (co-author trailer), **held — do not push until "go live."**
- After a re-optimization round, remind the owner to **re-export GSC in ~4 weeks and re-run `check:gsc`** to measure if pages climbed — data beats guessing.

## Acceptance criteria
- Ran the relevant audit(s); reported the findings board before editing.
- Acted on the **highest-value** items only; explicitly skipped low-ROI ones (authority-gated, no-natural-fit) with the reason — no busywork.
- Only verified affiliate links / facts added; nothing invented.
- All gates green; affiliate/internal links + infographics preserved.
- One commit, held for "go live."
