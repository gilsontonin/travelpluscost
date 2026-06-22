"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CardCarousel from "@/components/CardCarousel";
import AmenityIcon from "@/components/AmenityIcon";
import RoomDateBar from "@/components/RoomDateBar";
import { money } from "@/lib/format";
import type { RoomOffer } from "@/lib/rates";

const ROOM_SORTS = {
  price_asc: "Lead-in price",
  price_desc: "Price: high to low",
  sleeps: "Sleeps: most",
  size: "Largest room",
} as const;
type RoomSortKey = keyof typeof ROOM_SORTS;

function sortOffers(offers: RoomOffer[], key: RoomSortKey): RoomOffer[] {
  const arr = [...offers];
  if (key === "price_desc") arr.sort((a, b) => b.price.amount - a.price.amount);
  else if (key === "sleeps") arr.sort((a, b) => (b.sleeps ?? 0) - (a.sleeps ?? 0));
  else if (key === "size") arr.sort((a, b) => (b.sqft ?? 0) - (a.sqft ?? 0));
  else arr.sort((a, b) => a.price.amount - b.price.amount); // lead-in price
  return arr;
}

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

function bedCount(o: RoomOffer): number {
  return (o.beds ?? []).reduce((s, b) => s + (b.qty || 0), 0);
}

function RoomCard({ o, href, isLowest }: { o: RoomOffer; href: string; isLowest?: boolean }) {
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
          {isLowest ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#2e7d46] text-white text-[0.7rem] font-semibold px-1.5 py-0.5 mb-1">
              Lowest price
            </span>
          ) : null}
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
                  <AmenityIcon name={a} className="w-4 h-4 text-black/60" />
                  {a}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-3 space-y-1">
            {o.refundable ? (
              <p className="text-sm text-[#1a7a4c] flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>
                  {o.freeCancelBefore ? `Free cancellation before ${fmtDate(o.freeCancelBefore)}` : "Fully refundable"}
                  {o.freeCancelBefore && o.cancelChargeAfter ? (
                    <span className="text-black/60"> · then {money(o.cancelChargeAfter.amount, o.cancelChargeAfter.currency)}</span>
                  ) : null}
                </span>
              </p>
            ) : (
              <p className="text-sm text-black/60">Non-refundable</p>
            )}
            <p className="text-sm text-black/55">{o.boardName ?? "Room only"}</p>
          </div>

          {o.propertyFees?.length ? (
            <div className="mt-3 rounded-lg bg-black/[0.03] p-3 text-sm max-w-sm">
              <div className="flex justify-between gap-4">
                <span className="text-black/60">Room &amp; taxes ({o.price.nights} night{o.price.nights > 1 ? "s" : ""})</span>
                <span className="tabular-nums">{money(o.price.amount, o.price.currency)}</span>
              </div>
              {o.propertyFees.map((f) => (
                <div key={f.label} className="flex justify-between gap-4 mt-1">
                  <span className="text-black/60">
                    {f.label} <span className="text-black/60">· paid at property</span>
                  </span>
                  <span className="tabular-nums">{money(f.amount, f.currency)}</span>
                </div>
              ))}
              <div className="flex justify-between gap-4 font-semibold border-t border-black/10 mt-2 pt-2">
                <span>Total (all-in)</span>
                <span className="tabular-nums">{money(o.price.allIn ?? o.price.amount, o.price.currency)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-black/60">Taxes &amp; fees included — no fees at check-in.</p>
          )}

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
                      <span className="text-black/55 mt-0.5">•</span>
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
              {money(Math.round((o.price.allIn ?? o.price.amount) / o.price.nights), o.price.currency)}
              <span className="text-black/60 font-normal text-sm">/night</span>
            </div>
            <div className="text-xs text-black/55">
              {money(o.price.allIn ?? o.price.amount, o.price.currency)} all-in · {o.price.nights} night{o.price.nights > 1 ? "s" : ""}
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

export default function RoomsPanel({ hotelId, name }: { hotelId: string; name?: string }) {
  const sp = useSearchParams();
  const checkin = sp.get("checkin") ?? "";
  const checkout = sp.get("checkout") ?? "";
  const adults = sp.get("adults") ?? "2";
  const [data, setData] = useState<RoomsData | null>(null);
  const [sort, setSort] = useState<RoomSortKey>("price_asc");
  const [beds, setBeds] = useState<"all" | "1" | "2" | "3">("all");
  const [scrolled, setScrolled] = useState(false);

  // Sticky CTA appears once you scroll past the hero (Expedia pattern).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      total: String(o.price.amount), // online portion (room + online taxes)
      feesAtProperty: String(o.price.feesAtProperty ?? 0),
      currency: o.price.currency,
      nights: String(o.price.nights),
      refundable: o.refundable ? "1" : "0",
      freeCancelBefore: o.freeCancelBefore ?? "",
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
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-xl font-semibold">Choose your room</h2>
          {data && data.offers.length > 1 ? (
            <label className="text-sm flex items-center gap-2 text-black/70">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as RoomSortKey)}
                aria-label="Sort rooms"
                className="border border-black/15 rounded-lg px-2 py-1.5 text-sm bg-white"
              >
                {(Object.keys(ROOM_SORTS) as RoomSortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {ROOM_SORTS[k]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <RoomDateBar />

        {data === null ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 sm:h-40 bg-black/[0.04] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : data.offers.length === 0 ? (
          <p className="text-black/55">No rooms available for these dates. Try different dates.</p>
        ) : (
          (() => {
            const lowestId = [...data.offers].sort((a, b) => a.price.amount - b.price.amount)[0]?.offerId;
            const hasBedData = data.offers.some((o) => bedCount(o) > 0);
            const sorted = sortOffers(data.offers, sort);
            const shown =
              beds === "all"
                ? sorted
                : sorted.filter((o) => {
                    const c = bedCount(o);
                    return beds === "3" ? c >= 3 : c === Number(beds);
                  });
            return (
              <>
                {hasBedData ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {([
                      ["all", "All rooms"],
                      ["1", "1 bed"],
                      ["2", "2 beds"],
                      ["3", "3+ beds"],
                    ] as const).map(([v, label]) => (
                      <button
                        key={v}
                        onClick={() => setBeds(v)}
                        className={`text-sm px-3.5 py-1.5 rounded-full border transition ${
                          beds === v
                            ? "bg-accent-tint text-accent border-accent/40 font-medium"
                            : "border-black/20 text-black/70 hover:border-black/40"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}

                <p className="text-sm text-black/55 mb-3">
                  Showing {shown.length} of {data.offers.length} room{data.offers.length === 1 ? "" : "s"}
                </p>

                {shown.length === 0 ? (
                  <p className="text-black/55">
                    No rooms match that bed count.{" "}
                    <button onClick={() => setBeds("all")} className="text-accent">
                      Show all rooms
                    </button>
                  </p>
                ) : (
                  <div className="space-y-4">
                    {shown.map((o) => (
                      <RoomCard key={o.offerId} o={o} href={reserveHref(o)} isLowest={o.offerId === lowestId} />
                    ))}
                  </div>
                )}
              </>
            );
          })()
        )}
      </section>

      <div
        className={`lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-black/10 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] transition-transform duration-200 ${
          scrolled && cheapest ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="min-w-0">
          {name ? <p className="text-xs text-black/55 truncate">{name}</p> : null}
          {cheapest ? (
            <div className="font-bold leading-tight">
              {money(Math.round((cheapest.price.allIn ?? cheapest.price.amount) / cheapest.price.nights), cheapest.price.currency)}
              <span className="text-sm font-normal text-black/55"> /night</span>
              <span className="text-xs font-normal text-black/60"> · {money(cheapest.price.allIn ?? cheapest.price.amount, cheapest.price.currency)} all-in</span>
            </div>
          ) : null}
        </div>
        <a href="#rooms" className="bg-accent text-white font-medium px-6 py-3 rounded-lg whitespace-nowrap shrink-0">
          Select a room
        </a>
      </div>
    </>
  );
}
