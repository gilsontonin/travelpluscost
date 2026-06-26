"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { money } from "@/lib/format";

// Compact price + booking CTA high on the page (fills the valuable top space, esp. on mobile where
// there's no sticky desktop sidebar yet). Fetches the cheapest live rate; scrolls to the rooms.
export default function PriceCta({ hotelId }: { hotelId: string }) {
  const sp = useSearchParams();
  const [p, setP] = useState<{ perNight: number; allIn: number; currency: string } | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let on = true;
    const q = new URLSearchParams({ hotelId, adults: sp.get("adults") ?? "2" });
    const ci = sp.get("checkin");
    const co = sp.get("checkout");
    if (ci) q.set("checkin", ci);
    if (co) q.set("checkout", co);
    fetch(`/api/rooms?${q.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!on) return;
        const c = (d.offers ?? []).slice().sort((a: { price: { amount: number } }, b: { price: { amount: number } }) => a.price.amount - b.price.amount)[0];
        if (c) {
          const allIn = c.price.allIn ?? c.price.amount;
          setP({ perNight: Math.round(allIn / c.price.nights), allIn, currency: c.price.currency });
        }
        setDone(true);
      })
      .catch(() => on && setDone(true));
    return () => {
      on = false;
    };
  }, [hotelId, sp]);

  return (
    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent-tint/40 p-4">
      <div className="min-w-0">
        {p ? (
          <>
            <p className="text-lg font-bold leading-tight">
              {money(p.perNight, p.currency)}
              <span className="text-sm font-normal text-black/60"> /night</span>
            </p>
            <p className="text-xs text-black/60">
              {money(p.allIn, p.currency)} all-in · <span className="text-accent">same price for everyone</span>
            </p>
          </>
        ) : done ? (
          <p className="text-sm font-medium text-black/80">
            One honest price — <span className="text-accent">the same for everyone.</span>
          </p>
        ) : (
          <p className="text-sm text-black/45">Checking price…</p>
        )}
      </div>
      <a
        href="#rooms"
        className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Select a room
      </a>
    </div>
  );
}
