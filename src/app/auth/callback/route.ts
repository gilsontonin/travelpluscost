import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { authServer } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabase";

// Magic-link landing. Supports BOTH Supabase flows:
//   • token_hash + type → verifyOtp — the SSR-recommended flow; works cross-device (no PKCE cookie needed).
//     Requires the Magic Link email template to link here as ?token_hash={{ .TokenHash }}&type=email.
//   • code → exchangeCodeForSession — PKCE fallback (only works in the same browser that requested it).
// On success we ensure a founding-member profile row exists, then send the user to their account.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";

  const supabase = await authServer();
  let user = null;
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) user = data.user;
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) user = data.user;
  }

  if (user) {
    // First sign-in → create the founding-member profile (service key bypasses RLS; idempotent).
    try {
      await supabaseAdmin()
        .from("profiles")
        .upsert({ id: user.id, email: user.email ?? null }, { onConflict: "id", ignoreDuplicates: true });
    } catch {
      /* profiles table not created yet — non-fatal */
    }
    return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/join?error=link", url.origin));
}
