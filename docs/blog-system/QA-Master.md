# QA-Master — the single consolidated blog-post QA (LIVE DOCUMENT)

> **What this is.** The one place that lists EVERY rule block a blog post is QA'd against, the bar
> for each, which tool enforces it, and whether it's a HARD gate or a 👁 judgment call. After a post
> is written, I **loop back** and run `node scripts/qa.mjs <slug>` — it scores every block, prints a
> single verdict, and appends the result to `qa-logs/`. This sits ON TOP of the individual gates
> (serp-optimize / post-stats / ai-slop / post-checklist / voice-scorecard / freshness / lighthouse /
> npm check) — it does not replace them, it rolls them up so quality is consistent every time.
>
> **This is a LIVE document.** When we find a better way, retire a rule, or add one, we edit THIS file
> (and `qa.mjs` if the check is automatable) and log it in the Change-log at the bottom. TheBible.md
> stays the prose contract; this is the operational checklist + score sheet.

---

## The pointing system

Each block gets a status:
- **✅ PASS** — every HARD check in the block is green.
- **👁 VERIFY** — HARD checks pass, but the block has judgment rows that need a one-line verdict (I answer each).
- **❌ FAIL** — a HARD check is red.

Every ❌ is then classified:
- **🟢 EASY-FIX** — mechanical / quick (split a long para, rename a heading, add a term, lighten an image). **I fix it and re-run.**
- **🔴 EXEC-DECISION** — a HARD bar genuinely can't clear without a tradeoff the owner must judge (e.g. serp caps ~83 on a vendor-stuffed commercial SERP; pushing to 90 needs stuffing). **I flag it with the numbers; owner ships or holds.**

**Overall verdict:**
- **SHIP-READY** — all HARD blocks ✅, all 👁 rows verdicted.
- **FIX-FIRST** — one or more 🟢 easy-fix fails open → fix, re-run.
- **EXEC-DECISION** — only 🔴 owner-judgment items remain → owner calls it.

**Score line** (logged every run): `QA: <hardGreen>/<hardTotal> HARD blocks · <verifyDone>/<verifyTotal> judgment · verdict: <X>`.

> **100% is NOT the goal.** This is guidance + an executive summary the owner can override, not a
> must-clear-every-box gate. Some rules genuinely pull against each other (see the tensions map
> below), so a perfect score isn't always possible OR desirable. The job of this QA is to make the
> tradeoffs VISIBLE — "this post is clear and concise but a touch less funny," "hitting serp 90 here
> would cost the band" — so the owner decides with eyes open and we don't silently break one rule to
> serve another. Repeatable system, owner has the final call.

---

## Known rule tensions (when we add/change a rule, check what it strains)

This is the "if we apply rule X, which rule gets worse" map — the antidote to changing one thing and
silently breaking another. When a NEW rule is added or an experiment is run, look here first, then
confirm the strained side held (the voice-scorecard + Block 13 are the live check).

| Add / tighten this… | …and watch this strain | How we hold both |
|---|---|---|
| **Concise (#1)** | **Humour (Block 4)** — trimming cuts beats first | cut FILLER not BEATS; a tight line can BE the joke (§0a #6a) — *this is the one that bit us twice* |
| **Concise (#1) / short paras** | **SERP coverage (Block 1)** — fewer words = fewer terms | weave terms into the beats; use the heading lever (×0.35) not body bloat |
| **SERP coverage (Block 1)** | **Length band (Block 2)** — more terms push over the ceiling | swap don't add; merge sections; band wins, stuffing forbidden |
| **Length band ceiling (Block 2)** | **250w/section + humour** — a tight band can't hold many fat funny sections | FEWER sections (merge), keep the beat per surviving section |
| **Simple words / reading ≤10 (#4)** | **SERP terms (Block 1)** — the ranking word may be the "fancy" one | keep serp-dictated terms ("located/intimate"); simplify only the rest |
| **RFT positive framing (#2)** | **"tell people when NOT to" honesty (Block 9/voice)** | reframe to "do X when Y" — keeps the honesty AND the positivity |
| **Humour (Block 4)** | **Somber topics (drownings, culture, tragedy)** | ZERO humour near somber — this tension is a hard stop, not a balance |
| **Active voice (#3)** | occasionally **natural phrasing** | recast the agentful "X by Y"; leave predicate adjectives ("is calm") alone |

_(Add a row when a new rule introduces a new tension. This table + the Change-log are how we keep calibrating instead of re-hallucinating.)_

---

## The blocks

### 1 · KEYWORD & SERP  *(HARD)*
| Check | Bar | Tool |
|---|---|---|
| Primary keyword unused before + logged | not in Used_Keywords | post-checklist 1.1 / Used_Keywords.md |
| Slug clean, not redirect-shadowed | lowercase-hyphen, no `_redirects` hit | post-checklist 1.2 |
| Genuine competitors only | no Reddit/TA/Wiki/YT/news/vendor | 👁 |
| Cannibalization judged by INTENT | distinct intent → build+demote; same → hold | 👁 (cannibal-check.mjs assists) |
| **SERP score ≥ 90 (raw)** | ≥90 (travel); commercial SERPs may cap → 🔴 exec-decision | serp-optimize.mjs |

### 2 · LENGTH & STRUCTURE  *(HARD)*
| Check | Bar | Tool |
|---|---|---|
| Length IN band | median…longest-genuine (outlier excluded); not under floor / over ceiling | post-stats.mjs / voice-scorecard |
| Section count ≈ target÷280 | ~6–8 H2 for ~1,700 band; merge when over | post-stats |
| No thin content section | every content H2 ≥ 250w | post-stats |
| ToC anchors resolve | 0 missing | post-checklist 3.6 |

### 3 · VOICE — CONVERSION (§0a)  *(mix)*
| Check | Bar | Tool |
|---|---|---|
| #1 Concise | 0 paras >3 sentences; not a wall of 1-liners | voice-scorecard CONCISE + AUTO 6.4b |
| #2 RFT / positive framing | avoidance-framing reframed to "do Y when Z" | voice-scorecard RFT (hint) + 👁 |
| #3 Active voice | low passive; no agentful "X by Y" | voice-scorecard ACTIVE (hint) + 👁 |
| #4 Simple words | reading grade ≤10 (unless serp-dictated) | voice-scorecard READING |
| #5 Gender-neutral "partner" | no her/she on couple posts | 👁 (couple/wedding posts only) |
| #6 No clever-for-clever | specific+plain > writerly | 👁 |

### 4 · VOICE — HUMOUR  *(HARD floor + evidence)*
| Check | Bar | Tool |
|---|---|---|
| **Dry beat per content section** | **≥1 beat LISTED per content H2 in the report** (no beat = dry = fail) | voice-scorecard wit-markers + report evidence |
| Smile cadence | ~1 per 200–300w | 👁 |
| Funny-first, beat carries the fact | not garnish-on-encyclopedia | 👁 |

### 5 · AI-SLOP / TELLS  *(HARD)*
| Check | Bar | Tool |
|---|---|---|
| **0 HARD tells** | exit 0 | ai-slop-check.mjs |
| #7 no "lush"/"turquoise" | HARD | ai-slop |
| No exclamation marks / emoji in prose | 0 | ai-slop / post-checklist 5.3 |
| ASCII Hawaiian; okina/macron in parens on first mention only | headings/ToC/alt/meta ASCII | ai-slop / post-checklist 5.5 |

### 6 · ANSWER & SKIMMABILITY  *(mix)*
| Check | Bar | Tool |
|---|---|---|
| Answer first, no tease + dry hook in first 50w | — | 👁 post-checklist 2.1/2.4 |
| Bold the answer PHRASE (intro) + key phrases through body (≥1/H2) | — | post-checklist 2.2/2.2b |
| Keyword in first 100w + H1 + title | — | post-checklist 2.3 |
| #8 TL;DR set, ≠ first paragraph, ≠ excerpt | 40–55w answer + 3–5 bold bullets | AUTO 3.3a-e |
| Snippet format matched (para/list/table) | — | 👁 3.2 |
| Quick-facts strip per spot/item · decision-helper · anticipate-next · ≤2 sensory | — | 👁 4.2/4.3/4.4/4.5 |

### 7 · FAQ  *(mix)*
| Check | Bar | Tool |
|---|---|---|
| FAQ = leftover questions only | no body dupes (swap test) | 👁 3.4 |
| Bold lead phrase each answer | — | post-checklist 3.5 |
| 4–8 Qs, 2–4-sentence answers | — | post-checklist |
| FAQPage JSON-LD | present | post-checklist 8.2a |

### 8 · VISUALS  *(HARD + judgment)*
| Check | Bar | Tool |
|---|---|---|
| **Infographic cadence** | **≥1 native infographic / ~500w (HARD, own count)** | post-stats / post-checklist 6.5a |
| Photo cadence | ~1 vetted photo / ~500w (soft) | post-checklist 6.5b |
| Cover INSPECTED | sharp, colourful, on-location, not B&W/generic/mislabelled | 👁 6.3a-i |
| In-body photos INSPECTED | quality + location accuracy, each candidate viewed | 👁 6.3b |
| X-vs-Y compare VISUAL + `::directions` on location posts | — | post-checklist 4.6 |
| No fact duplicated in prose AND visual | — | 👁 6.5 |

### 9 · LINKS & AFFILIATES  *(mix)*
| Check | Bar | Tool |
|---|---|---|
| 3–5 internal links, descriptive anchors | — | post-checklist 4.8/6.2a |
| 2–3 authority links, ALL curl-200 | .gov/.edu/major | post-checklist 6.2 + curl |
| Read-next = a top-8 vector neighbor | related.json populated | post-checklist 4.9a/4.9b |
| Tour: 1 `::tour` hero + `tours[]` block, codes cached, correct island | — | post-checklist 7.2a/7.2b/7.2c + check:tour-islands |
| Hotel card if a named property is in hotels.ts (grep-gate); else Expedia search | — | 👁 7.2e (search by `"area":`/`"name":`, NOT `id:` — JSON file) |
| Every monetizable intent mapped (~1/300–400w, never stacked) | — | 👁 7.1 |
| `rel=sponsored nofollow` + FTC disclosure render | — | post-checklist 7.3 |
| 1 soft picnic mention max (Oahu only; off-island = no CTA) | — | 👁 |

### 10 · FRESHNESS / ACCURACY  *(HARD)*
| Check | Bar | Tool |
|---|---|---|
| Perishable claims verified at source | 0 stale (audit over-flags ~½ — verify each) | freshness-audit.mjs |
| Visible "as of <year>" signal | present | post-checklist 4.7 |
| Real numbers only (stats.md / curl-200 / corpus "about") | nothing invented/rounded | 👁 |

### 11 · TECH / SEO / SCHEMA  *(HARD)*
| Check | Bar | Tool |
|---|---|---|
| seoTitle ≤60 (kw near start), differs from H1 | — | post-checklist 6.1a/6.1c |
| meta description ≤160 (kw+benefit) | — | post-checklist 6.1b |
| Canonical = www · sitemap `<loc>` = www | — | post-checklist 8.2c/8.2d |
| JSON-LD: BlogPosting + FAQPage + BreadcrumbList; NO ItemList/HowTo/Review | — | post-checklist 8.2a/8.2b |
| Imgs: alt + WebP + width/height (first eager, rest lazy) | <200KB | post-checklist 8.2e |
| No raw `::directive` leaked into HTML | 0 | post-checklist 8.2f |
| No paragraph >150w / ~700 chars | — | post-checklist 6.4 |
| Dehyphenate applied (machine tokens intact) | guard ::keys + #anchors | dehyphenate.mjs |

### 12 · BUILD & DEPLOY GATES  *(HARD)*
| Check | Bar | Tool |
|---|---|---|
| Build clean | route `○ (Static)` | npm run build |
| Repo checks | all pass ("safe to deploy") | npm run check |
| **Lighthouse** | **≥95 / 100 / 100 / 100** (desktop; hotel-card bp 96 localhost = 100 prod, documented) | lighthouse |

### 13 · REGRESSION WATCH  *(judgment — the loop-back)*
| Check | Bar | Tool |
|---|---|---|
| What rule/constraint changed this run? | named | 👁 |
| Which OTHER axes re-checked vs last good post? Any drop? | named + verdict | 👁 + voice-scorecard diff |
| Rule-interaction logged to memory | done | 👁 |

### 14 · LOGGING & POST-PUBLISH  *(HARD-ish)*
| Check | Bar | Tool |
|---|---|---|
| Used_Keywords + AffiliateLinks + exec summary written | done | post-checklist 8.4b |
| 1–3 backlinks IN (de-orphan) | INBOUND ≥1 | internal-link-audit |
| website-index.md + related.json regenerated & committed | done | gen-website-index / embed-related |
| Focused commit (co-author trailer), held for go-live | not pushed until "go live" | git |
| After deploy: confirm www canonical + GSC Request Indexing | reminder | 👁 |

---

## Change-log (calibration · additions · retirements)

- **2026-06-20 — CREATED.** Consolidated the existing gates into 14 blocks + a pointing system + `qa.mjs` runner + this live registry. Trigger: owner wants one consistent, printed, logged final QA every post (and a place to recalibrate).
- **2026-06-20 — ADDED Block 4 (Humour) teeth.** Humour beat now requires LISTED evidence per content section (was a silent 👁 row); `voice-scorecard.mjs` flags zero-wit sections. Trigger: "concise" silently killed the humour twice ([[conversion-style-suppressed-humour]]).
- **2026-06-20 — ADDED Block 3 metering for #2 RFT + #3 active voice.** Both were teeth-less judgment rows that could drift like humour did; `voice-scorecard.mjs` now meters passive-voice + avoidance-framing as hints.
- **2026-06-20 — ADDED Block 13 (Regression watch)** as a required loop-back step.
- _(Add new rows here when we calibrate / retire / add a rule. Date + what changed + why.)_
