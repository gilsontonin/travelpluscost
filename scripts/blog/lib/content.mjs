// content.mjs — per-site content adapter for the shared blog engine.
//
// The shared QA/SEO scripts call these instead of hardcoding a posts-file path, so ONE copy
// of each script works on BOTH sites:
//   Hawaii Picnics  -> content/blog.ts   (export const posts: Post[])
//   TravelPlusCost  -> src/lib/posts.ts  (export const POSTS: Post[])
// Both are flat `Post[]` arrays with markdown `body` template literals, so the slug->body
// extraction is identical; only the file path (and the serp-brief dir) differ.
//
// Resolution is by CWD: run the script from inside the target repo and it detects that repo.
import fs from "fs";

export function postsFile() {
  for (const p of ["content/blog.ts", "src/lib/posts.ts"]) if (fs.existsSync(p)) return p;
  throw new Error(`No posts file (content/blog.ts or src/lib/posts.ts) in ${process.cwd()}`);
}

export function readPostsSrc() {
  return fs.readFileSync(postsFile(), "utf8");
}

// Where this repo keeps serp-briefs / blog scripts (HP: scripts/ ; TPC: scripts/blog/).
export function scriptsDir() {
  return fs.existsSync("scripts/blog") ? "scripts/blog" : "scripts";
}

export function briefPath(slug) {
  return `${scriptsDir()}/serp-brief-${slug}.md`;
}

// Extract a single post's markdown body by slug (same regex both sites use).
export function getBody(slug) {
  const m = readPostsSrc().match(
    new RegExp(`slug:\\s*"${slug}"[\\s\\S]*?body:\\s*\`([\\s\\S]*?)\`,\\n`, "m")
  );
  if (!m) throw new Error(`Post "${slug}" not found in ${postsFile()}`);
  return m[1];
}

export function listSlugs() {
  return [...readPostsSrc().matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

export function infographicsFile() {
  for (const p of ["content/infographics.ts", "src/lib/infographics.ts"]) if (fs.existsSync(p)) return p;
  return null;
}
