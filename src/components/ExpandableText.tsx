"use client";

import { useState } from "react";

// Renders the hotel description as clean, separated paragraphs. Collapsed by default with a soft
// fade (not a hard line-clamp), expandable via "Read more".
export default function ExpandableText({ text, threshold = 280 }: { text: string; threshold?: number }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const paras = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const long = text.length > threshold || paras.length > 2;

  return (
    <div>
      <div className="relative">
        <div className={`space-y-3 text-[15px] leading-relaxed text-black/75 ${!open && long ? "max-h-32 overflow-hidden" : ""}`}>
          {paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {!open && long ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f4f4f6] to-transparent" />
        ) : null}
      </div>
      {long ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {open ? "Read less" : "Read more"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
