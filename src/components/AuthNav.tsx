"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authBrowser } from "@/lib/auth";

// Tiny auth-aware header link. Client-side so the host pages (ISR-cached) stay shared/cacheable — this is
// the only per-user bit, hydrated in the browser. "Join free" when logged out, "Account" when signed in.
export default function AuthNav() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = authBrowser();
    sb.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setAuthed(!!session?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Until we know, render the logged-out CTA (the common case) — no layout flash on the way in.
  if (authed) {
    return (
      <Link href="/account" className="text-sm font-medium text-black/75 hover:text-accent whitespace-nowrap">
        Account
      </Link>
    );
  }
  return (
    <Link
      href="/join"
      className="text-sm font-semibold text-accent hover:opacity-80 whitespace-nowrap"
    >
      Join free
    </Link>
  );
}
