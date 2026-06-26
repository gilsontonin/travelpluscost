"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authBrowser } from "@/lib/auth";

// Heart on a result card. Logged OUT → tapping it sends you to sign in (save needs an account). Member →
// toggles a persistent wishlist (saved_hotels) via /api/saved-hotels. The card root is a <Link>, so the
// click is intercepted (preventDefault + stopPropagation) so it never navigates to the property.
//
// Shared per page: ONE getSession + ONE saved-list fetch, reused by every heart on screen.
let loggedIn: boolean | undefined;
let savedSet: Set<string> | undefined;
let initPromise: Promise<void> | undefined;

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const { data } = await authBrowser().auth.getSession();
      loggedIn = !!data.session;
      if (loggedIn) {
        try {
          const r = await fetch("/api/saved-hotels");
          const j = await r.json();
          savedSet = new Set<string>(Array.isArray(j.ids) ? j.ids : []);
        } catch {
          savedSet = new Set();
        }
      } else {
        savedSet = new Set();
      }
    })();
  }
  return initPromise;
}

export default function SaveHeart({ id }: { id: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    ensureInit().then(() => {
      if (active) setSaved(!!savedSet?.has(id));
    });
    return () => {
      active = false;
    };
  }, [id]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await ensureInit();
    if (!loggedIn) {
      router.push("/join"); // sign in to save
      return;
    }
    const next = !saved;
    setSaved(next); // optimistic
    if (next) savedSet?.add(id);
    else savedSet?.delete(id);
    try {
      await fetch("/api/saved-hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId: id, save: next }),
      });
    } catch {
      /* best-effort — the optimistic state already updated */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? "Saved" : "Save"}
      className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/80 backdrop-blur transition hover:bg-white active:scale-90"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={saved ? "var(--accent)" : "none"}
        stroke={saved ? "var(--accent)" : "#3a3a3a"}
        strokeWidth="2"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    </button>
  );
}
