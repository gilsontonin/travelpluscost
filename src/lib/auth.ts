// Client-safe Supabase Auth (magic link). Server-only auth (the callback's cookie exchange) lives in
// src/lib/authServer.ts — kept separate so client components can import authBrowser() without pulling in
// next/headers. Complements src/lib/supabase.ts (the data clients).
//
// NOTE: deliberately NO broad middleware. The high-traffic /hotels/** pages are ISR-cached + member UI is
// rendered client-side, so we don't pay a Supabase auth call on every (crawler) request.
import { createBrowserClient } from "@supabase/ssr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Client-side auth — sign-in + session (the browser client persists + refreshes the session in cookies). */
export function authBrowser() {
  return createBrowserClient(URL, ANON);
}
