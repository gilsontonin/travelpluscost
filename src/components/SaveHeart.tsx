"use client";

import { useEffect, useState } from "react";

const SAVED_KEY = "tpc:saved"; // same per-browser wishlist as ShareSaveButtons

// Heart that lives on a result card. The card root is a <Link>, so the click is intercepted
// (preventDefault + stopPropagation) to toggle the save without navigating to the property.
export default function SaveHeart({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const list = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
        setSaved(Array.isArray(list) && list.includes(id));
      } catch {
        /* ignore */
      }
    });
  }, [id]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
