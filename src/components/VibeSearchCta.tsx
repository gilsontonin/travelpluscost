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
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-purple-500">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
        </svg>
        Search by vibe
      </button>
    </div>
  );
}
