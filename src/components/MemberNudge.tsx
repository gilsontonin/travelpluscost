"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authBrowser } from "@/lib/auth";

// Cached once per page-load. getSession is a local cookie read (no network), but caching means only the
// first card checks — the other ~17 reuse it.
let cachedLoggedIn: boolean | undefined;
let pending: Promise<boolean> | undefined;

// Logged-OUT only: a subtle, honest "members pay less — sign up free" nudge under the public price. No
// per-hotel number, no strike-through, no net → compliant + on-brand (not the "secret
// price" gimmick). Renders nothing for members (they already see the member price) and nothing while loading
// (no flash). Turns every browse into a sign-up prompt without a single fake discount.
export default function MemberNudge() {
  const [loggedIn, setLoggedIn] = useState<boolean | undefined>(cachedLoggedIn);

  useEffect(() => {
    let active = true;
    if (!pending) {
      pending = authBrowser()
        .auth.getSession()
        .then(({ data }) => {
          cachedLoggedIn = !!data.session;
          return cachedLoggedIn;
        });
    }
    pending.then((v) => {
      if (active) setLoggedIn(v);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loggedIn !== false) return null; // loading (undefined) or member (true) → render nothing

  return (
    <Link
      href="/join"
      className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent-tint px-2 py-1 text-[0.7rem] font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent active:scale-95"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Members pay less — sign up free
      <span aria-hidden>→</span>
    </Link>
  );
}
