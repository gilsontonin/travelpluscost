// Structural audit of TPC's built blog posts (.next/server/app/blog). Deterministic, no network.
// Mirrors HP's audit-html for gate UNIFORMITY. FAILS (exit 1) on a post missing JSON-LD
// (BlogPosting + BreadcrumbList) or a canonical tag, or an <img> with no alt. (Added 2026-06-29.)
import fs from "node:fs";
import path from "node:path";
const ROOT = ".next/server/app/blog";
if (!fs.existsSync(ROOT)) { console.error("no .next/server/app/blog — run `npm run build` first."); process.exit(2); }
const posts = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html") && f !== "index.html" && !f.includes("["));
const fails = [];
for (const f of posts) {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  const rel = `blog/${f}`;
  if (!/application\/ld\+json/i.test(html)) fails.push(`${rel}: missing JSON-LD`);
  if (!/BlogPosting/.test(html)) fails.push(`${rel}: missing BlogPosting schema`);
  if (!/BreadcrumbList/.test(html)) fails.push(`${rel}: missing BreadcrumbList schema`);
  if (!/rel="canonical"/i.test(html)) fails.push(`${rel}: missing canonical`);
  for (const img of html.match(/<img\b[^>]*>/gi) || []) if (!/\balt="[^"]*"/i.test(img)) fails.push(`${rel}: <img> missing alt`);
}
console.log(`audit-html: ${posts.length} blog posts checked`);
if (fails.length) { console.log(`❌ ${fails.length} issue(s):`); [...new Set(fails)].slice(0, 20).forEach((x) => console.log("  " + x)); process.exit(1); }
console.log("✓ all blog posts have JSON-LD (BlogPosting+BreadcrumbList) + canonical + img alt.");
