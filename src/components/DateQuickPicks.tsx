"use client";

import { useStay } from "@/lib/useStay";

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtShort(s: string) {
  return new Date(`${s}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
// Quick date ranges (Expedia "Tonight / This weekend / …"). Computed client-side from today.
function quickRanges(): { label: string; checkin: string; checkout: string }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisFri = addDays(today, (5 - today.getDay() + 7) % 7);
  const nextFri = addDays(thisFri, 7);
  return [
    { label: "Tonight", checkin: ymd(today), checkout: ymd(addDays(today, 1)) },
    { label: "Tomorrow", checkin: ymd(addDays(today, 1)), checkout: ymd(addDays(today, 2)) },
    { label: "This weekend", checkin: ymd(thisFri), checkout: ymd(addDays(thisFri, 2)) },
    { label: "Next weekend", checkin: ymd(nextFri), checkout: ymd(addDays(nextFri, 2)) },
  ];
}

// Reusable date quick-pick chips. Writes checkin/checkout via useStay so the rooms re-price instantly with
// no scroll-jump. `compact` = small label-only chips for the top bar; default = a clean 2-column grid of
// stacked label/date cells (the rooms section).
export default function DateQuickPicks({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const { checkin, checkout, update } = useStay();
  const ranges = quickRanges();
  const pick = (ci: string, co: string) => update({ checkin: ci, checkout: co });

  if (compact) {
    return (
      <div className={`hidden gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex ${className}`}>
        {ranges.map((r) => {
          const active = checkin === r.checkin && checkout === r.checkout;
          return (
            <button
              key={r.label}
              type="button"
              onClick={() => pick(r.checkin, r.checkout)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[13px] transition ${
                active
                  ? "border-accent bg-accent-tint font-medium text-accent"
                  : "border-black/20 text-black/70 hover:border-black/40"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {ranges.map((r) => {
        const active = checkin === r.checkin && checkout === r.checkout;
        return (
          <button
            key={r.label}
            type="button"
            onClick={() => pick(r.checkin, r.checkout)}
            className={`flex w-full flex-col items-center rounded-2xl border px-3 py-2.5 text-center transition ${
              active ? "border-accent/60 bg-accent-tint" : "border-black/15 hover:border-black/35"
            }`}
          >
            <span className="text-sm font-semibold text-black">{r.label}</span>
            <span className={`text-xs ${active ? "text-accent" : "text-black/50"}`}>
              {fmtShort(r.checkin)} – {fmtShort(r.checkout)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
