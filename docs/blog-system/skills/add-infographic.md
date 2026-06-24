---
name: add-infographic
description: >-
  Add infographics to a blog/service page on the Hawaii Picnics & Beach Events site.
  Three paths: (1) SERVICE-PAGE STANDARD — every /services/ money page's body is
  native HTML infographics (one ::infographic per section, with a booking CTA);
  convert a supplied slide-deck PDF (or page content) into them. (2) IMAGE
  infographic — drop a graphic into public/images/posts/, optimize to WebP, embed
  as a lazy photo after the hero (used on blog posts). (3) NATIVE HTML infographic
  on a blog post. Use when the user says "add an infographic", "convert the
  slides/deck", "make it a native/searchable infographic", "add the infographics",
  or drops a PDF/image to embed.
---

# Add Infographic — Hawaii Picnics & Beach Events

Three paths — pick by what the user wants:

- **SERVICE-PAGE STANDARD (native, the rule):** every `/services/` money page
  (elopement, proposal, vow-renewal, bachelorette, …) presents its **body as native
  HTML infographics** — one `::infographic` per section, each with a **booking CTA**
  underneath. Crawlable text, zero-CLS, light, on-brand, converts. When a user hands you
  a slide-deck PDF for a service page (or asks to convert one), do the **Service-page
  conversion** below. New service pages should be built this way from the start.
- **Image infographic (blog posts):** the user hands you a finished graphic (PNG/JPG).
  Optimize + embed it as a lazy photo. Pretty and fast, but the text is baked into pixels
  (not crawlable, can carry typos). Fine for blog posts; **not** the move for service pages.
- **Native HTML infographic (blog posts):** a single `::infographic <key>` where a blog
  section is genuinely a selector/timeline/comparison.

---

## SERVICE-PAGE CONVERSION → native infographics (the standard)

**Goal:** the service page's body becomes native HTML infographics — **one per section**,
each ending in a **booking CTA**. Source is usually a slide-deck PDF the user drops into
`public/images/posts/`; if there's no deck, build the infographics from the page's own
section content. All four live service pages (elopement, proposal, vow-renewal,
bachelorette) are built this way — copy the closest one.

### 1. Rasterize the deck and read every slide
- There is **no `poppler`/`pdftoppm`, no `gs`, and `sharp`/`sips` can't read PDF** on this
  box. Use **`pypdfium2`** (self-contained, no system deps): `python3 -m pip install --user pypdfium2`.
- Render each page to PNG, then tile 4–5 per **contact sheet** and Read the sheets (the
  Read tool also needs poppler, so you must rasterize first):
  ```python
  import pypdfium2 as p
  pdf=p.PdfDocument("public/images/posts/<Deck>.pdf")
  for i in range(len(pdf)): pdf[i].render(scale=2.0).to_pil().save(f"/tmp/sl/s{i+1:02d}.png")
  ```
  (Slides are ~1376×768.) Build sheets with `sharp` compositing and Read them to see content.

### 2. Map each slide to a section (and a kind)
- Read the service page's H2s. Map the **best-matching slide to each section**, choosing
  the infographic **kind** that fits the slide's shape (see the kind reference in Native mode):
  `cards` (3–4 titled points / requirements / roles / a gut-check), `steps` (a timeline /
  process), `compare` (two or three columns — DIY-vs-all-inclusive, a decision, a spectrum),
  `island-selector` (the locations / "best beaches" table).
- **Drop the redundant slides:** the title/cover slide, the package-comparison slide (the
  live `PackageCards` already render below `#packages`), the testimonials slide (the page's
  testimonials section already shows them), and the closing CTA slide (the page has a CTA band).
  Typically ~7–8 infographics out of a ~14–16-slide deck.

### 3. Add the data + directives
- Add one keyed entry per infographic to `content/infographics.ts`, keyed
  `<service-slug>-<topic>` (e.g. `hawaii-proposal-locations`, `oahu-elopement-timing`).
  Reuse the existing kinds — **no new kind needed** unless the content genuinely demands one.
- In the service body (`content/services.ts`), **insert `::infographic <key>` after the
  FIRST paragraph of each mapped section**, and **remove the section's in-body photos**
  (keep the photo `coverImage` for the index card). `content/services.ts` is edited via a
  Python script (find the post slice, regex-remove the `![...](unsplash…)\n*caption*` blocks,
  splice each directive after the first paragraph of its H2).

### 4. Booking CTA is automatic
`renderInfographic` appends a **"See the &lt;service&gt; packages →"** button (`href="#packages"`)
to any infographic whose **key prefix** matches a service (`oahu-elopement-`, `hawaii-proposal-`,
`hawaii-vow-renewal-`, `hawaii-bachelorette-`). So just **name the keys with the service prefix**
and the CTA appears — nothing per-entry. Adding a new service: add its prefix + label to the
`serviceCtas` array in `lib/markdown.ts` and the `.ig__cta` styles already cover it.

### 5. Build & verify
- `npm run build` clean. In `out/services/<slug>/index.html`: every infographic's text is
  present (crawlable), each `ig__cta` is present with the right label → `#packages`, and the
  body has **0 stock images** (cover excepted). Grep `out/_next/static/css/*.css` for each
  **variant class** (e.g. `ig-card--pick`, `ig-compare__col--pick`, `ig-compare__grid--3`,
  `ig__cta`) — confirm they survived tree-shaking.
- **Lighthouse:** Perf ≥ 95, A11y ≥ 95, BP 100, SEO 100, CLS 0. (Native infographics are
  lighter than image slides — converting a 10-image elopement page took Perf 94 → 95. Re-run
  once; single-run dips to ~91 are variance.) Then commit (hold push per the deploy rule).

---

## IMAGE INFOGRAPHIC MODE (blog posts)

### 1. Find the files & map each to a post
- The user saves graphics to **`public/images/posts/`** (anything under `public/` serves
  from the site root). `ls -la public/images/posts/` to see what's there. You CANNOT pull
  images pasted into chat onto disk — they must be saved as files first.
- **View every image** (Read the file) before doing anything. This is mandatory: you map
  it to the right post by its CONTENT, write accurate alt text from what it shows, and
  catch typos baked into the pixels.
- Map each image → an **existing** post slug (verify the slug exists in `content/blog.ts`
  / `content/services.ts`). Match by topic ("Kauai Geographic Guide" → `map-of-kauai`,
  "Hawaii Honeymoon Guide" → `hawaii-honeymoon`). If a graphic is the wrong island/topic
  for the post the user named, say so — don't embed an off-topic graphic.
- **Flag baked-in typos** (e.g. a past batch had "Costcn", "Walanae", "Rig island", a
  highway shield reading "V15"). They can't be edited without regenerating the source —
  tell the user, embed only if they accept it.

### 2. Optimize to WebP (sharp)
`sharp` is available via Next (`export PATH="$HOME/.local/node/bin:$PATH"`; no `cwebp`/
`sips`-webp on this box). For each image:
- **Resize** to a sensible max width: ~1000px for tall/portrait infographics, ~1200–1280px
  for square/landscape. These are read at full size when tapped, so don't go smaller.
- **WebP**, quality ~72 (tune down toward ~66 if needed). **Target < 200 KB**, but
  legibility wins for a text-dense graphic — 200–240 KB on a lazy below-fold image is fine
  (Lighthouse won't fail it). 
- **Rename to an SEO-friendly, hyphenated name**: `map-of-kauai-regions-guide.webp`,
  `hawaii-honeymoon-planning-guide.webp` — descriptive, lowercase, hyphens.
- **⚠️ Do NOT delete the source until you've eyeballed the WebP's legibility.** Re-encoding
  a WebP→WebP degrades it; if the text went soft you need the original to redo. (Learned the
  hard way — a dense month-by-month graphic got stuck at q54 because the source was deleted.)
  Once verified, remove the source JPG/PNG so only the optimized WebP is committed.

```bash
export PATH="$HOME/.local/node/bin:$PATH"
node -e 'const sharp=require("sharp"),fs=require("fs"),d="public/images/posts/";
(async()=>{for(const [s,o,w] of [["Src.jpg","seo-name.webp",1000]]){
  const b=await sharp(d+s).resize({width:w}).webp({quality:72}).toBuffer();
  fs.writeFileSync(d+o,b); console.log(o,(b.length/1024|0)+"KB");
}})();'
```

### 3. Embed as a photo — ALWAYS after the post's hero image
This is the #1 gotcha: the markdown renderer makes the **first** body image eager +
`fetchpriority=high` (the LCP). If you place the infographic before the post's existing
hero photo, the heavy infographic becomes the LCP and **Performance drops ~7–10 points**
(seen: 97 → 87). So:
- Insert the infographic markdown **immediately after the post's first existing
  `![...](...)` + caption block**, so the lighter hero photo stays the LCP and the
  infographic loads **lazy**.
- Reference it with **`?w=&h=` matching the real pixels** so the renderer sets explicit
  `width`/`height` (no CLS). `lib/markdown.ts` `extractDimensions` reads `?w=&h=` from
  relative/local URLs; no srcset is built for local files (they're pre-optimized).
- These are the brand's own graphics → **no photographer attribution**, but add a short
  italic caption for context.

```markdown
![Descriptive, keyword-rich alt naming the regions/contents](/images/posts/seo-name.webp?w=1000&h=1792)
*One-line caption giving the at-a-glance takeaway.*
```

`content/blog.ts` is a multi-MB single file usually edited via a Python script (the Edit
tool may reject it as "modified since read"). Pattern: regex-match the post's first
image+caption block within `slug: "<slug>"...` and splice the infographic after it.

### 4. Build & verify
- `export PATH="$HOME/.local/node/bin:$PATH" && npm run build` — clean.
- Confirm in `out/blog/<slug>/index.html`: the `<img>` has the right `alt`, explicit
  `width`/`height`, and **`loading="lazy"`** (NOT eager), and the WebP exists in
  `out/images/posts/`.
- **Lighthouse** the affected post(s): Performance ≥ 95, SEO 100, A11y ≥ 95.
- **Known caveat — Best-Practices:** if the post's HERO photo is on **`images.pexels.com`**,
  BP caps at ~77 because Pexels' CDN sets Cloudflare cookies (`__cf_bm`, `_cfuvid`) — a
  third-party-cookie audit fail. This is **pre-existing and unrelated to the infographic**
  (a local WebP sets no cookies). Posts with Unsplash heroes score BP 100. If BP matters,
  swap that post's hero to Unsplash (also advances the Pexels→Unsplash migration) — but
  call it out as a separate change, don't silently re-image.

### 5. Commit (deploy preference)
Stage `content/blog.ts` (or `content/services.ts`) + the WebP asset(s) (+ `lib/markdown.ts`
if you touched the renderer). **Do NOT `git push` until the user says "go live"** — every
push triggers a Netlify build that costs a credit. Commit locally, hold the push, batch.

---

## NATIVE HTML INFOGRAPHIC — mechanism & kinds

Real, crawlable, zero-CLS text instead of a flat image. Mechanism (mirrors `::tour`):
`::infographic <key>` on its **own line**, after a complete paragraph (blank line above/
below, never inside a list). Data in `content/infographics.ts`; `renderInfographic(key)` in
`lib/markdown.ts` emits the HTML; `.ig-*` styles in `app/globals.css`.

**The reusable kinds (copy the closest existing entry as a template):**

| kind | shape | use for |
|---|---|---|
| `cards` | `cards: {name, note, tag?, pick?}[]` | 3–4 titled points: requirements, roles, options, a gut-check |
| `steps` | `steps: {when, title, note}[]` | a numbered timeline / process (the license steps, an itinerary) |
| `compare` | `columns: {name, sub?, items:[], pick?}[]` | 2- or 3-column comparison (DIY-vs-all-inclusive, a decision, a spectrum) |
| `island-selector` | `islands: {name, bestFor, catch, pick?}[]` | the "best beaches / locations" table; also go/no-go "conditions" |
| `season-timing` | `months[]` + `legend[]` | a 12-month color-coded calendar strip |

Notes: `compare` auto-uses a 3-column grid (`ig-compare__grid--3`) when `columns.length >= 3`.
`pick: true` highlights a card/column (gold/brand ring + "Our pick"/tag). Add an optional
`tag` on a card for a small pill (e.g. "Avoid", "Optimal", "Prioritize").

**Non-negotiables:**
- One accent: ocean-teal (`brand-*` / `#1c7b87`) + gold `#dda53a`; serif heading; `.not-prose` wrapper.
- **Never interpolate a variant class name** — Tailwind tree-shakes `@layer components` rules
  unless the literal class appears in a scanned file. Map each variant to a literal class
  (`ig-card--pick`, `ig-compare__col--pick`, `ig-month--peak`). After build, grep
  `out/_next/static/css/*.css` for each variant class to confirm it survived.
- Mobile-safe grids (`grid-cols` that wrap), `escapeHtml()` every dynamic value.

**To add a NEW kind** (only if none fit): add the type to the `Infographic` union in
`content/infographics.ts`, a render branch in `renderInfographic`, and `.ig-*` CSS in
`globals.css`. Append `${cta}` before the closing `</div>` in the branch so the service CTA
still attaches. (The 5 kinds above already cover proposals/elopements/vow-renewals/
bachelorettes; you rarely need a new one.)

**Tie-in:** `create-money-page` builds a service page; this skill makes its body native
infographics. A fully-built service money page = guide prose + one `::infographic` per
section (booking CTA auto-attached) + the live `PackageCards` at `#packages`.

---

## Acceptance criteria
- **Service page (native, the standard):** body is native `::infographic`s, one per section,
  **0 stock images in the body** (photo cover kept); each carries the auto **booking CTA →
  `#packages`** (key uses the service prefix); text + every variant class confirmed in the
  built CSS; Lighthouse Perf ≥ 95 / A11y ≥ 95 / BP 100 / SEO 100 / CLS 0; redundant
  title/packages/testimonials/CTA slides dropped.
- **Blog image mode:** each graphic mapped to the correct post; optimized WebP < ~200 KB,
  SEO filename; embedded **after the hero** so it's **lazy** (not the LCP); explicit
  width/height (no CLS); searchable alt + caption; sources removed; Perf ≥ 95 / SEO 100
  (BP 77 only if a pre-existing Pexels hero — flag it, don't blame the infographic).
- **Blog native mode:** `::infographic <key>` after a full paragraph; literal variant classes;
  ocean-teal+gold; text + per-variant CSS confirmed in the build.
- Typos baked into supplied images flagged to the user; PDF decks rasterized with `pypdfium2`.
- No `git push` until the user says "go live".
