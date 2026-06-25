import { NextResponse } from "next/server";
import { authServer } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabase";

// Called once right after a magic-link sign-in (from /auth/callback). Reads the session cookie the browser
// just set, then creates the founding-member profile row (service key bypasses RLS; idempotent so repeat
// sign-ins are no-ops). Keeps profile creation out of the client and off any DB trigger.
export async function POST() {
  const supabase = await authServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    await supabaseAdmin()
      .from("profiles")
      .upsert({ id: data.user.id, email: data.user.email ?? null }, { onConflict: "id", ignoreDuplicates: true });
  } catch {
    /* profiles table not created yet — non-fatal */
  }
  return NextResponse.json({ ok: true });
}
