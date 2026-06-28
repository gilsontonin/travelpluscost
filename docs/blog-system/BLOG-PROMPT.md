# 🟦 THE BLOG-POST PROMPT — paste this whole block to start any "where to stay in <city>" post

> **Owner:** copy everything between the `=====` lines into chat to kick off a post (optionally add the city).
> **Claude:** this is your single source of truth for a blog post. It encodes the workflow, the
> non-negotiable craft rules, the compliance limits, the gates, and the checklist you MUST print at the
> end. If you ever feel unsure, RE-READ the docs named below — do not free-write from memory.

=====================================================================================

You are writing (or rewriting) ONE travelpluscost blog post to the **Hawaii-Picnics quality bar**: the
most useful, most honest, and genuinely **funny** "where to stay in <city>" guide on the internet — that
also passes every SEO gate. **Ranking is necessary but NOT sufficient. If it reads dry, it failed.** A post
people enjoy and skim easily converts better than one that ranks and bounces.

## 0. READ THESE FIRST (do not skip — re-read if you drift)
- `docs/blog-system/BLOG-PLAYBOOK.md` — the governing manual (voice §3, process §5, pre-publish §9).
- `docs/blog-system/TheBible.md` — the operating contract + gates.
- `docs/blog-system/FablePlaybook.md` — the engagement layer / judgment calls (travelpluscost-native).
- `docs/blog-system/Humour.md` — how the funny works (dry, deadpan, funny-FIRST, safe targets).
- `docs/blog-system/PRINT-CHECKLIST.md` — the table you fill + print at the end.
- `docs/blog-system/References/WritingLessons.md` — every gate gotcha already paid for; append one after.
- `docs/POSITIONING.md` — the hard compliance limits.

## 1. THE NON-NEGOTIABLE CRAFT RULES (this is what's been missing — enforce all)
1. **WRITE IT FUNNY — mandatory, not garnish.** A dry beat / punchline every **~200–250 words** (max 300).
   Write the joke **INTO the fact** so the same sentence informs and lands ("the Carousel Bar rotates
   whether or not you've earned it"; "New Orleans buries up, because the water table votes no"). The test:
   does it earn a nose-exhale, or is it merely true? If only true, sharpen or cut. Deadpan, **no `!`, no
   emoji**. Safe targets only: clichés, weather, traffic, physics, tourist traps, sketchy OTA/surveillance
   pricing, ourselves — **never** the reader, locals, or culture. Zero humour near somber topics.
2. **BOLD A FEW KEY WORDS — never a whole sentence/phrase.** The old "bold the whole answer sentence under
   every H2" is BANNED — it looks ridiculous and adds nothing. Bold 2–4 skimmable words inside a sentence.
3. **PARAGRAPHS: 3 sentences is the workhorse, 1 sentence for punchlines, NEVER 4+.** Two-sentence
   paragraphs everywhere = too choppy. Mix 3-sentence descriptive paragraphs with the occasional 1-sentence
   punchline paragraph for white space. (Beware false counts: `St.` / `d.b.a.` / `a.m.` read as sentence
   ends — avoid them in a borderline paragraph.)
4. **ACTIVE VOICE, INSTRUCTIONAL.** Tell people what TO do and what to AVOID. Subject first.
5. **PROPERTY CARDS ARE THE VISUALS — distribute them INLINE, never pile them.** One `::hotel` card per
   hotel, placed right where that hotel is discussed (intro the hotel in 1–2 sentences with a beat → its
   card → next hotel → its card). No 4-card stack then a wall of card-less text. **Skip stock photos** —
   the card carries the image; add a photo only if it's genuinely illustrative of something a card can't show.
   **MONETIZE EVERY SECTION — scan each H2 for an offer (this is the point of the post):** a post with no
   monetization is pointless. Two offer types, both ~7–8% / margin: **`::hotel <id>`** (lodging) and
   **`::activity <City> | <topic>`** (a Viator tour matched to the section — e.g. `::activity New Orleans |
   swamp bayou`, `| ghost cemetery voodoo`, `| garden district`, `| cocktail crawl`, `| culinary cooking`).
   It pulls 1–2 quality (≥4.5★) tours whose title matches the topic and **self-hides if nothing matches** —
   so you can drop one under any relevant H2 with no risk. Rules:
   - **Where-to-stay / lodging posts → prioritize `::hotel` cards** (our hotels are the play).
   - **Things-to-do / activity / itinerary / day-trip / food / nightlife posts → aim for ~1 offer PER H2**
     (`::activity` on each section that's a real experience; `::hotel` only where lodging is the point).
   - **Pure planning/safety posts** (is-it-safe, best-time) → 0–2 offers, don't force it.
   - Keep `::activities <City>` (the full rail) for one "browse all tours" moment; use `::activity` for the
     distributed per-section offers. Cards are styled as real Viator offers (badge + rating + price + CTA).
6. **EVERY infographic ≥1 per ~500 words, and well-designed** (the native `::infographic` kinds: stat panel
   / compare / steps / callout — NOT a bare markdown table). Cards + infographics both count toward cadence.
7. **LAYOUT (already in the components — use them):** the `The move: … · Best for: … · Watch: …` quick-facts
   strip auto-renders as a coral **callout** box; every **H2 gets a coral number + a divider rule**; body
   font is 16.5px. Keep the top **search bar + 8-hotel rail** (page template) before the body — don't touch it.
8. **Don't ship dry. Don't ship red.** If any HARD gate or craft rule fails, you DO NOT ship — circle back
   (rewrite → re-gate) until it's green or a flagged 👁 exec-decision the owner judges.

## 2. COMPLIANCE (POSITIONING.md — breaking these can cut our supply)
- **Never** the wholesale/net cost or the exact markup %. **Never** a stamped per-hotel price — market
  ranges only ("usually $120–200"). **Claims exactly true** (no "lowest/cheapest/guaranteed/most-reviewed";
  `npm run check` rejects unverifiable superlatives). **No fake scarcity / fake discounts.** Real data only.

## 3. THE WORKFLOW (in order)
1. `npm run blog:next -- "<City>"` — inventory pre-flight (≥8 rate-verified hotels) + the rate-verified card
   pool + the area list. `npm run blog:pros -- "<City>"` — backfills "Guests loved …" on the cards.
2. `npm run blog:kd -- "<city>"` — the keyword cluster (head vol/KD + variants → FAQ + section seeds).
3. **STEP 1 — SCAN THE TOP 3 (mandatory; the SERP already has the answer — do this BEFORE writing a word).**
   WebSearch the keyword → take the GENUINE top ranking guides (skip Reddit/Wikipedia/YouTube/news/OTA
   listings). Then run BOTH halves of the scan (Semrush is dropped — this is free and replaces Surfer/
   Clearscope):
   - `npm run blog:scan -- "<kw>" --urls "u1,u2,u3"` → the #1/#2/#3 competitor cards + the averaged
     **TARGET SPEC** (words · H2/H3 · images · FAQs) + the 9-point scan + the ★gaps. The fast structural pass.
   - `npm run blog:serp -- "<kw>" --draft <slug> --urls "u1,u2,…"` (comma-joined!) → the deep brief: length
     band, heading gaps, term/entity ADD list, competitor PAA questions.
   Together these ARE the scan: **items 1–8 match the shape that already wins; item 9 (the gaps) is where you
   beat them** — the booking path they lack, the PAA they answer poorly, the cluster cross-links, freshness.
   WebSearch the People-Also-Ask → FAQ + a section.
4. **Verify cards:** for an ingested region, `blog:hotels` does NOT rate-check — POST the ids to
   `https://travelpluscost.com/api/prices` (midweek ~3 weeks out) and card only the ✓ priced ones.
5. **Write** into `src/lib/posts.ts` (new entry at the top of POSTS; `region:{name,destination}` fires the
   inventory UI). Title = `Where to Stay in <City>, <ST>: Best Hotels (2026)` (keyword contiguous, ≤60).
   Apply §1 rules. Inspect the cover image (curl → Read it; a famous local property or a colourful city shot).
6. **Loop the gates until green** (§4), then **PRINT THE CHECKLIST** (§5).

## 4. THE GATES (run, fix, re-run after every edit batch)
```
npm run blog:serp  -- "<kw>" --draft <slug> --urls "u1,u2,…"   # ≥90 (or flagged comprehensive-competitor exec-decision)
npm run blog:slop  -- <slug>      # 0 HARD tells
npm run blog:stats -- <slug>      # length IN band; sections not thin
npm run blog:voice -- <slug>      # 0 paras >3 sentences · active · a beat per section (LIST each)
npm run blog:cta   -- <slug>      # 0 leaks · a CTA every section · named hotels carded
npm run blog:checklist -- <slug>  # AUTO all pass
npm run blog:related              # de-orphan / read-next
npm run blog:freshness -- <slug>  # perishable claims
npm run typecheck && npm run lint && npm run build && npm run check   # 0 err · deploy gate 2/2
npm run blog:lh -- /blog/<slug>   # warm the cover first (fetch /_next/image?url=<cover>&w=1200&q=70); perf≥90* a11y/BP/SEO=100
```
Keyword tension to hold (the readability-rewrite trap): tightening prose + cutting per-hotel H3s + killing
the whole-sentence bolds DROPS serp (lost headings + exact-phrase). Restore WITHOUT reverting the read —
put key phrases in the AREA H2s, weave the keyword into natural unbolded sentences, re-thread entities.

## 5. PRINT THIS AT THE END — every row, status ✅/❌/👁 (full table in PRINT-CHECKLIST.md)
A Keyword&SERP (A1–A5) · B Length&Structure (B1–B4) · C Voice&Humour (C1–C6, **list a beat per section**) ·
D Skimmability&Bolding (D1–D4) · E Answer&TL;DR (E1–E3) · F FAQ (F1–F3) · G Visuals (G1–G5) ·
H Inventory&CTAs (H1–H4) · I Links&De-orphan (I1–I4) · J Freshness (J1–J3) · K Compliance (K1–K4) ·
L Tech/SEO/Schema (L1–L5) · M Build/Perf/Deploy (M1–M3) · N Logging&Publish (N1–N4).
Then: log the cluster to `content/keywords.json`, append a `WritingLessons.md` line if anything systemic
came up, **commit a focused commit (co-author trailer), and HOLD the push until the owner says "go live."**

=====================================================================================
