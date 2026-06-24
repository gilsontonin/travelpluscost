"use client";

import { useRouter } from "next/navigation";

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
// Quick date ranges (Tonight / Tomorrow / This weekend / Next weekend), computed client-side from today.
function quickRanges() {
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

// Blog quick date picker — sits right before the inventory. Clicking a date opens the search page
// already preprogrammed with the destination, those dates and travelers (so the reader lands on
// priced results in one tap). Auto-adjusts to today (client-side).
export default function BlogDatePicks({
  destination,
  adults = 2,
  title = "Check prices for these dates",
}: {
  destination: string;
  adults?: number;
  title?: string;
}) {
  const router = useRouter();
  const ranges = quickRanges();
  const go = (ci: string, co: string) => {
    const q = new URLSearchParams();
    q.set("destination", destination);
    q.set("checkin", ci);
    q.set("checkout", co);
    q.set("adults", String(adults));
    router.push(`/search?${q.toString()}`);
  };

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-bold tracking-tight text-black">{title}</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ranges.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => go(r.checkin, r.checkout)}
            className="rounded-xl border border-black/15 px-4 py-3 text-center transition hover:border-black/35 hover:bg-black/[0.02]"
          >
            <span className="block text-sm font-semibold text-black">{r.label}</span>
            <span className="mt-0.5 block text-xs text-accent">
              {fmtShort(r.checkin)} – {fmtShort(r.checkout)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
