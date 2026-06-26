"use client";

import { useRouter } from "next/navigation";
import { useVibeTypewriter } from "./useVibeTypewriter";

// Home "search by vibe" pill, KAYAK-style: AI sparkle + the typing suggestion (no label), wrapping to
// 2 lines, runs that search on tap. No model cost. Clean Apple pill — a hairline-bordered white capsule
// with soft elevation (no rainbow hue ring); the accent sparkle + cursor are the only flourish.
export default function VibePromptPill() {
  const router = useRouter();
  const { typed, phraseAt } = useVibeTypewriter();
  return (
    <div className="mt-3 flex justify-center">
      <button
        type="button"
        onClick={() => router.push(`/search?vibe=${encodeURIComponent(phraseAt())}&adults=2`)}
        aria-label="Try search by vibe"
        className="flex w-[18rem] items-center gap-2.5 rounded-3xl border border-black/[0.12] bg-white px-4 py-2.5 text-left shadow-card transition hover:border-black/25 active:scale-[0.99]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-accent">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
        </svg>
        <span className="line-clamp-2 min-h-[2.4em] text-sm font-medium leading-snug text-black/80">
          {typed}
          <span className="animate-pulse text-accent">|</span>
        </span>
      </button>
    </div>
  );
}
