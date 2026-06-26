"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authBrowser } from "@/lib/auth";

// Members-only price bar on inventory pages, for logged-in members. Shows the principle (our cost plus one
// flat fee, below the public rate), never an exact net cost or markup % (POSITIONING.md). The per-room
// member price renders on the cards/rooms themselves.
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
        ✓ <b>Member price</b> — you&apos;re seeing our cost plus one small flat fee, below the public rate.
      </p>
    </div>
  );
}
