// Backfill LiteAPI room `id`s onto existing content/<slug>.json files so rate room-mapping works.
// NON-DESTRUCTIVE: re-derives ONLY each hotel's `rooms` array from /data/hotel (its source of
// truth) using the shared normRooms (now with ids). Every other field is left untouched.
//
// Run: export $(grep '^LITEAPI_KEY=' .env.local | xargs) && node scripts/enrich-rooms.mjs
//      node scripts/enrich-rooms.mjs oahu maui   # specific regions only

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { normRooms } from "./lib/rooms.mjs";

const BASE = process.env.LITEAPI_BASE_URL || "https://api.liteapi.travel/v3.0";
const KEY = process.env.LITEAPI_KEY;
if (!KEY) {
  console.error("Set LITEAPI_KEY (export from .env.local).");
  process.exit(1);
}
const h = { "X-API-Key": KEY, accept: "application/json" };

const ALL = ["oahu", "maui", "lasvegas", "seattle", "sandiego"];
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ALL;

async function pool(items, n, fn) {
  const q = [...items];
  const workers = Array.from({ length: Math.min(n, q.length) }, async () => {
    for (;;) {
      const item = q.shift();
      if (!item) return;
      await fn(item);
    }
  });
  await Promise.all(workers);
}

async function run(slug) {
  const file = `content/${slug}.json`;
  if (!existsSync(file)) {
    console.warn(`skip ${slug}: ${file} not found`);
    return;
  }
  const hotels = JSON.parse(readFileSync(file, "utf8"));
  let withIds = 0;
  let totalRooms = 0;
  await pool(hotels, 6, async (hotel) => {
    try {
      const r = await fetch(`${BASE}/data/hotel?hotelId=${hotel.id}`, { headers: h });
      if (!r.ok) return; // leave existing rooms untouched on error
      const d = (await r.json())?.data ?? {};
      const rooms = normRooms(d.rooms);
      if (rooms.length) {
        hotel.rooms = rooms;
        totalRooms += rooms.length;
        if (rooms.some((rm) => rm.ids?.length)) withIds++;
      }
    } catch {
      /* keep existing rooms */
    }
  });
  writeFileSync(file, JSON.stringify(hotels, null, 2));
  console.log(`✓ ${slug}: ${withIds}/${hotels.length} hotels have mappable room ids (${totalRooms} rooms)`);
}

for (const slug of targets) {
  await run(slug);
}
