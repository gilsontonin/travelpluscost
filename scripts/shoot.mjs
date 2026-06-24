// Screenshot OUR pages (desktop + mobile, full-page) for the design build/diff loop. We capture our
// own site — never scrape another site's assets. Pair these with a reference blueprint in
// docs/REFERENCE-SPECS.md: build → shoot → compare proportions/CTA positions → tweak.
//
//   npm run shoot -- /hotels/las-vegas /destinations/texas        # production (default)
//   SHOOT_BASE=http://localhost:3000 npm run shoot -- /hotels/austin   # local dev server
//
// Output: design/shots/<timestamp>/<path>.<desktop|mobile>.png   (gitignored)
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = (process.env.SHOOT_BASE || "https://travelpluscost.com").replace(/\/$/, "");
const paths = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!paths.length) paths.push("/hotels/las-vegas");

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const OUT = `design/shots/${stamp}`;
const slug = (p) => p.replace(/^\//, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "home";

const targets = [
  { name: "desktop", ctx: { viewport: { width: 1366, height: 900 }, deviceScaleFactor: 2 } },
  { name: "mobile", ctx: { ...devices["iPhone 13"] } },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const t of targets) {
  const ctx = await browser.newContext(t.ctx);
  const page = await ctx.newPage();
  for (const p of paths) {
    try {
      await page.goto(BASE + p, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(2500); // let lazy prices + the map settle
      const file = `${OUT}/${slug(p)}.${t.name}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log("✓", file);
    } catch (e) {
      console.warn("✗", p, t.name, "—", e.message);
    }
  }
  await ctx.close();
}
await browser.close();
console.log("\ndone →", OUT);
