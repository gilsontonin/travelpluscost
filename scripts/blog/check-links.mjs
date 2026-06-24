// check-links.mjs — curl every EXTERNAL link in the blog posts and report non-200s. Network, so run
// manually (a third-party outage shouldn't block a deploy). 404 = broken (fix); 403/406/429/401 =
// bot-block (usually fine). Reads the post bodies from src/lib/posts.ts (no static export to scan).
//   npm run blog:links
import fs from "node:fs";
import { execSync } from "node:child_process";

const src = fs.readFileSync("src/lib/posts.ts", "utf8");
const SKIP = /images\.(unsplash|pexels)\.com|static\.cupid\.travel/;
const urls = new Set();
// Markdown links + bare https in the source (covers post bodies, cover credit URLs, etc.)
for (const m of src.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) urls.add(m[1]);
for (const m of src.matchAll(/"(https?:\/\/[^"]+)"/g)) urls.add(m[1]);

const ext = [...urls].filter((u) => !u.includes("travelpluscost.com") && !SKIP.test(u)).sort();
console.log(`check-links: ${ext.length} unique external link(s)\n`);
let broken = 0;
for (const u of ext) {
  let code = "000";
  try { code = execSync(`curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0" -L --max-time 15 "${u}"`, { stdio: "pipe" }).toString().trim(); } catch { /* timeout */ }
  if (code === "200") continue;
  const botBlock = ["403", "406", "429", "401"].includes(code);
  console.log(`${code} ${botBlock ? "(bot-block, likely ok)" : "⚠ CHECK"}  ${u}`);
  if (!botBlock) broken++;
}
console.log(`\n${broken ? `❌ ${broken} non-bot-block failure(s) (likely 404s) — fix.` : "✓ no broken external links."}`);
process.exit(broken ? 1 : 0);
