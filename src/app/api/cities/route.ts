import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// City autocomplete — sourced entirely from OUR directory (free; no Google/LiteAPI per-keystroke
// cost). Every suggestion is a city we actually have hotels in, so the box can't dead-end. Returns
// the top cities by hotel count for the typed prefix.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ cities: [] });

  const { data, error } = await supabaseAdmin()
    .from("hotels")
    .select("city,state,country")
    .ilike("city", `${q}%`)
    .eq("kind", "hotel") // suggest only cities where we have real hotels
    .not("city", "is", null)
    .limit(300);
  if (error) return NextResponse.json({ cities: [] });

  // Collapse the matching hotel rows into distinct cities, ranked by how many hotels we have there.
  const counts = new Map<string, { city: string; state: string | null; country: string; n: number }>();
  for (const r of data ?? []) {
    if (!r.city) continue;
    const key = `${r.city.toLowerCase()}|${r.state ?? ""}|${r.country}`; // same city, different states = separate suggestions
    const cur = counts.get(key);
    if (cur) cur.n++;
    else counts.set(key, { city: r.city, state: r.state ?? null, country: r.country, n: 1 });
  }
  const cities = [...counts.values()].sort((a, b) => b.n - a.n).slice(0, 8);
  return NextResponse.json({ cities });
}
