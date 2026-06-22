"use client";

import { useRouter } from "next/navigation";

// Sticky-header search entry — static (not animated; the animated pill lives on the home screen).
// Opens the search page straight into vibe mode with an empty input, ready to type.
export default function VibeSearchCta({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/search?mode=vibe")}
      aria-label="Search by vibe"
      className={`group inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
        <path d="m12 2 1.9 5.8L19.5 9l-4.6 3.8L16.4 19 12 15.5 7.6 19l1.5-6.2L4.5 9l5.6-1.2z" />
      </svg>
      <span>Search by vibe</span>
    </button>
  );
}
