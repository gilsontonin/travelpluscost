"use client";

import { useRouter } from "next/navigation";
import { useVibeTypewriter } from "./useVibeTypewriter";
import AiSparkle from "@/components/AiSparkle";

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
        <AiSparkle size={18} className="shrink-0 text-accent" />
        <span className="line-clamp-2 min-h-[2.4em] text-sm font-medium leading-snug text-black/80">
          {typed}
          <span className="animate-pulse text-accent">|</span>
        </span>
      </button>
    </div>
  );
}
