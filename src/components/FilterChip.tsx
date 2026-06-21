"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A single Expedia-style filter chip that opens an inline dropdown.
export default function FilterChip({
  label,
  active = false,
  align = "left",
  children,
}: {
  label: string;
  active?: boolean;
  align?: "left" | "right";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition whitespace-nowrap ${
          active
            ? "bg-accent-tint text-accent border-accent/40 font-medium"
            : "border-black/15 text-black/70 hover:border-black/40"
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
          className={`absolute z-30 mt-2 bg-white border border-black/10 rounded-lg shadow-lg p-4 max-w-[80vw] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
