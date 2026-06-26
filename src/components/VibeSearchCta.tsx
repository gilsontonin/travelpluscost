"use client";

import { useRouter } from "next/navigation";

// Sticky-header search entry — opens the search page straight into vibe mode with an empty input.
// Clean Apple pill: a hairline-bordered white capsule (no loud gradient hue ring); the accent sparkle
// is the only flourish, marking it as the AI / vibe search.
export default function VibeSearchCta({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/search?mode=vibe")}
      aria-label="Search by vibe"
      className={`inline-flex items-center gap-1.5 rounded-full border border-black/[0.12] bg-white px-3.5 py-1.5 text-sm font-semibold text-black/80 transition hover:border-black/25 hover:bg-black/[0.02] active:scale-95 ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
      </svg>
      Search by vibe
    </button>
  );
}
