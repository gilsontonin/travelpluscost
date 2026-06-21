"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { money } from "@/lib/format";
import type { RoomOffer } from "@/lib/rates";

type RoomsData = { offers: RoomOffer[]; nights: number; checkin: string; checkout: string };

export default function RoomsPanel({ hotelId }: { hotelId: string }) {
  const sp = useSearchParams();
  const checkin = sp.get("checkin") ?? "";
  const checkout = sp.get("checkout") ?? "";
  const adults = sp.get("adults") ?? "2";
  const [data, setData] = useState<RoomsData | null>(null);

  useEffect(() => {
    let on = true;
    const q = new URLSearchParams({ hotelId, adults });
    if (checkin) q.set("checkin", checkin);
    if (checkout) q.set("checkout", checkout);
    fetch(`/api/rooms?${q.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (on) setData(d);
      })
      .catch(() => {
        if (on) setData({ offers: [], nights: 1, checkin: "", checkout: "" });
      });
    return () => {
      on = false;
    };
  }, [hotelId, checkin, checkout, adults]);

  function reserveHref(o: RoomOffer) {
    const q = new URLSearchParams({
      hotelId,
      room: o.roomName,
      board: o.boardName ?? "",
      total: String(o.price.amount),
      currency: o.price.currency,
      nights: String(o.price.nights),
      perNight: String(o.price.perNight),
      checkin: data?.checkin ?? checkin,
      checkout: data?.checkout ?? checkout,
      adults,
    });
    return `/book?${q.toString()}`;
  }

  const cheapest = data?.offers[0];

  return (
    <>
      <section id="rooms" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4">Choose your room</h2>
        {data === null ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-black/[0.04] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : data.offers.length === 0 ? (
          <p className="text-black/50">No rooms available for these dates. Try different dates.</p>
        ) : (
          <div className="space-y-3">
            {data.offers.map((o) => (
              <div
                key={o.offerId}
                className="flex flex-wrap items-center justify-between gap-3 bg-white border border-black/5 rounded-lg p-4"
              >
                <div>
                  <p className="font-medium">{o.roomName}</p>
                  <p className="text-sm text-black/50">
                    {o.boardName ?? "Room only"} · {o.refundable ? "Refundable" : "Non-refundable"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      {money(o.price.perNight, o.price.currency)}
                      <span className="text-black/45 font-normal text-sm">/night</span>
                    </div>
                    <div className="text-xs text-black/45">{money(o.price.amount, o.price.currency)} total</div>
                  </div>
                  <a
                    href={reserveHref(o)}
                    className="bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition"
                  >
                    Reserve
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {cheapest ? (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-black/10 px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-bold">
              {money(cheapest.price.perNight, cheapest.price.currency)}
              <span className="text-sm font-normal text-black/50"> nightly</span>
            </div>
            <div className="text-xs text-black/50">{money(cheapest.price.amount, cheapest.price.currency)} total</div>
          </div>
          <a href="#rooms" className="bg-accent text-white font-medium px-6 py-3 rounded-lg">
            Select a room
          </a>
        </div>
      ) : null}
    </>
  );
}
