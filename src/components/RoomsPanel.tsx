"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CardCarousel from "@/components/CardCarousel";
import AmenityIcon from "@/components/AmenityIcon";
import { money } from "@/lib/format";
import type { RoomOffer } from "@/lib/rates";

type RoomsData = { offers: RoomOffer[]; nights: number; checkin: string; checkout: string };

function fmtDate(d?: string | null) {
  if (!d) return "";
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function bedLine(o: RoomOffer): string {
  if (!o.beds?.length) return "";
  return o.beds.map((b) => `${b.qty} ${b.type} bed${b.qty > 1 ? "s" : ""}`).join(" + ");
}

function RoomCard({ o, href }: { o: RoomOffer; href: string }) {
  const [details, setDetails] = useState(false);
  const meta = [bedLine(o), o.sleeps ? `Sleeps ${o.sleeps}` : "", o.sqft ? `${o.sqft} sq ft` : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col sm:flex-row bg-white border border-black/[0.07] rounded-lg overflow-hidden">
      {o.photos?.length ? (
        <div className="relative w-full sm:w-60 h-44 sm:h-auto shrink-0 bg-zinc-100">
          <CardCarousel images={o.photos} alt={o.roomName} sizes="(max-width: 640px) 100vw, 240px" />
        </div>
      ) : null}

      <div className="flex-1 min-w-0 p-4 flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{o.roomName}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {o.view ? (
              <span className="inline-flex items-center gap-1 text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                <AmenityIcon name="beach" className="w-3.5 h-3.5" />
                {o.view}
              </span>
            ) : null}
            {meta ? <span className="text-sm text-black/55">{meta}</span> : null}
          </div>

          {o.amenities?.length ? (
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
              {o.amenities.slice(0, 4).map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 text-xs text-black/60">
                  <AmenityIcon name={a} className="w-4 h-4 text-black/40" />
                  {a}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 space-y-1">
            {o.refundable ? (
              <p className="text-sm text-[#1a7a4c] flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {o.freeCancelBefore ? `Free cancellation before ${fmtDate(o.freeCancelBefore)}` : "Fully refundable"}
              </p>
            ) : (
              <p className="text-sm text-black/45">Non-refundable</p>
            )}
            <p className="text-sm text-black/55">{o.boardName ?? "Room only"}</p>
            {o.resortFee ? (
              <p className="text-xs text-amber-700">
                + {money(o.resortFee.amount, o.resortFee.currency)} {o.resortFee.label} (paid at property)
              </p>
            ) : null}
          </div>

          {o.features?.length ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setDetails((v) => !v)}
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                {details ? "Hide room details" : "Room details"}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className={`transition-transform ${details ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {details ? (
                <ul className="mt-2 space-y-1.5">
                  {o.features.map((f) => (
                    <li key={f} className="text-sm text-black/65 flex gap-2">
                      <span className="text-black/30 mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 sm:text-right flex sm:flex-col items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 border-black/[0.06] pt-3 sm:pt-0">
          <div>
            <div className="font-bold text-lg">
              {money(o.price.perNight, o.price.currency)}
              <span className="text-black/45 font-normal text-sm">/night</span>
            </div>
            <div className="text-xs text-black/50">
              {money(o.price.amount, o.price.currency)} total for {o.price.nights} night{o.price.nights > 1 ? "s" : ""}
            </div>
          </div>
          <a
            href={href}
            className="bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition whitespace-nowrap"
          >
            Reserve
          </a>
        </div>
      </div>
    </div>
  );
}

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
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 sm:h-40 bg-black/[0.04] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : data.offers.length === 0 ? (
          <p className="text-black/50">No rooms available for these dates. Try different dates.</p>
        ) : (
          <div className="space-y-4">
            {data.offers.map((o) => (
              <RoomCard key={o.offerId} o={o} href={reserveHref(o)} />
            ))}
          </div>
        )}
      </section>

      {cheapest ? (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-black/10 px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-bold">
              {money(cheapest.price.perNight, cheapest.price.currency)}
              <span className="text-sm font-normal text-black/50"> /night</span>
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
