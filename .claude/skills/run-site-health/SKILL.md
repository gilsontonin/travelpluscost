---
name: run-site-health
description: >-
  Run the in-house site-health scanner against travelpluscost (free, no Semrush credits). Use when asked
  to "run site health", "health scan", "scan the site", "check for bugs", "site checkup", or
  "/run-site-health". Default is the DAILY ROTATION — deep-scans the next sitemap shard (~5k URLs, ~9
  min), logs the findings, and advances a cursor so it never re-scans a shard until the whole site is
  covered (~16-day cycle). Use the quick representative scan for a fast "is anything broken right now"
  across every page type + the link graph + images. Report findings; fix only on the owner's go.
---

# run-site-health (travelpluscost)

A free, dependency-light "Semrush Site Audit" we own (`scripts/health-scan.mjs`). Two modes:

## 1. Daily rotation (default — `npm run health -- --rotate`)
Deep-scans the **next sitemap shard** (one per run), then logs + advances the cursor.
- Shards: `pages.xml` (core/states/blog), `cities.xml` (~6.7k hubs), `hotels-0…13.xml` (~5k each).
- One shard/run ≈ 5k URLs ≈ ~9 min. Full site cycles in ~16 runs, then auto-starts a fresh cycle.
- **State:** `scripts/health/state.json` (cycle, `done[]`, history). **Per-shard logs:** `scripts/health/logs/<date>-<shard>.json`. Both are gitignored (local working data) — so the cursor never re-scans a shard until the cycle completes ("don't repeat the same sitemap until the whole site is fixed").
- Force a shard (does NOT advance the cursor): `npm run health -- --shard hotels-3`.

## 2. Quick representative scan (`npm run health`)
Fast (~2 min): samples every page TYPE (core, ~50 city hubs incl. thin + previously-broken, all state
hubs, a property sample, all blog posts) + checks the link graph, a sample of images, and sitemap
integrity. Best for a fast "did this deploy break anything" gate.

## What it checks
Broken pages (4xx/5xx) · broken internal links · broken images · redirects · duplicate / missing /
over-length titles (>65) & descriptions (>160) · canonical drift/missing · multiple/missing `<h1>` ·
**noindex leaks on money pages** · invalid JSON-LD · sitemap integrity. Exits non-zero on any ERROR
(CI-gateable).

## Workflow when invoked
1. Run the rotation by default: `export PATH="$HOME/.local/node/bin:$PATH"; npm run health -- --rotate`
   (or the quick scan if the user asked for "a fast check / is anything broken").
2. Read the report. **ERRORS** (broken pages/links/images, invalid JSON-LD, noindex leaks, sitemap) are
   real bugs — surface them with the URLs and propose the fix (usually a generator/script, since these
   are mass-produced pages). **WARNINGS** (meta length, dup meta, slow, h1) are SEO hygiene — summarize
   counts + the worst offenders.
3. State the cycle progress (`Cycle N: X/16 shards done`) so the owner knows where the rotation is.
4. **Do not auto-fix.** Fixing mass-page issues = a generator/template change; propose it, fix on "go".
   Batch fixes by shard/cause (e.g., "all state-hub descriptions are long → one generator fix").
5. Re-run after a fix to confirm the issue class is gone (or `--shard <name>` to re-check that shard).

## Notes
- Runs against production by default; `--base http://localhost:3000` to scan a local dev server.
- For true daily automation, schedule `npm run health -- --rotate` (a cron) — but confirm with the owner
  before creating a recurring job. The rotation is idempotent and safe to run repeatedly.
- Never block on warnings; only ERRORS should fail a deploy gate.
