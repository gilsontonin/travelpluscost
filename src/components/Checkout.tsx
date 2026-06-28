"use client";

import Image from "next/image";
import { useState } from "react";
import BookingForm from "@/components/BookingForm";
import { money } from "@/lib/format";

type Props = {
  hotelId: string;
  hotelName?: string;
  image?: string;
  room: string;
  board: string;
  online: number; // estimate from the room card (member price for members, else SSP)
  publicOnline: number; // SSP — for the strikethrough + savings
  feesAtProperty: number;
  currency: string;
  nights: number;
  checkin: string;
  checkout: string;
  adults: string;
  refundable: boolean;
  freeCancelBefore: string;
  cancelLabel: string;
};

// Owns the price the sidebar shows so it ALWAYS equals what's charged: until the guest reaches the payment
// step we show the room-card estimate; once prebook confirms, the sidebar reconciles to the EXACT prebook
// price (never a number on the receipt that differs from the charge — "one true price").
export default function Checkout(p: Props) {
  const [confirmed, setConfirmed] = useState<{ price: number; priceChanged?: boolean } | null>(null);

  const payToday = confirmed?.price ?? p.online;
  const allIn = payToday + p.feesAtProperty;
  const memberSave = Math.max(0, Math.round(p.publicOnline - payToday));

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* left: guest + payment */}
      <BookingForm
        hotelId={p.hotelId}
        room={p.room}
        total={String(p.online)}
        feesAtProperty={String(p.feesAtProperty)}
        currency={p.currency}
        nights={String(p.nights)}
        checkin={p.checkin}
        checkout={p.checkout}
        adults={p.adults}
        board={p.board}
        refundable={p.refundable ? "1" : "0"}
        freeCancelBefore={p.freeCancelBefore}
        onConfirmed={setConfirmed}
      />

      {/* right: price details — reconciles to the confirmed charge once prebook resolves */}
      <aside className="bg-card border border-black/[0.07] rounded-2xl p-5 h-fit shadow-card lg:sticky lg:top-24">
        {p.image ? (
          <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3">
            <Image src={p.image} alt={p.hotelName ?? ""} fill sizes="360px" className="object-cover" />
          </div>
        ) : null}
        <p className="font-semibold">{p.hotelName ?? "Your stay"}</p>
        <p className="text-sm text-black/60">{p.room}</p>
        <p className="text-sm text-black/60 mt-1">
          {p.checkin} → {p.checkout} · {p.adults} adult{Number(p.adults) > 1 ? "s" : ""}
        </p>
        <p className={`text-sm mt-1 ${p.refundable ? "text-[#1a7a4c]" : "text-black/60"}`}>{p.cancelLabel}</p>

        <div className="mt-4 border-t border-black/5 pt-4 text-sm space-y-1.5">
          <h3 className="font-semibold mb-1">Price details</h3>
          {memberSave >= 1 ? (
            <div className="flex justify-between text-black/60">
              <span>Public price</span>
              <span className="line-through">{money(p.publicOnline, p.currency)}</span>
            </div>
          ) : null}
          <Row
            label={`${memberSave >= 1 ? "Member price · room & taxes" : "Room & taxes"} (${p.nights} night${p.nights > 1 ? "s" : ""})`}
            value={money(payToday, p.currency)}
          />
          {p.feesAtProperty > 0 ? <Row label="Fees · paid at property" value={money(p.feesAtProperty, p.currency)} /> : null}
          {memberSave >= 1 ? (
            <div className="flex justify-between font-semibold text-accent">
              <span>You save</span>
              <span>−{money(memberSave, p.currency)}</span>
            </div>
          ) : null}
        </div>
        <div className="mt-3 border-t border-black/5 pt-3 flex justify-between font-semibold text-base">
          <span>Total all-in ({p.currency})</span>
          <span>{money(allIn, p.currency)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-black/60">
          <span>Pay today</span>
          <span>{money(payToday, p.currency)}</span>
        </div>
        {p.feesAtProperty > 0 ? (
          <div className="flex justify-between text-sm text-black/60">
            <span>At property</span>
            <span>{money(p.feesAtProperty, p.currency)}</span>
          </div>
        ) : null}

        {confirmed?.priceChanged ? (
          <p className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            This room&apos;s price changed since you viewed it — the total above is the current, confirmed price.
          </p>
        ) : null}

        <p className="mt-4 rounded-xl bg-accent-tint/60 p-3 text-xs text-black/70">
          <span className="font-medium text-accent">{memberSave >= 1 ? "Member price." : "One honest price."}</span>{" "}
          {memberSave >= 1
            ? `What the hotel charges us plus our flat fee — ${money(memberSave, p.currency)} below the public rate, the same for every member.`
            : "The same for everyone, never based on your data. Every fee shown up front — no hidden markup, no fake discounts."}
        </p>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-black/55">{label}</span>
      <span className="text-black/80 text-right">{value}</span>
    </div>
  );
}
