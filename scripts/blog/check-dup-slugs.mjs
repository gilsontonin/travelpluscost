// Fail (exit 1) if the posts file has any duplicate slug — a silent route collision the build
// won't flag loudly. Shared, format-dual via content.mjs. Uniform gate on both repos. (2026-06-29)
import fs from "node:fs";
import { postsFile } from "./lib/content.mjs";
const src = fs.readFileSync(postsFile(), "utf8");
const slugs = [...src.matchAll(/\bslug:\s*"([^"]+)"/g)].map((m) => m[1]);
const seen = new Set(), dups = new Set();
for (const s of slugs) { if (seen.has(s)) dups.add(s); seen.add(s); }
console.log(`dup-slugs: ${slugs.length} slugs checked`);
if (dups.size) { console.log(`❌ duplicate slug(s): ${[...dups].join(", ")}`); process.exit(1); }
console.log("✓ all slugs unique.");
