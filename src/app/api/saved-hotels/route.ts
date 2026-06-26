import { NextResponse } from "next/server";
import { authServer } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabase";

// Member wishlist. GET → the signed-in user's saved hotel ids. POST { hotelId, save } → toggle one.
// Auth-gated (no session → 401). Writes go through the service key but are scoped to the session user's id,
// so a member can only ever touch their own saves. Best-effort: if the table doesn't exist yet, GET returns
// an empty list and POST is a no-op (non-fatal) — safe to deploy before the DDL is run.

export async function GET() {
  const { data: auth } = await (await authServer()).auth.getUser();
  if (!auth.user) return NextResponse.json({ ids: [] }, { status: 401 });
  try {
    const { data } = await supabaseAdmin().from("saved_hotels").select("hotel_id").eq("user_id", auth.user.id);
    return NextResponse.json({ ids: (data ?? []).map((r) => r.hotel_id) });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}

export async function POST(req: Request) {
  const { data: auth } = await (await authServer()).auth.getUser();
  if (!auth.user) return NextResponse.json({ ok: false }, { status: 401 });
  const { hotelId, save } = await req.json().catch(() => ({}));
  if (typeof hotelId !== "string" || !hotelId) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const sb = supabaseAdmin();
    if (save) {
      await sb.from("saved_hotels").upsert({ user_id: auth.user.id, hotel_id: hotelId }, { onConflict: "user_id,hotel_id", ignoreDuplicates: true });
    } else {
      await sb.from("saved_hotels").delete().eq("user_id", auth.user.id).eq("hotel_id", hotelId);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
