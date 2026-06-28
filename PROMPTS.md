# 📋 Copy‑paste prompts — travelpluscost

> Owner: copy a block below into chat to kick off the work. Optionally add a city/keyword on the end.
> (Full canonical workflow lives in `docs/blog-system/BLOG-PROMPT.md`; this is the quick paste version.)

---

## ▶ WRITE THE NEXT BLOG POST

```
Write the next blog post for travelpluscost. Follow our setup exactly — no shortcuts, no decisions you
do not have to make. Read docs/blog-system/BLOG-PLAYBOOK.md + TheBible.md + BLOG-PROMPT.md first.

TWO HARD RULES (no leeway):
1. RESEARCH = 30 SOURCES MINIMUM. Walk the facet checklist (References/ResearchBrief.md), one search per
   facet, until you have AT LEAST 30 distinct, credible sources documented in a SOURCE LEDGER inside
   scripts/blog/research-brief-<slug>.md. Thin research is a fail. Do NOT write a word until the brief
   has 30+ sources grouped by facet, each with the detail that earns its place.
2. MATCH THE WINNERS. Scan the genuine top 3 (blog:scan + blog:serp). Match their STRUCTURE and their
   LENGTH — the comprehensive per‑attraction / per‑entity blocks are the thing Google rewards, so mirror
   the genuine #2 ranker's shape and word count. Do NOT write shorter and call it an exec‑decision. Only
   flag a serp exec‑decision AFTER you have matched the winning shape and the remaining ADD list is
   genuinely junk (youre/dont/iconic/colorful), never as an excuse to stop early.

THE PIPELINE (in order):
- Pull the next keyword from the keyword map (npm run blog:map). KD is a band, not a gate — go broad.
- STEP 1: scan the genuine top 3 (blog:scan + blog:serp). Record their outline + the TARGET SPEC.
- STEP 2: facet research to 30+ sources → research-brief-<slug>.md (source ledger + picks grouped by facet).
- Inventory: rate-verified ::hotel cards only; cover = a cupid image (NEVER Unsplash), inspect it, warm it for LH.
- Write into src/lib/posts.ts in the house voice: funny-first (a beat per section, written into the fact);
  bold a few KEY words, never whole sentences; paragraphs <=3 sentences; active, instructional; cards
  distributed INLINE, one ::activity offer per experience section; >=1 infographic per ~500w + >=1 markdown
  table. Spell every word OUT (no contractions), NO dashes, NO prose colons/semicolons (titles + "The
  move:" strips keep colons). Spell "Saint"/"Number" so the voice gate does not miscount sentences.
- Run EVERY gate and PRINT the board: blog:serp >=90 . blog:slop 0 HARD . blog:stats in band . blog:voice
  (CONCISE 0, reading <=10, active) . blog:style . blog:cta (0 leaks, 0 hotel gaps) . blog:checklist
  (AUTO all) . blog:related . blog:freshness . typecheck && lint && build && check (3/3) . blog:lh
  (perf >=90 or the inventory-heavy localhost note; SEO/A11y/BP = 100). Fix every red, re-run after each edit.
- Log the cluster (content/keywords.json), de-orphan (>=1 inbound link from another post), append a
  WritingLessons.md line if anything systemic came up.
- COMPLIANCE: never the net cost or markup %; market ranges only; claims exactly true; no fake scarcity.
- Commit a focused commit (co-author trailer). HOLD the push until I say "go live."
```

---

## ▶ WRITE A SPECIFIC POST

Paste the block above and add: `The keyword is "<keyword>"` (or `Write the <city> <topic> post`).

---

## ▶ REVISE / FRESHEN AN EXISTING POST

```
Revise the existing post <slug> to the full standard. Same two hard rules: 30 sources minimum in a fresh
research-brief, and match the current top-3 winners' structure + length. Re-pull the live SERP (it moves),
re-research to 30+ sources, rewrite comprehensively, run every gate and PRINT the board, fix every red.
Adapt the angle to the real search intent. Commit focused; HOLD the push until I say "go live."
```
