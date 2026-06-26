// Server-only Supabase Auth — for route handlers (the magic-link callback). Kept apart from src/lib/auth.ts
// so client components never import next/headers.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Returns the authenticated user IFF they are the owner (email matches OWNER_EMAIL), else null. Server-only.
 *  The owner dashboard + its net-cost API gate on this — net only ever flows to the owner's own account.
 *  If OWNER_EMAIL is unset, nobody is the owner (safe default: the dashboard stays locked). */
export async function getOwner() {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!owner) return null;
  const { data } = await (await authServer()).auth.getUser();
  return data.user?.email?.toLowerCase() === owner ? data.user : null;
}

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
