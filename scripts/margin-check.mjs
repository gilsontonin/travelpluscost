// PRIVATE margin analysis — never shipped, never displayed (net must stay hidden).
// Compares LiteAPI NET (retailRate.total = your cost, their profit baked in) vs the
// SSP (suggestedSellingPrice = Booking.com parity ≈ live Expedia) so you can pick a
// realistic markup / flat fee.
//
// Run: export $(grep '^LITEAPI' .env.local | xargs); node scripts/margin-check.mjs <region> [sample]
import { readFileSync } from "node:fs";

const BASE = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY;
if (!KEY) {
  console.error("Set LITEAPI_KEY (export from .env.local).");
  process.exit(1);
}
const slug = (process.argv[2] || "oahu").toLowerCase();
const sample = Number(process.argv[3] || 18);

const hotels = JSON.parse(readFileSync(`content/${slug}.json`, "utf8")).slice(0, sample);
const byId = new Map(hotels.map((h) => [String(h.id), h.name]));
const ids = hotels.map((h) => String(h.id));

const d = new Date();
d.setDate(d.getDate() + 30);
const ci = d.toISOString().slice(0, 10);
d.setDate(d.getDate() + 2);
const co = d.toISOString().slice(0, 10);

const money = (n) => `$${n.toFixed(0)}`;

async function rates(chunk) {
  const r = await fetch(`${BASE}/hotels/rates`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": KEY },
    body: JSON.stringify({
      hotelIds: chunk,
      checkin: ci,
      checkout: co,
      occupancies: [{ adults: 2 }],
      currency: "USD",
      guestNationality: "US",
    }),
  });
  const j = await r.json();
  return j?.data ?? [];
}

const main = async () => {
  const chunks = [];
  for (let i = 0; i < ids.length; i += 20) chunks.push(ids.slice(i, i + 20));
  const results = (await Promise.all(chunks.map(rates))).flat();

  const rows = [];
  for (const rh of results) {
    // pick the cheapest-NET rate (your lowest cost) and read its SSP
    let best = null;
    for (const rt of rh.roomTypes ?? []) {
      for (const rate of rt.rates ?? []) {
        const net = rate.retailRate?.total?.[0]?.amount;
        const ssp = rate.retailRate?.suggestedSellingPrice?.[0]?.amount;
        if (typeof net === "number" && (!best || net < best.net)) best = { net, ssp: typeof ssp === "number" ? ssp : null };
      }
    }
    if (best && best.ssp) {
      const spread = best.ssp - best.net;
      rows.push({ name: byId.get(String(rh.hotelId)) ?? rh.hotelId, net: best.net, ssp: best.ssp, spread, pct: (spread / best.ssp) * 100 });
    }
  }
  rows.sort((a, b) => b.pct - a.pct);

  console.log(`\n${slug.toUpperCase()} — ${ci}→${co}, 2 adults — NET (your cost) vs SSP (Booking parity ≈ Expedia)\n`);
  console.log("  NET    SSP    SPREAD   %    HOTEL");
  for (const r of rows) {
    console.log(
      `  ${money(r.net).padEnd(6)} ${money(r.ssp).padEnd(6)} ${money(r.spread).padEnd(7)} ${r.pct.toFixed(0).padStart(3)}%  ${r.name.slice(0, 42)}`,
    );
  }
  if (rows.length) {
    const pcts = rows.map((r) => r.pct).sort((a, b) => a - b);
    const spreads = rows.map((r) => r.spread).sort((a, b) => a - b);
    const med = (arr) => arr[Math.floor(arr.length / 2)];
    const avg = (arr) => arr.reduce((s, x) => s + x, 0) / arr.length;
    console.log(
      `\n  ${rows.length} priced · spread: median ${med(pcts).toFixed(0)}% / avg ${avg(pcts).toFixed(0)}% · $ median ${money(med(spreads))} / avg ${money(avg(spreads))} · range ${pcts[0].toFixed(0)}–${pcts[pcts.length - 1].toFixed(0)}%`,
    );
    console.log(
      `  → A flat fee well under the median spread keeps you BELOW Booking/Expedia (cheaper) and still profitable.\n`,
    );
  } else {
    console.log("  (no priced rooms for these dates)\n");
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
