"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authBrowser } from "@/lib/auth";

// Magic-link landing (implicit flow). The browser client auto-detects the session from the URL hash on
// load (no PKCE cookie / no template change needed → works cross-device). Once we have a session we ensure
// the founding-member profile exists (server-side, service key) and send the user to their account.
export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    const sb = authBrowser();
    let done = false;
    const go = async (session: unknown) => {
      if (done || !session) return;
      done = true;
      try {
        await fetch("/api/member-init", { method: "POST" }); // create the founding-member profile row
      } catch {
        /* non-fatal — auth still succeeded */
      }
      router.replace("/account");
    };
    sb.auth.getSession().then(({ data }) => go(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => go(session));
    const t = setTimeout(() => {
      if (!done) {
        setMsg("That link didn't work — sending you back…");
        router.replace("/join?error=link");
      }
    }, 6000);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, [router]);

  return <div className="mx-auto max-w-xl px-4 py-16 text-center text-black/50">{msg}</div>;
}
