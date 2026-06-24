// Mobile-first screenshot harness for the design loop. Runs a realistic phone profile (Playwright
// device emulation: real viewport, 3× DPR, touch, mobile UA) and captures OUR pages — never another
// site's. Phone takes priority: mobile is always shot; desktop only with --desktop.
//
//   npm run shoot                         # all templates, production, mobile (fold + full page)
//   npm run shoot -- /hotels/las-vegas    # one page
//   npm run shoot -- --desktop            # also capture desktop
//   npm run shoot:local                   # same, against the local dev server (iterate w/o deploy)
//   DEVICE="Pixel 7" npm run shoot        # different phone
//
// Output: design/shots/<timestamp>/<slug>.<mobile|desktop>.<fold|full>.png   (gitignored)
//   .fold = above the fold (one phone screen) · .full = the whole scrolling page
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = (process.env.SHOOT_BASE || "https://travelpluscost.com").replace(/\/$/, "");
const DEVICE = process.env.DEVICE || "iPhone 13";
const args = process.argv.slice(2);
const withDesktop = args.includes("--desktop");
let paths = args.filter((a) => !a.startsWith("--"));

// One representative page per template (mobile-first). Pass paths to override.
const TEMPLATES = {
  home: "/",
  "city-hub": "/hotels/las-vegas",
  "city-hub-small": "/hotels/asheville",
  "state-hub": "/destinations/texas",
  browse: "/hotels",
  search: "/search?destination=Las%20Vegas&adults=2",
  property: "/hotels/honolulu/prince-waikiki-lp1e13c",
};
if (!paths.length) paths = Object.values(TEMPLATES);

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const OUT = `design/shots/${stamp}`;
const slug = (p) =>
  p.replace(/^\//, "").replace(/[?&=%]+/g, "-").replace(/[^\w-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "home";

const phone = devices[DEVICE] ?? devices["iPhone 13"];
const targets = [{ name: "mobile", ctx: { ...phone } }];
if (withDesktop) targets.push({ name: "desktop", ctx: { viewport: { width: 1366, height: 900 }, deviceScaleFactor: 2 } });

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const t of targets) {
  const ctx = await browser.newContext(t.ctx);
  const page = await ctx.newPage();
  for (const p of paths) {
    try {
      await page.goto(BASE + p, { waitUntil: "load", timeout: 90000 });
      await page.waitForTimeout(2800); // let lazy prices + the map settle
      const stem = `${OUT}/${slug(p)}.${t.name}`;
      await page.screenshot({ path: `${stem}.fold.png` }); // above the fold (one screen)
      await page.screenshot({ path: `${stem}.full.png`, fullPage: true });
      console.log(`✓ ${t.name.padEnd(7)} ${p}`);
    } catch (e) {
      console.warn(`✗ ${t.name.padEnd(7)} ${p} — ${e.message}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`\n${DEVICE} · ${targets.map((t) => t.name).join(" + ")} · ${paths.length} page(s) → ${OUT}`);
