"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

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

// Reusable date quick-pick chips. Writes checkin/checkout to the URL so RoomsPanel re-prices.
// `compact` = small label-only chips for the top bar; default = full pills showing the date range
// inside (Expedia rooms-section style).
export default function DateQuickPicks({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const checkin = sp.get("checkin") ?? "";
  const checkout = sp.get("checkout") ?? "";
  const ranges = quickRanges();
  const pick = (ci: string, co: string) => {
    const q = new URLSearchParams(sp.toString());
    q.set("checkin", ci);
    q.set("checkout", co);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {ranges.map((r) => {
          const active = checkin === r.checkin && checkout === r.checkout;
          return (
            <button
              key={r.label}
              type="button"
              onClick={() => pick(r.checkin, r.checkout)}
              className={`rounded-full border px-3 py-1 text-[13px] transition ${
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
    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${className}`}>
      {ranges.map((r) => {
        const active = checkin === r.checkin && checkout === r.checkout;
        return (
          <button
            key={r.label}
            type="button"
            onClick={() => pick(r.checkin, r.checkout)}
            className={`rounded-xl border px-4 py-2.5 text-center transition ${
              active ? "border-accent bg-accent-tint" : "border-black/15 hover:border-black/35"
            }`}
          >
            <span className="block text-sm font-semibold text-black">{r.label}</span>
            <span className="block text-xs text-accent">
              {fmtShort(r.checkin)} - {fmtShort(r.checkout)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
