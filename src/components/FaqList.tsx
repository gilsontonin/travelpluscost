"use client";

import { useState } from "react";

type QA = { q: string; a: string };

function FaqItem({ f }: { f: QA }) {
  return (
    <details className="group border-b border-black/[0.08] py-3.5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {f.q}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-black/60 transition-transform group-open:rotate-180">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <p className="mt-2 text-sm leading-relaxed text-black/65">{f.a}</p>
    </details>
  );
}

// Shows the first 10 questions; the rest stay in the DOM (crawlable) and reveal inline on click —
// never conditionally rendered, so Google sees all of them (and the FAQPage schema lists them all).
export default function FaqList({ faqs }: { faqs: QA[] }) {
  const [showAll, setShowAll] = useState(false);
  const first = faqs.slice(0, 10);
  const rest = faqs.slice(10);

  return (
    <div className="max-w-3xl border-t border-black/[0.08]">
      {first.map((f) => (
        <FaqItem key={f.q} f={f} />
      ))}
      {rest.length ? (
        <>
          <div className={showAll ? "" : "hidden"}>
            {rest.map((f) => (
              <FaqItem key={f.q} f={f} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            {showAll ? "Show fewer questions" : `Show ${rest.length} more questions`}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`transition-transform ${showAll ? "rotate-180" : ""}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </>
      ) : null}
    </div>
  );
}
