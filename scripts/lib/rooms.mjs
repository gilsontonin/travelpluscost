// Shared room-content normalization, used by ingest.mjs AND enrich-rooms.mjs so the two never
// drift. Derives the display room list from a hotel's /data/hotel `rooms` array and — crucially —
// keeps each LiteAPI room `id` so a rate's `mappedRoomId` (roomMapping:true) can resolve to the
// exact room's photos/beds/size instead of a fuzzy name match.

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// LiteAPI gives room size in m2; US audience wants sqft. Some source rows carry a bogus tiny size
// (e.g. 38 — a mislabelled unit); no real hotel room is under ~70 sqft, so drop those rather than
// display a wrong number. (Surfaced once exact room-mapping stopped masking it via name matching.)
function toSqft(size, unit) {
  if (!size || typeof size !== "number") return null;
  const sqft = unit === "m2" ? Math.round(size * 10.7639) : Math.round(size);
  return sqft >= 70 ? sqft : null;
}

// room.description is rich, structured HTML:
//   <p><strong>1 King Bed</strong></p><p>141-sq-foot room ...</p><p><b>Internet</b> - Free WiFi ...</p>
// Split into the "Label - value" feature bullets (the useful part) + a short summary.
function parseRoomDesc(html) {
  if (!html) return { summary: "", features: [] };
  const blocks = html
    .split(/<\/p>|<br\s*\/?>/i)
    .map((b) => stripHtml(b))
    .filter(Boolean);
  const features = [];
  let summary = "";
  for (const b of blocks) {
    if (/\s-\s/.test(b) && b.length < 220) features.push(b);
    else if (!summary && b.length < 160) summary = b;
  }
  return { summary, features: features.slice(0, 8) };
}

// rooms[] content (photos, size, beds, amenities) + LiteAPI room `id`s for room mapping.
// Deduped by room name (same name = same product); every source room's id is kept in `ids`
// so a rate's `mappedRoomId` resolves to the right display room. Caps at 40 distinct rooms.
export function normRooms(raw) {
  if (!Array.isArray(raw)) return [];
  const byName = new Map();
  for (const r of raw) {
    const name = (r.roomName ?? r.name ?? "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const id = typeof r.id === "number" ? r.id : null;
    if (byName.has(key)) {
      if (id != null) byName.get(key).ids.push(id); // same name, another mappable id
      continue;
    }
    if (byName.size >= 40) continue; // cap distinct rooms, but keep collecting ids above
    const { summary, features } = parseRoomDesc(r.description);
    byName.set(key, {
      ids: id != null ? [id] : [],
      name,
      summary,
      features,
      view: (r.views ?? []).map((v) => v?.view).filter(Boolean)[0] ?? null,
      sqft: toSqft(r.roomSizeSquare, r.roomSizeUnit),
      sleeps: r.maxOccupancy ?? r.maxAdults ?? null,
      beds: (r.bedTypes ?? [])
        .map((b) => ({ qty: b.quantity ?? 1, type: (b.bedType ?? "").replace(/\s*bed$/i, "").trim() }))
        .filter((b) => b.type),
      amenities: (r.roomAmenities ?? r.amenities ?? [])
        .map((a) => (typeof a === "string" ? a : a?.name))
        .filter(Boolean)
        .slice(0, 12),
      photos: (r.photos ?? []).map((p) => p.hd_url || p.url).filter(Boolean).slice(0, 6),
    });
  }
  return [...byName.values()];
}
