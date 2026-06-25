import { NextResponse } from "next/server";
import { authServer } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabase";

// Magic-link landing: Supabase sends the user here with a `code`. We exchange it for a session (sets the
// auth cookie), then ensure a founding-member profile row exists, then send them to their account.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await authServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // First sign-in → create the founding-member profile (service key bypasses RLS; idempotent so repeat
      // sign-ins are no-ops). If the table doesn't exist yet, auth still works — just skip silently.
      try {
        await supabaseAdmin()
          .from("profiles")
          .upsert({ id: data.user.id, email: data.user.email ?? null }, { onConflict: "id", ignoreDuplicates: true });
      } catch {
        /* profiles table not created yet — non-fatal */
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  // Bad/expired link → back to /join with a flag the form can surface.
  return NextResponse.redirect(new URL("/join?error=link", url.origin));
}
