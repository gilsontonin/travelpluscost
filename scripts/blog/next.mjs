#!/usr/bin/env node
// THE WRITE-NEXT-POST MACRO — one entry point for a "where to stay in <city>" post.
//
// It pre-flights the city's inventory, emits the production scaffold (new post) or a QA/redo note
// (post already exists), and prints the EXACT ordered playbook with city-filled, copy-paste commands.
// One path, no guesswork: run this, then work top to bottom. The governing manual is
// docs/blog-system/BLOG-PLAYBOOK.md — the macro is its index, not a replacement (the WRITING is still
// yours: funny-first, real voice, researched, honor POSITIONING).
//
// Usage:  npm run blog:next -- branson          |   npm run blog:next -- "pigeon forge"   [--fast]

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FAST = process.argv.includes("--fast");
const city = process.argv.slice(2).filter((a) => !a.startsWith("--")).join(" ").trim();
if (!city) { console.error("usage: npm run blog:next -- <city>"); process.exit(1); }
const slug = city.toLowerCase().replace(/[^a-z0-9]/g, "");
const postSlug = `where-to-stay-in-${slug}`;
const kw = `where to stay in ${city}`;
const title = (s) => s.replace(/[a-z0-9]+/gi, (w) => w[0].toUpperCase() + w.slice(1));
const bar = "═".repeat(90);

const posts = readFileSync(join(ROOT, "src/lib/posts.ts"), "utf8");
const exists = posts.includes(postSlug);

console.log(`\n${bar}\n  ✍  WRITE NEXT POST — ${title(city)}   (slug: ${postSlug})\n${bar}`);

if (exists) {
  console.log(`\n  ✓ This post already EXISTS in src/lib/posts.ts → QA / REDO mode (skip the scaffold; go to the gates).`);
} else {
  console.log(`\n  • New post — production scaffold (every id real + rate-verified, every area city-scoped).`);
  console.log(`    Paste it into a new entry in src/lib/posts.ts, then write the prose into the stubs:\n`);
  try {
    console.log(execFileSync("node", [join(ROOT, "scripts/blog/scaffold.mjs"), city, ...(FAST ? ["--fast"] : [])], { encoding: "utf8", env: process.env }));
  } catch (e) {
    console.error(`  ✗ scaffold failed (${e.message}). Check the city is in the directory: npm run blog:hotels -- ${city}`);
  }
}

console.log(`
${bar}
  THE PLAYBOOK — do these IN ORDER. Governing manual: docs/blog-system/BLOG-PLAYBOOK.md (read it first).
  Bars to clear: serp ≥ 90 · 0 HARD slop · length in band · 0 leaks · a CTA every section · build green.
${bar}

  [ ] 1. KEYWORD — Semrush-vet "${kw}" (aim real demand + KD ≤ ~30). Log it in the ledger:
            npm run blog:keywords
  [ ] 2. SERP RESEARCH — WebSearch "${kw}"; open the top 3-4 GENUINE competitor guides (not OTA category
         pages). Note their areas / subtopics / entities. Keep their URLs for --urls (real competitors only).
  [ ] 3. ${exists ? `EDIT the existing post in src/lib/posts.ts` : `PASTE the scaffold above into src/lib/posts.ts, then WRITE every <!-- … --> stub`}
         — funny-first, real voice; CARD RULE (every hotel named in a heading/prose → its ::hotel card or a
         link to that hotel); honor POSITIONING (never the net cost or markup %; claims exactly true; no fake
         scarcity). Areas: ::rail <Area> is city-scoped; check coverage with  npm run blog:areas -- ${city}
  [ ] 4. GATES — loop until green after EVERY edit (never ship red):
            npm run blog:serp  -- "${kw}" --draft ${postSlug} --urls "<URL1>,<URL2>,<URL3>"   # serp ≥ 90
            npm run blog:slop  -- ${postSlug}        # 0 HARD tells
            npm run blog:stats -- ${postSlug}        # length in band
            npm run blog:voice -- ${postSlug}        # the voice check
            npm run blog:cta   -- ${postSlug}        # 0 leaks · a CTA per section · every mentioned hotel carded
            npm run blog:checklist -- ${postSlug}
            npm run blog:freshness -- ${postSlug}
            npm run blog:lh    -- ${postSlug}
            npm run blog:qa    -- ${postSlug}        # the final aggregate gate — must be all-green
  [ ] 5. COVER — a famous local property's best photo OR a cute, colourful town shot. INSPECT it before use
         (curl → Read a local file; never pick a URL blind — that's how a grey cover slipped out).
  [ ] 6. BUILD —  npm run typecheck && npm run lint && npm run build   (all green)
  [ ] 7. CROSS-LINK — link the /hotels/${slug} hub ↔ this post (don't cannibalise).
  [ ] 8. COMMIT — then HOLD the push until the owner says "go live" (each push burns a Netlify build).

${bar}
`);
