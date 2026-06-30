// Canonical hotel URLs: /hotels/{city}/{name-slug}-{id}. The trailing id (lp…) is what we look up;
// the readable city + name are for SEO + the breadcrumb. /hotels/{city} is reserved for the city hub.

// NFKD splits accents off their base letter; the [^a-z0-9\s-] strip then removes the leftover marks,
// so a diacritic name like Ko Olina collapses to "koolina" without a separate combining-marks pass.
export function slugify(s: string | null | undefined): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function hotelHref(h: { id: string; name?: string | null; city?: string | null }): string {
  const city = slugify(h.city) || "hotel";
  const name = slugify(h.name) || "stay";
  return `/hotels/${city}/${name}-${h.id}`;
}

// The id is the trailing token, e.g. "park-shore-waikiki-lp2d548" -> "lp2d548". Falls back to the
// last hyphen-segment (and ultimately the whole slug) so a hand-typed/legacy slug still resolves.
export function extractHotelId(slug: string): string {
  const m = slug.match(/-(lp[0-9a-z]+)$/i);
  if (m) return m[1];
  const parts = slug.split("-");
  return parts[parts.length - 1] || slug;
}
