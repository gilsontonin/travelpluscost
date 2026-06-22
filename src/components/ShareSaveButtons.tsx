"use client";

import { useEffect, useState } from "react";

const SAVED_KEY = "tpc:saved";
const BTN =
  "inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3.5 py-1.5 text-sm font-medium text-black/80 transition hover:border-black/30 hover:bg-black/[0.02]";

// Share (native share / copy link) + Save (local wishlist in localStorage). No backend — a private,
// per-browser favorite, our lightweight twist on Expedia's account-based wishlist.
export default function ShareSaveButtons({ id, name }: { id: string; name: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Deferred out of the effect body (localStorage is a client-only external store).
    queueMicrotask(() => {
      try {
        const list = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
        setSaved(Array.isArray(list) && list.includes(id));
      } catch {
        /* ignore */
      }
    });
  }, [id]);

  const toggleSave = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
      const list: string[] = Array.isArray(raw) ? raw : [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(next.includes(id));
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user dismissed */
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={share} className={BTN} aria-label="Share">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="m16 6-4-4-4 4" />
          <path d="M12 2v13" />
        </svg>
        {copied ? "Copied" : "Share"}
      </button>
      <button type="button" onClick={toggleSave} aria-pressed={saved} className={BTN} aria-label="Save">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={saved ? "var(--accent)" : "none"}
          stroke={saved ? "var(--accent)" : "currentColor"}
          strokeWidth="2"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
