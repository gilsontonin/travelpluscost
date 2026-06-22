"use client";

import { useEffect, useState } from "react";
import AmenityIcon from "@/components/AmenityIcon";

function Row({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-black/75">
      <AmenityIcon name={label} className="w-5 h-5 text-black/60 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

export default function AmenitiesSection({ facilities }: { facilities: string[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!facilities.length) return null;
  const preview = facilities.slice(0, 10);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">What this place offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {preview.map((f) => (
          <Row key={f} label={f} />
        ))}
      </div>
      {facilities.length > 10 ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 border border-black/20 rounded-lg px-4 py-2.5 text-sm font-medium hover:border-black/40 transition"
        >
          See all {facilities.length} amenities
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex sm:items-center sm:justify-center" onClick={() => setOpen(false)}>
          <div
            className="bg-white w-full sm:max-w-2xl sm:rounded-lg sm:max-h-[85vh] h-full sm:h-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-black/10">
              <h3 className="font-semibold text-lg">Amenities</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-black/60 hover:text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
              {facilities.map((f) => (
                <Row key={f} label={f} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
