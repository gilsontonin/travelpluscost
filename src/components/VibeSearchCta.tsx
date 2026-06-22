"use client";

import { useRouter } from "next/navigation";

// Sticky-header search entry — same pill style as the home vibe pill (AI sparkle + gradient hue
// ring) but STATIC: labeled "Search by vibe", no typing animation. Opens the search page straight
// into vibe mode with an empty input.
export default function VibeSearchCta({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <div className={`inline-flex rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-orange-400 p-[1.5px] shadow-[0_2px_14px_-4px_rgba(192,38,211,0.5)] ${className}`}>
      <button
        type="button"
        onClick={() => router.push("/search?mode=vibe")}
        aria-label="Search by vibe"
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-black/80 transition hover:bg-black/[0.02] active:scale-95"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black/75">
          <path d="m12 2 1.9 5.8L19.5 9l-4.6 3.8L16.4 19 12 15.5 7.6 19l1.5-6.2L4.5 9l5.6-1.2z" />
        </svg>
        Search by vibe
      </button>
    </div>
  );
}
