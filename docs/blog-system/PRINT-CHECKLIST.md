# Blog Post QA — PRINT THIS IN FULL at the end of every post

> Owner rule (2026-06-27): print this whole table, filled in, at the end of every blog post — table
> style, **Status** column with ✅ / ❌ / 👁. If ANY row is ❌, the post does NOT ship — circle back
> (rewrite → re-gate) until every row is ✅ or a flagged 👁 exec-decision. SEO ranking is necessary
> but NOT sufficient: a post that ranks but reads dry has failed. The visual/voice bar = the Hawaii
> Picnics posts (designed infographics, key-word bolds, short paragraphs, funny-first flow).
> Living doc — add rows as we find gaps. Built from QA-Master.md + SkimmabilitySpotCheck.md +
> Humour.md + OnPageSEOCheckList.md + BLOG-PLAYBOOK.md + the owner's craft rules ([[blog-craft-rules]]).

## A · Keyword & SERP
| # | Check | Bar | Verified by |
|---|---|---|---|
|A1|Primary pulled from the keyword map + unused + logged|keyword-map + keywords.json|blog:map / keywords.json|
|A2|Slug clean, keyword in slug, not redirect-shadowed|lowercase-hyphen|manual|
|A3|Genuine competitors only (no Reddit/TA/Wiki/OTA)|—|judgment|
|A4|Cannibalization judged by intent|distinct→build|judgment|
|A5|SERP score ≥ 90 raw (or flagged exec-decision)|≥90|blog:serp|
|A6|STEP 1 — top 3 scanned (cards + TARGET SPEC + 9-pt + gaps)|run|blog:scan|
|A7|STEP 2 — research brief written, facet-driven|10–30 facets by depth|research-brief-&lt;slug&gt;.md|

## B · Length & Structure
| # | Check | Bar | Verified by |
|---|---|---|---|
|B1|Length in band (floor=median, ceiling=longest genuine)|in band|blog:stats|
|B2|Section count ≈ target ÷ 280|—|blog:stats|
|B3|No thin section|every content H2 ≥ 250w|blog:stats|
|B4|ToC anchors resolve|0 missing|blog:checklist|

## C · Voice & Humour  (HARD — the recent miss)
| # | Check | Bar | Verified by |
|---|---|---|---|
|C1|≥1 genuine funny beat per content section, LISTED in the report|no beat = dry = fail|blog:voice + list each|
|C2|Funny-FIRST (beat carries the fact; nose-exhale test, not merely true)|not garnish|judgment|
|C3|Smile cadence ~1 / 200–300w|—|judgment|
|C4|Paragraphs ≤ 3 sentences (favor 2; not a wall of 1-liners)|0 paras >3 sent.|blog:voice CONCISE|
|C5|Active voice — instructional (what to do / avoid)|low passive|blog:voice ACTIVE|
|C6|Simple words (grade ≤10 unless serp term)|—|blog:voice READING|

## D · Skimmability & Bolding  (HARD — the recent miss)
| # | Check | Bar | Verified by |
|---|---|---|---|
|D1|Bold = a few KEY WORDS, never whole phrases/sentences|phrase not sentence|judgment (checker TODO)|
|D2|≥1 key bold per section — skim the bolds, still get the gist|—|judgment|
|D3|Quick-facts strip per area (a designed callout, not a dense paragraph)|—|blog:checklist + render|
|D4|Answer-first, no tease, dry hook in first 50w|—|judgment|

## E · Answer & TL;DR
| # | Check | Bar | Verified by |
|---|---|---|---|
|E1|Keyword in first 100w + H1 + title|—|blog:checklist|
|E2|TL;DR answer 35–60w, ≠ first paragraph, ≠ excerpt|—|blog:checklist|
|E3|TL;DR has 3–5 bold-led takeaways (not section titles)|—|blog:checklist|

## F · FAQ
| # | Check | Bar | Verified by |
|---|---|---|---|
|F1|FAQ = leftover questions only (no body dupes, swap-test)|—|judgment|
|F2|4–8 Qs, 2–4-sentence answers, bold lead phrase|—|blog:checklist|
|F3|FAQPage JSON-LD emitted|present|template|

## G · Visuals & Infographics  (HARD cadence + design)
| # | Check | Bar | Verified by |
|---|---|---|---|
|G1|≥1 native infographic / ~500w (HARD)|cadence|blog:stats|
|G2|Infographics well-designed (Hawaii-Picnics quality): stat panel / compare / steps / callout — NOT bare tables|—|judgment|
|G3|Cover INSPECTED — sharp, colourful, on-location (I Read the image)|—|judgment|
|G4|X-vs-Y shown as a compare visual, not buried in prose|—|judgment|
|G5|No fact duplicated in prose AND a visual|—|judgment|

## H · Inventory & CTAs
| # | Check | Bar | Verified by |
|---|---|---|---|
|H1|Every ::hotel card rate-verified (/api/prices)|all priced|live check|
|H2|Every named hotel → its card or a link (0 real gaps)|0 gaps|blog:cta|
|H3|A CTA in every section; 0 relational leaks|0 leaks|blog:cta|
|H4|/hotels/<city> hub cross-linked|present|manual|
|H5|Viator `::activities` block added IF the post covers tours/activities (else N/A)|just-in-time|judgment|

## I · Links & De-orphan
| # | Check | Bar | Verified by |
|---|---|---|---|
|I1|3–5 internal links, descriptive anchors, contextual|—|blog:checklist|
|I2|≥1 INBOUND backlink from another post (de-orphan)|≥1|manual|
|I3|In blog-related.json with neighbors|present|blog:related|
|I4|External authority links all curl-200|200|curl|

## J · Freshness & Accuracy
| # | Check | Bar | Verified by |
|---|---|---|---|
|J1|Visible "as of 2026"|present|blog:checklist|
|J2|Real numbers only — nothing invented/rounded|—|judgment|
|J3|Perishable claims verified|0 stale|blog:freshness|

## K · Compliance (POSITIONING — HARD)
| # | Check | Bar | Verified by |
|---|---|---|---|
|K1|Never the net cost or exact markup %|0|judgment|
|K2|No stamped per-hotel prices (market ranges only)|0|judgment|
|K3|Claims exactly true (no lowest/cheapest/guaranteed)|—|npm run check|
|K4|No fake scarcity / fake discounts|0|judgment|

## L · Tech / SEO / Schema
| # | Check | Bar | Verified by |
|---|---|---|---|
|L1|Title ≤60 (kw near start)|—|blog:checklist|
|L2|Meta description ≤160 (kw + benefit)|—|blog:checklist|
|L3|JSON-LD: BlogPosting + FAQPage + BreadcrumbList (no ItemList/HowTo)|—|template|
|L4|No paragraph >150w / no raw ::directive leaked|0|blog:checklist|
|L5|Slop: 0 HARD tells, no !/emoji|0|blog:slop|

## M · Build / Perf / Deploy
| # | Check | Bar | Verified by |
|---|---|---|---|
|M1|typecheck + lint (0 errors) + build clean|0 err|npm|
|M2|Deploy gate (ai-slop + claims-integrity)|2/2|npm run check|
|M3|Lighthouse: perf ≥90* · a11y · BP · SEO = 100 (*card-heavy baseline ~86, edge-cached on prod)|—|blog:lh|

## N · Logging & Publish
| # | Check | Bar | Verified by |
|---|---|---|---|
|N1|keywords.json cluster logged|done|manual|
|N2|WritingLessons lesson appended if systemic|done|manual|
|N3|Focused commit, held for "go live" (not pushed)|—|git|
|N4|npm run blog:qa aggregate printed in full|SHIP-READY|blog:qa|
