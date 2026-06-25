// Server-only Supabase Auth — for route handlers (the magic-link callback). Kept apart from src/lib/auth.ts
// so client components never import next/headers.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Server-side auth — reads AND sets the session cookie (used by /auth/callback to exchange the code). */
export async function authServer() {
  const store = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* read-only cookie context (a Server Component) — safe to ignore */
        }
      },
    },
  });
}
