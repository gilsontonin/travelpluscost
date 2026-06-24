---
name: create-money-page
description: >-
  Create ONE conversion-focused service "money page" for Hawaii Picnics & Beach Events
  (e.g. proposals, elopements, vow renewals, bachelorette). Picks an unused cluster
  from the cleaned keyword master, designs 3 packages wired into the existing Stripe
  checkout, researches the SERP, drafts a guide-style page in the house voice with
  REAL numbers, sources Unsplash images, adds it to content/services.ts, cross-links
  it, and verifies on-page SEO + schema + Lighthouse + voice/humour. Pauses for human
  review at 3 checkpoints and never commits without being asked. Use when the user
  says "create a money page", "build a service page", "/create-money-page", or names
  a service cluster (bachelorette, birthday, honeymoon, anniversary, photographer...).
---

# Create Money Page — Hawaii Picnics & Beach Events

Produces ONE complete, build-passing, SEO-optimized **service money page** that ranks
for a commercial cluster AND converts. Three already exist and are the templates:
`/services/oahu-elopement/`, `/services/hawaii-proposal/`, `/services/hawaii-vow-renewal/`.

**Argument (optional):** a service cluster/theme name (e.g. "bachelorette"). If omitted,
auto-pick the next theme from the keyword master (Step 1).

---

## Positioning (read first — this INVERTS the blog skill)

A money page is a **conversion page**. Unlike `write-blog-post` (where the picnic service
is a *soft, secondary* mention), here **the packages ARE the point.** Reuse the blog skill's
*machinery* — house voice, humour, SERP-length research, on-page SEO, FAQ/ToC schema,
Unsplash-first images, internal/external links — but write to **sell the service**, not just
inform. Still genuinely useful and funny; still honest; still "tell people when NOT to hire you."

The page reads like a long-form guide with the packages embedded as the conversion section.

---

## Conversion format — the house standard (adopted 2026-06-08, proposal page is the template)

A money page must **rank AND convert**. The two are not in tension — do them in this order:

1. **SERP-set the length FIRST, per keyword — there is NO fixed floor.** Length is the SERP's call,
   not a UX call and not a magic number. Research the SERP (Step 2): the floor = the realistic
   **comprehensive single-service competitor × 1.10–1.20**, and always beat the thin vendor pages.
   These pages have *happened* to land ~3,000w, but that is a coincidence, not a rule — some clusters
   want less, some more, and "3,000" is a crutch, not a target. **Discount aggregator/directory
   mega-pages as length outliers** — a national brand's 6,000-word multi-island hub (e.g. Simply
   Eloped on the elopement SERP) is not the bar; match the comparable single-service guide, not the
   directory. *Lesson the hard way: the proposal page was trimmed to ~2,100w for "conversion" without
   re-checking the SERP — its real SERP floor was ~2,900; and the elopement page was waved through as
   "over 3,000" without ever measuring its SERP (it happened to be fine at ~3,600, but that was luck).*
   The noindex lead-magnet guide can be 1,500 (no SEO job); an indexed money page lives by its SERP.
2. **THEN apply the conversion layer (this is what makes it not read like a novel):**
   - **Tight intros** — 1–2 punchy sentences before each card, never a wall. **Bold the direct
     answer** to the section's question (the snippet line).
   - **Colorful native cards** — convert dense prose/tables into `::infographic` cards/compares/
     stat-panels. Cards are colorful site-wide now (rotating pastels), carry crawlable text (so they
     count toward the SERP length), and break the page up. Aim a graphic every ~1–2 sections.
   - **A `::cta` button after (almost) every card** — to the *most relevant* page each time
     (`/#packages`, `/#contact`, a sibling `/services/<slug>/`); vary them, some phrased as a
     question. Cards are where the eye stops, so that's where the ask goes.
   - **A `::brief` summary box** (a short "in short" line + an embedded CTA) once or twice, at the
     attention points.
   - **The blog CORE UPGRADES still apply** — hook, answer-first, decision-helper ("if you only do
     one…"), comparison charts, first-hand local detail, the FAQ (8+ Qs, FAQPage schema).
   - **Soft close, no urgency.** Value-first; the buttons do the asking.
3. **Verify both:** the SERP length is met (≥ floor, count the rendered card text), AND Lighthouse
   ≥ 95 / 100 / ≥ 95 / ≥ 95, schema complete, ai-slop clean. Cards darken their note text for
   contrast on the pastels (already in `globals.css`).

---

## Hard rules (never break)

1. **Read the reference files before writing a sentence** (table below).
2. **Never reuse a primary keyword** already in `Keywords/Used_Keywords.md`. Log every use.
3. **Never invent numbers.** Real figures come from `References/stats.md`. **Package prices for a
   NEW service are a business decision** — propose them, mark them **PROPOSED pending owner
   sign-off** in `stats.md`, and call it out at Checkpoint 2. Never present proposed prices as final.
4. **Never link to a route that isn't built.** Internal links go to existing destinations only:
   `/`, `/blog/`, `/blog/<existing-slug>/`, `/services/<existing-slug>/`, and on-page anchors
   `/#packages`, `/#contact`, `/#about`, plus the page's own `#packages`.
5. **Pause for approval at the 3 checkpoints.** Never `git commit`/`push` unless the user asks.
6. Brand = Oahu beach picnics & events. Many money clusters are **statewide "hawaii"** terms
   (e.g. "hawaii proposal") even though we serve **Oahu only** — target the big term and be honest
   it's an Oahu service. That's fine and on-brand.

## Reference files to read

| Purpose | File |
|---|---|
| Brand voice | `References/DanKennedyVoice.md` |
| Humour rules (mandatory) | `References/Humour.md`, `References/FunnyHumor.md` |
| Real numbers | `References/stats.md` |
| Opinions (max 1/page) | `References/Opinions.md` |
| Stories (max 1/page, adapt — don't invent) | `References/Stories.md` |
| On-page SEO checklist (pass every applicable item) | `References/OnPageSEOCheckList.md` |
| Lighthouse rules (images/contrast) | `LightHouseBestPractices/LighthouseBestPractices.md` |
| **Keyword master (source of truth for clusters)** | `Money Keywords/_MASTER_money-keywords.csv` |
| **Cluster opportunity map** | `Money Keywords/_MASTER_money-page-opportunities.md` |
| Used keywords (never reuse) | `Keywords/Used_Keywords.md` |

---

## The infrastructure already exists — REUSE it, do not rebuild

A new money page is mostly **data**, not new components. The plumbing is built:

- **`content/services.ts`** — the `Service` type + `services[]` array. Add the new page as a
  `Service` object at the **TOP** of the array (newest first; the hub renders in array order).
  Type (mirror an existing entry):
  ```ts
  { slug, title, seoTitle?(≤33 chars so full tag ≤60), description(≤160), excerpt, date(YYYY-MM-DD),
    dateModified?, author:"Hawaii Picnics & Beach Events", category, icon (IconName),
    packageGroup: <new group>, packagesSection:{eyebrow,title,sub,footnote},
    heroStats?:[{value,label}], coverImage?{src,alt,width,height}, body (Markdown), tours? }
  ```
- **`content/packages.ts`** — add the new group to the `PackageGroup` union, then add **3 `Package`
  objects** with `group: "<new-group>"` and unique slugs. `getPackages(group)` filters; the homepage,
  the `[slug]` route, and the checkout are **all group-scoped**, so a new group is automatically
  isolated (won't leak into picnic/other pages). One of the 3 should be `featured:true` with a `badge`.
- **`app/services/[slug]/page.tsx`** — the route is **data-driven**. It already renders: header with
  category + hero stats + dual CTA, the markdown body (`Prose`), the **embedded `#packages` section**
  (PackageCards → Stripe `ReserveButton`), named **testimonials**, "From the blog" related posts, and
  the full JSON-LD (`Service` + `OfferCatalog`/Offers + `FAQPage` + `BreadcrumbList` + `LocalBusiness`
  w/ **PostalAddress** + author). The packages-section copy comes from `service.packagesSection` — do
  NOT hardcode it. **You normally edit ZERO route files** — just add the `Service` + packages data.
- **`app/services/[slug]/opengraph-image.tsx`** — auto-generates the 1200×630 OG card per service.
- **`app/sitemap.ts`** — auto-includes every service (priority 0.9). No edit needed.
- **`content/site.ts`** `NAV` has a **"Services"** hub link; **`components/Footer.tsx`** lists service
  pages — add a footer `<li>` for the new page.
- FAQ schema is automatic: a `## ... FAQ` section with `### Question` H3s → `extractFaqs` emits FAQPage.
- Markdown renderer (`lib/markdown.ts`): first image becomes eager + `fetchpriority=high`; external
  links get `rel`; `?w=&h=` set dimensions. Unsplash + Pexels hosts are CSP-whitelisted.

## Gotchas learned the hard way (DON'T repeat these)

- **Package prices must be comma-free numeric strings** — `"1950"`, not `"1,950"`. `Number(pkg.price)`
  in `lib/booking.ts` (subtotal) and the Stripe function break on commas (NaN). Display formats the
  thousands separator at render via `toLocaleString` (already done in `PackageCard` + checkout).
- **LocalBusiness schema requires `address`** — the `[slug]` route already includes a `PostalAddress`
  (Honolulu/HI/US). A site audit flagged the service pages once for a missing address; don't remove it.
- **FAQ answers stay CLEAN** — no jokes in the FAQ. Jokes there hurt featured-snippet extraction. Put
  the humour in the body sections, keep FAQ direct (2–4 sentences each).
- **`packagesSection` is data-driven** — set its `eyebrow/title/sub/footnote` per service; never hardcode
  service-specific copy in the route (it's shared by all service pages).
- **Slug = primary keyword**, lowercase, hyphens. Check `public/_redirects` for a collision before finalizing.
- **External authority links rot** — verify each `.gov`/major-source link returns **200 with a browser
  UA** before shipping (a past audit found 8 dead links). Prefer stable official pages.

---

## Workflow

### Step 1 — Pick the cluster (from the keyword master)
- Open `Money Keywords/_MASTER_money-page-opportunities.md` (themes ranked by volume, with the 2 built
  ones flagged) and the full `Money Keywords/_MASTER_money-keywords.csv`.
- Choose an **unused theme** (not already a `/services/` page; check `content/services.ts` + `Used_Keywords.md`).
  Pick the **primary keyword** (prefer KD<30, Volume>100, commercial intent) and its **secondary cluster**
  (the same theme's rows). Statewide "hawaii" terms are allowed (we serve Oahu — be honest).
- Plan the **3 package tiers** (entry / featured / premium-or-family) and **proposed prices**, anchored
  to `stats.md` (picnics $349–899; existing services: proposal $899–2,400, vow-renewal $1,650–4,500,
  elopement $1,950–5,900). Slot the new service sensibly among them.

### 🔶 CHECKPOINT 1 — show the user: the chosen theme, primary keyword (vol + KD) + secondary cluster,
the page angle, the 3 proposed packages **with proposed prices (flagged PROPOSED)**, and the slug.
**Wait for approval** before researching/writing.

### Step 2 — Research the SERP & set length
- Web-search the primary keyword; open the top 3–5 ranking pages; record each one's **format + body word
  count**, the shared topics, and gaps. Most service SERPs = thin vendor package pages (~1,000–2,000w) +
  one comprehensive guide.
- **Target = the comprehensive competitor × 1.10–1.20** (and always beat the thin vendor pages). Service
  pages have landed well at **~3,000 words**. State the target explicitly.

### Step 3 — Design the packages (data)
- Add the new group to `PackageGroup` in `content/packages.ts`; add **3 `Package` objects** (`group` set,
  unique slugs, **comma-free prices**, one `featured` + `badge`, `addGuests` on the top tier if it scales).
- Inclusions should ladder ("Everything in X, plus…") and reflect what the service actually needs
  (officiant/celebrant, permit, florals, photographer, reception, etc.).

### Step 4 — Draft the body (house voice, money-page tuned)
- Apply `DanKennedyVoice.md` + both humour files. **Aim for a genuine smile every ~200–300 words** —
  measure it (beats ÷ words). The informational middles (license/permits/locations/packages) drift dry;
  punch them up with kind, specific jokes. No exclamation marks, no emojis, no AI-tells ("world-class",
  "unlock", "leverage", "seamless", "in today's", "elevate").
- **Answer the query in the first paragraph** (featured-snippet) with the primary keyword in the first 100
  words, the H1, and the title. Weave secondaries naturally.
- Structure (~10 H2s + intro + FAQ): what-it-is/why-Oahu · the key practical thing (license/permit/cost) ·
  **best Oahu locations** (H3 per beach: Ko Olina, Lanikai/Kailua, Magic Island/Ala Moana, Waimanalo/North
  Shore, a lookout) · **our packages** (link to `#packages`) · all-inclusive-vs-DIY cost reality · the
  people/extras · timing/when · **who should NOT do this (and where to send them)** · FAQ.
- **Max ONE opinion** (`Opinions.md`, with a number) and **ONE story** (`Stories.md`/real reviews in
  `site.ts`, adapted — never invent). Include a **Table of Contents** with anchor links.
- **Cross-route mis-matched intent:** link sibling service pages (e.g. "not married yet? → elopement").
- Short paragraphs (2–3 sentences), generous white space, scannable bullets.

### 🔶 CHECKPOINT 2 — show the user the full draft (markdown body) + proposed title/seoTitle/description/
excerpt/slug/category/icon **and the 3 packages with proposed prices**. **Wait for edits/approval** before
touching `content/services.ts`.

### Step 5 — Cover photo + native infographics (the standard)
- **All service-page bodies use native HTML infographics, not in-body photos** — one
  `::infographic` per section, each with the auto booking CTA. Run the **`add-infographic`
  skill → "Service-page conversion"**: add `cards`/`steps`/`compare`/`island-selector`
  entries (keyed with this page's service prefix so the CTA attaches) to
  `content/infographics.ts`, and put `::infographic <key>` after the first paragraph of each
  section. Crawlable, zero-CLS, converts — this is how all 4 live service pages are built.
- **Cover only** is a photo: 1 `coverImage` (800×500, keyword in alt) — Unsplash
  `…?fm=webp&fit=crop&w=800&h=500&q=80`, attribution in alt. The index card shows it. Do **not**
  add in-body photos; the infographics are the section visuals.
- If the owner supplies a slide-deck PDF for the page, rasterize it (pypdfium2) and map slides
  → sections per `add-infographic`. No deck → build the infographics from the section content.

### Step 6 — Add the page (data files)
- Insert the `Service` object at the **TOP** of `services[]` in `content/services.ts` with `packageGroup`,
  `packagesSection`, `heroStats`, `coverImage`, and the markdown `body` (plain backtick delimiter — never
  `\``). **Date:** today if unused, else newest unused day (don't future-date; mirror the blog dating rule).
- Add a **footer link** in `components/Footer.tsx`.

### Step 7 — Cross-link (anti-orphan, both directions)
- **Out** (in the body): 3–5 existing blog posts + sibling service pages + `#packages`/`/#contact`.
- **In:** add a contextual link to the new page from the **/blog/ index intro** AND from **≥1 existing
  post** (verify the anchor phrase is unique with `grep -c -F` before editing). Footer + "Services" nav
  already cover it too.

### Step 8 — Log keyword + record price
- Append primary (+ secondaries) to `Keywords/Used_Keywords.md` (table row + cluster block).
- Add a **"<Service> packages"** section to `References/stats.md` marked **⚠️ PROPOSED pending owner
  sign-off** (until the user approves; then flip to ✅ APPROVED).

### Step 9 — Build & verify
- `export PATH="$HOME/.local/node/bin:$PATH" && npm run build` — clean; `/services/<slug>` shows `● (Static/SSG)`.
- Audit `out/services/<slug>/index.html`: title ≤60, meta 150–160, one H1 w/ keyword, **JSON-LD present:
  Service + OfferCatalog(3 Offers) + FAQPage(4–8) + BreadcrumbList + LocalBusiness (with PostalAddress) +
  author**, every `<img>` alt+WebP+dims (first eager), ToC anchors resolve, canonical + `sitemap.xml` `<loc>`
  both **www**, no `public/_redirects` collision, **group isolation** (new page shows only its 3 tiers;
  homepage still picnic-only), E-E-A-T (updated-date `<time>`, named testimonials), tel: click-to-call.
- **Verify every external authority link returns 200** (browser UA).
- **Lighthouse** (serve `out/`, run on the page): Performance ≥95, SEO 100, Accessibility ≥95, Best-Practices ≥95.
- **Voice/humour pass:** AI-tell grep clean; 0 exclamations/emoji; humour density ~1 per 200–300 words; one
  opinion; one story; "tell when NOT to hire" present; FAQ clean.

### Step 8b/Exec summary
- Write **`exec-summaries/<primary-keyword-slug>.md`**: keywords (primary vol+KD + secondary), length math
  (competitor counts, target, result), links (internal/external/inbound), the 3 packages + proposed prices,
  a pass/fail check line (build/SEO/schema/Lighthouse 4 scores), voice/humour verdict, and 💰 monetization +
  🌺 on-the-ground service notes.

### 🔶 CHECKPOINT 3 — report the build audit + Lighthouse scores + the on-page SEO checklist pass/fail table
+ the voice/humour verdict, and link the exec summary. **Do not commit.** Ask whether to commit; if yes, stage
only the page-related files (`content/services.ts`, `content/packages.ts`, `components/Footer.tsx`,
`content/blog.ts` + `app/blog/page.tsx` for inbound links, `Keywords/Used_Keywords.md`, `References/stats.md`,
`exec-summaries/<keyword>.md`), confirm `.env` is not staged, commit + push over SSH (focused commit).

### Step 10 — After deploy
- Site deploys from **`main`** via Netlify (needs build credits). Confirm the live URL returns 200 with the
  **www** canonical, the hub lists the new service, and structured data validates. Then: **GSC → Request
  Indexing** on the new URL + re-submit `/sitemap.xml`. Add an inbound link if anything's still orphaned.

---

## Acceptance criteria
- Build passes; route is static; on-page SEO checklist all ✅; **Lighthouse** Perf ≥95 / SEO 100 / A11y ≥95 / BP ≥95.
- JSON-LD complete (Service + OfferCatalog + FAQPage + BreadcrumbList + **LocalBusiness w/ address** + author);
  canonical + sitemap `<loc>` are **www**; slug not shadowed by `_redirects`.
- 3 packages in a **new `PackageGroup`**, comma-free prices, group-isolated (homepage/checkout unaffected);
  prices flagged PROPOSED until the owner signs off.
- Voice/humour: ≤1 opinion, ≤1 story, only real numbers, AI-tell scan clean, ~1 smile/200–300 words,
  "tell-when-NOT-to-hire" present, **FAQ clean**.
- Primary keyword unused before, logged after; images Unsplash-first with attribution; all external links 200.
- Cross-linked both ways (out + ≥1 inbound from a post + blog index + footer); exec summary written.
- Stopped at all 3 checkpoints; no commit unless explicitly requested.
