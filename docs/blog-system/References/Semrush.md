# Semrush keyword research — the live wiring for write-blog-post

> **What this is.** travelpluscost has **no stored keyword cluster** (the old Hawaii-Picnics CSV bank is
> gone — see the legacy `skills/write-blog-post.md`). Instead we pull **live** keyword data from the
> **Semrush MCP** during the write/review flow. This file is the authoritative how-to for those calls:
> which report gives which number, the params, the unit budget, the gotchas, and the exact recipe the
> `write-blog-post` skill runs at Steps 1–2.

## Prereq — the MCP must be loaded
The server is declared in `.mcp.json` (`semrush`, http transport). **MCP tools load at startup**, so if
the `mcp__semrush__*` tools aren't present in the session, the wiring can't run — **restart Claude Code**
(or reconnect the server) and confirm `mcp__semrush__keyword_research` exists before continuing. If it's
still missing, the run falls back to the manual SERP method (`serp-optimize.mjs` only) and you note
`semrush: unavailable` on the board — never invent volumes/KD from memory.

## The call protocol (every report)
The toolkit is **`keyword_research`**. The MCP forces a three-step protocol:
1. **Discovery** — `mcp__semrush__keyword_research` (lists the reports; call once per session if unsure).
2. **Schema** — `mcp__semrush__get_report_schema({ report })` (only when you don't already know the params).
3. **Execute** — `mcp__semrush__execute_report({ report, params })`.

Defaults that apply to all of ours: **`database: "us"`** (we target US travelers), `display_limit: 30–50`
for list reports, sort with `display_sort` (`nq_desc`, `kd_asc`, …). Filter with `display_filter` in the
form `<sign>|<field>|<op>|<value>` — e.g. `+|Nq|Gt|100` keeps volume > 100; chain with another `|`
(`+|Nq|Gt|100|-|Kd|Gt|45` = volume > 100 AND KD ≤ 45). Costs below are **API units per line returned**, so
cap `display_limit` and prefer `phrase_these` (batch) over many single calls.

## Which report gives which number (confirmed live, US database)
| Need | Report | Cost | Returns | Gotcha |
|---|---|---|---|---|
| **Volume / CPC / competition** of one keyword | `phrase_this` | 10/line | `Ph;Nq(volume);Cp(CPC);Co(competition);Nr(#results)` | KD/Intent/SERP-feature columns are **not** returned even if you request them — use `phrase_kdi` for KD. |
| **Difficulty (KD)** | `phrase_kdi` | 50/line | `Ph;Kd` (0–100 index) | Pricey per line — only run it on the **shortlisted** candidate(s), never a whole list. |
| **Related cluster** (secondary keywords + headings) | `phrase_related` | 40/line | `Ph;Nr;Cp;Co;Nq;Td(trend);Rr(related-relevance 0–1)` | Returns **foreign-language junk** even on `us` (e.g. `alberghi…`, Italian). **Filter to English + on-topic + Rr-sorted** before using. |
| **Questions** (FAQ + body sub-questions) | `phrase_questions` | 40/line | question-format keywords + volume | Grep-gate every one against what the draft already covers (most are already answered) — same discipline as the PAA step. |
| **Exact-phrase variants** (exhaustive long-tail) | `phrase_fullsearch` | 20/line | every variant containing the seed | Use only when the cluster is thin and you need more long-tail. |
| **Who ranks / SERP features** | `phrase_organic` | 10/line | `Dn(domain);Ur(url);Fk(SERP features)` — pass `positions_type:"all"` to fold SERP features in as positions | This is a **cross-check** for the manual WebSearch competitor pick in `serp-optimize`, and the **intent signal** (see below). Not a replacement for reading the pages. |
| **Batch metrics** for many keywords at once | `phrase_these` | 10/line | volume/CPC/competition per keyword | `phrase` is a **`;`-joined string** (`"a;b;c"`), not an array. The cheap way to compare a candidate against existing-post keywords (cannibalization). |

**Column codes:** `Ph`=phrase, `Nq`=volume, `Cp`=CPC, `Co`=competition, `Nr`=#results, `Kd`=difficulty,
`Td`=trend (12 monthly points), `Rr`=related relevance, `Dn`=domain, `Ur`=URL, `Fk`=SERP features.

## Intent — DERIVE it (Semrush's intent field isn't exposed here)
The MCP reports on this account **do not return the Intent column** (`In` is dropped). So classify intent
yourself from three live signals, and label it `informational | commercial | transactional | navigational`:
1. **The head-term phrasing** — "how/what/where/best time" → informational; "best <thing>" / "<thing> vs
   <thing>" → commercial-investigation; "book / deals / price" → transactional; a brand/property name →
   navigational.
2. **Question share** — a `phrase_questions` cluster that's mostly who/what/where = informational.
3. **SERP features** — `phrase_organic` (`positions_type:"all"`): a featured-snippet/PAA-heavy SERP = an
   informational answer to win; a SERP stacked with ads/shopping/booking widgets = transactional (and a
   harder, off-brand fit). State the call + the signal in the milestone line.

Our sweet spot is **informational / commercial** intent that routes to the honest-price search or a city
hub (`AffiliateLinks.md`) — not transactional queries we can't serve as a new domain.

## The keyword ledger (`content/keywords.json`) — used-keyword tracking + optimization
The **source of truth for what we already target** is `content/keywords.json` (keyed by slug, mirrors the
`content/blog-related.json` sidecar pattern — out of the app bundle). Entry shape:
```json
"<slug>": { "primary": "...", "secondary": ["..."], "volume": 0, "kd": 0,
            "intent": "informational|commercial|transactional|navigational",
            "database": "us", "researched": "YYYY-MM-DD",
            "status": "researching|published|retired", "history": [] }
```
- **Log every post here** the moment its keyword locks (status `researching`), and flip it to `published`
  when it ships. This is the don't-reuse ledger AND the optimization log.
- **`npm run blog:keywords`** (`scripts/blog/keywords.mjs`, no Semrush call — reads the ledger) reports:
  (1) every used primary + secondary, (2) cannibalization flags, (3) stale research (> 180 days) + any
  ledger⇄posts sync gaps. Run it in Step 1 and whenever planning the next post.
- **Re-mapping a post to a new cluster (optimization):** when a re-pull shows a better keyword, push the
  old `{ primary, retired: "YYYY-MM-DD", why }` into `history`, set the new `primary`/`secondary`, and bump
  `researched`. The history line is why we keep the ledger instead of reading slugs.

## Cannibalization check (run before locking a keyword — TheBible §4.1)
Goal: never ship two posts chasing the **same search intent** (it splits our own ranking signals).
1. **Enumerate what we already target** with `npm run blog:keywords` (reads `content/keywords.json`).
2. **Pull the candidate's cluster** with `phrase_related` (the high-`Rr` rows are the semantic neighbours).
3. **Batch-compare** the candidate against the existing primaries in one `phrase_these` call
   (`phrase: "cand;existing1;existing2;…"`) to see volume/overlap side by side.
4. **Flag a conflict** when an existing primary *is* the candidate, is a close variant, or sits high in the
   candidate's `phrase_related` cluster **with the same intent** (the robot flags exact/subset/overlap; you
   judge the semantic ones).
5. **Resolve, don't ignore:** on a conflict, either **update/expand the existing post** (preferred) or pick
   a **distinct sub-intent** with its own SERP (a longer-tail angle). Put the verdict on the milestone line:
   `cannibalization: clear` or `cannibalization: conflicts with <slug> → <resolution>`.

## The recipe the skill runs
**Step 1 — vet each candidate keyword** (before the owner picks): for each, `phrase_this` (volume) +
`phrase_kdi` (KD) → derive intent → run the cannibalization check. Present a table — `kw | vol | KD |
intent | cannibalization` — and PAUSE for the owner's pick. Target a new-domain-winnable keyword
(roughly **KD ≤ 30, volume > 100**, informational/commercial intent), the brand/transparency angle first.

**Step 2 — expand the locked keyword into the brief:** `phrase_related` (→ filtered secondary keywords +
H2 phrases) and `phrase_questions` (→ FAQ seeds + body sub-questions), then feed those terms/questions into
`serp-optimize.mjs` and the FAQ exactly as before. Semrush gives the *targets*; `serp-optimize` still scores
coverage; the gates in TheBible §2 are unchanged. Record volume/KD/intent in the exec summary.
