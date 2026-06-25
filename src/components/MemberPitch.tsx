"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authBrowser } from "@/lib/auth";

// Members-only savings pitch — a thin bar on inventory pages, for logged-in (founding) members only.
// Phase 1 shows the AGGREGATE savings, never an exact below-SSP price (parity + net-derivation guardrails in
// POSITIONING.md). The real per-room member price unlocks with paid membership + live bookings (Phase 2).
export default function MemberPitch() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const sb = authBrowser();
    sb.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setAuthed(!!session?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  const onInventory = pathname?.startsWith("/hotels/") || pathname?.startsWith("/search");
  if (!authed || !onInventory) return null;

  return (
    <div className="bg-accent-tint border-y border-accent/20">
      <p className="mx-auto max-w-7xl px-4 py-2 text-xs sm:text-sm text-accent text-center">
        ✓ <b>Founding member</b> — at launch you&apos;ll book these at our cost plus one small fee, typically{" "}
        <b>20–35% below the public rate</b>.
      </p>
    </div>
  );
}
