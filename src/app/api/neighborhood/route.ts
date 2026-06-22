import { getNeighborhood } from "@/lib/neighborhood";

export const dynamic = "force-dynamic";

const EMPTY = { nearby: [], restaurants: [], gettingAround: [] };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  if (!isFinite(lat) || !isFinite(lng)) return Response.json(EMPTY);
  try {
    return Response.json(await getNeighborhood(lat, lng));
  } catch {
    return Response.json(EMPTY);
  }
}
