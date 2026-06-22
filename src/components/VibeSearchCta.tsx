"use client";

import { useRouter } from "next/navigation";
import { useVibeTypewriter } from "./useVibeTypewriter";

// The sticky-header search entry, animated: types/erases example vibes and runs that search on tap.
// Replaces the plain "Search hotels" button — the header's search spot IS the vibe search.
export default function VibeSearchCta({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { typed, phraseAt } = useVibeTypewriter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/search?vibe=${encodeURIComponent(phraseAt())}&adults=2`)}
      aria-label="Search by vibe"
      className={`group inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
        <path d="m12 2 1.9 5.8L19.5 9l-4.6 3.8L16.4 19 12 15.5 7.6 19l1.5-6.2L4.5 9l5.6-1.2z" />
      </svg>
      <span className="max-w-[42vw] truncate sm:max-w-[18rem]">
        {typed || "Search by vibe"}
        <span className="ml-px animate-pulse font-normal">|</span>
      </span>
    </button>
  );
}
