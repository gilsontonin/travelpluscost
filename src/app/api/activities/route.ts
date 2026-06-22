import { NextResponse } from "next/server";
import { activitiesNear } from "@/lib/viator";

// Viator "things to do" near a point. Property page passes ?lat&lng (the hotel); the home rail
// passes nothing and we use the visitor's Netlify geo. Server-side keeps the Viator key off the client.
export const dynamic = "force-dynamic";

function geoFromReq(req: Request): { lat: number | null; lng: number | null } {
  const raw = req.headers.get("x-nf-geo");
  if (raw) {
    try {
      const g = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
      return { lat: typeof g.latitude === "number" ? g.latitude : null, lng: typeof g.longitude === "number" ? g.longitude : null };
    } catch {
      /* no geo */
    }
  }
  return { lat: null, lng: null };
}

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    let lat = sp.get("lat") ? Number(sp.get("lat")) : null;
    let lng = sp.get("lng") ? Number(sp.get("lng")) : null;
    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
      ({ lat, lng } = geoFromReq(req));
    }
    const limit = Math.min(Number(sp.get("limit")) || 8, 16);
    const { activities, place } = await activitiesNear(lat, lng, limit);
    return NextResponse.json({ activities, place });
  } catch (e) {
    return NextResponse.json({ activities: [], place: null, error: String(e) });
  }
}
