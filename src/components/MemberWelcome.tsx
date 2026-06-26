"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authBrowser } from "@/lib/auth";

// Compact member welcome for the /account "member home". Client-side: gates the page (logged-out → /join)
// and greets the member; the inventory below it is server-rendered + shared. Deliberately small — the
// valuable real estate goes to inventory, not a membership dashboard.
export default function MemberWelcome() {
  const router = useRouter();
  const [no, setNo] = useState<number | null | undefined>(undefined); // undefined = still loading

  useEffect(() => {
    const sb = authBrowser();
    (async () => {
      const { data } = await sb.auth.getUser();
      if (!data.user) {
        router.replace("/join");
        return;
      }
      const { data: p } = await sb.from("profiles").select("member_no").eq("id", data.user.id).maybeSingle();
      setNo((p?.member_no as number) ?? null);
    })();
  }, [router]);

  async function signOut() {
    await authBrowser().auth.signOut();
    router.replace("/");
  }

  if (no === undefined) return <div className="h-16" aria-hidden />; // reserve space — no layout flash

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent-tint px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-accent text-sm">✓ Member{no ? ` · #${no}` : ""}</p>
        <button onClick={signOut} className="text-xs text-black/45 hover:text-black/80">
          Sign out
        </button>
      </div>
      <p className="mt-0.5 text-xs sm:text-sm text-black/70">
        Welcome back — you&apos;re seeing <b>member prices</b>, below the public rate. Search or browse anything below.
      </p>
    </div>
  );
}
