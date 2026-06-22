"use client";

import { useRouter } from "next/navigation";
import { useVibeTypewriter } from "./useVibeTypewriter";

// Home "search by vibe" pill, KAYAK-style: AI sparkle + the typing suggestion (no label), wrapping
// to 2 lines, inside a colorful gradient "AI" hue ring. Runs that search on tap. No model cost.
export default function VibePromptPill() {
  const router = useRouter();
  const { typed, phraseAt } = useVibeTypewriter();
  return (
    <div className="mt-3 flex justify-center">
      <div className="rounded-3xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-orange-400 p-[1.5px] shadow-[0_6px_28px_-8px_rgba(192,38,211,0.5)]">
        <button
          type="button"
          onClick={() => router.push(`/search?vibe=${encodeURIComponent(phraseAt())}&adults=2`)}
          aria-label="Try search by vibe"
          className="flex w-[18rem] items-center gap-2.5 rounded-3xl bg-white px-4 py-2.5 text-left active:scale-[0.99]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-black/75">
            <path d="m12 2 1.9 5.8L19.5 9l-4.6 3.8L16.4 19 12 15.5 7.6 19l1.5-6.2L4.5 9l5.6-1.2z" />
          </svg>
          <span className="line-clamp-2 min-h-[2.4em] text-sm font-medium leading-snug text-black/80">
            {typed}
            <span className="animate-pulse text-fuchsia-500">|</span>
          </span>
        </button>
      </div>
    </div>
  );
}
