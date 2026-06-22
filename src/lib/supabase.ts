// Supabase connection layer — two clients, deliberately split:
//   • supabaseAdmin()   — SECRET key, full access (bypasses RLS). SERVER ONLY (SSR reads, ingest,
//     admin writes). Never import into a client component.
//   • supabaseBrowser() — PUBLISHABLE (anon) key, safe to expose. Login/signup + RLS-gated reads.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

let _admin: SupabaseClient | null = null;

/** Server-only client (secret key, full DB access). Cached per server instance. */
export function supabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("supabaseAdmin() is server-only — never call it from the browser.");
  }
  if (!_admin) {
    _admin = createClient(URL, requireEnv("SUPABASE_SECRET_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}

/** Browser/auth client (publishable key, safe to expose). */
export function supabaseBrowser(): SupabaseClient {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(URL, anon);
}
