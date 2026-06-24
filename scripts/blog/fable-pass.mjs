// fable-pass.mjs — optional editor polish. Sends a post body to Claude (Opus) for a line-edit toward
// the house voice (tighter, more dry-funny, no AI tells) WITHOUT changing facts, structure, links, or
// the ::infographic/::hotel directives. Prints the suggested rewrite + a short rationale for YOU to
// review and apply by hand (no auto-splice). Reads ANTHROPIC_API_KEY.
//   npm run blog:fable -- <slug>
import fs from "node:fs";

const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY) { console.error("ANTHROPIC_API_KEY not set (run via npm run blog:fable)."); process.exit(1); }
const slug = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!slug) { console.error("usage: fable-pass.mjs <slug>"); process.exit(1); }

const src = fs.readFileSync("src/lib/posts.ts", "utf8");
const at = src.indexOf(`slug: "${slug}"`);
if (at < 0) { console.error(`post not found: ${slug}`); process.exit(1); }
const bodyStart = src.indexOf("body: `", at);
const body = src.slice(bodyStart + 7, src.indexOf("`,", bodyStart + 7));

const system = `You are the house editor for travelpluscost, a transparent cost-plus hotel site. Polish the
post toward the house voice: plain high-school words, active voice subject-first, contractions always, NO
exclamation marks, NO emoji, zero AI tells (no "seamless/world-class/unlock/nestled/hidden gem/elevate"),
one dry deadpan beat per section, short paragraphs (max 3 sentences). HARD constraints: do NOT change any
fact or number, do NOT add claims, do NOT alter headings/structure, links, or lines starting with "::".
Keep it the same length or tighter. Return the full revised Markdown body, then a line "---RATIONALE---"
and 4-6 bullets on what you changed and why.`;

const r = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
  body: JSON.stringify({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    system,
    messages: [{ role: "user", content: `Polish this post body:\n\n"""${body}"""` }],
  }),
});
if (!r.ok) { console.error("anthropic error", r.status, (await r.text()).slice(0, 400)); process.exit(1); }
const out = (await r.json()).content?.map((c) => c.text).join("") || "";
console.log(`\n✍  FABLE PASS — /blog/${slug}  (review + apply by hand; facts/structure must be unchanged)\n`);
console.log(out);
console.log(`\nNext: splice in the lines you accept (never blind-replace), then re-run blog:qa + blog:slop.`);
process.exit(0);
