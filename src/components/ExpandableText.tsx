"use client";

import { useState } from "react";

export default function ExpandableText({ text, threshold = 280 }: { text: string; threshold?: number }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const long = text.length > threshold;

  return (
    <div>
      <p className={`text-black/70 leading-relaxed whitespace-pre-line ${!open && long ? "line-clamp-5" : ""}`}>
        {text}
      </p>
      {long ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {open ? "Read less" : "Read more"}
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
      ) : null}
    </div>
  );
}
