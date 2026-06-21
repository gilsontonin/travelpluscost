// Supabase (Postgres) — hotel content store. Service-role client for ingestion/server reads.
import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Service-role client — server-side ONLY (ingestion, privileged reads). Never ship to the browser. */
export function supabaseAdmin() {
  return createClient(supabaseUrl, requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}
