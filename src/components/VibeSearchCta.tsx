"use client";

import { useRouter } from "next/navigation";
import AiSparkle from "@/components/AiSparkle";

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
      <AiSparkle size={15} className="shrink-0 text-accent" />
      Search by vibe
    </button>
  );
}
