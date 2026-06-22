"use client";

import { useRouter } from "next/navigation";
import { useVibeTypewriter } from "./useVibeTypewriter";

// KAYAK-style animated suggestion pill below the home search: types/erases example vibes and runs
// that search on tap. Shares the typewriter + list with the header entry (no AI/model cost).
export default function VibePromptPill() {
  const router = useRouter();
  const { typed, phraseAt } = useVibeTypewriter();
  return (
    <div className="mt-3 flex justify-center">
      <button
        type="button"
        onClick={() => router.push(`/search?vibe=${encodeURIComponent(phraseAt())}&adults=2`)}
        aria-label="Try search by vibe"
        className="group inline-flex max-w-full items-center gap-2.5 rounded-full border border-accent/30 bg-white px-4 py-2.5 text-left shadow-sm transition hover:border-accent/60 hover:shadow-md active:scale-[0.99]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent">
          <path d="m12 2 1.9 5.8L19.5 9l-4.6 3.8L16.4 19 12 15.5 7.6 19l1.5-6.2L4.5 9l5.6-1.2z" />
        </svg>
        <span className="min-w-0 truncate text-sm text-black/70">
          <span className="font-medium text-black/45">Search by vibe: </span>
          {typed}
          <span className="ml-0.5 inline-block animate-pulse font-normal text-accent">|</span>
        </span>
      </button>
    </div>
  );
}
