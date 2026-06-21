"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Expedia-style filter chip. The dropdown is position:fixed (anchored to the chip)
// so it escapes the horizontally-scrolling chip row instead of being clipped by it.
export default function FilterChip({
  label,
  active = false,
  children,
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = 288;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    setPos({ top: r.bottom + 8, left });
  };

  const toggle = () => {
    if (!open) place();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={`shrink-0 inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full border transition whitespace-nowrap ${
          active
            ? "bg-accent-tint text-accent border-accent/40 font-medium"
            : "border-black/20 text-black/75 hover:border-black/40"
        }`}
      >
        {label}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div
          ref={panelRef}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
          className="z-50 w-72 max-w-[calc(100vw-16px)] max-h-[70vh] overflow-y-auto bg-white border border-black/10 rounded-lg shadow-xl p-4"
        >
          {children}
        </div>
      ) : null}
    </>
  );
}
