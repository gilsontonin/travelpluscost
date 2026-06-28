"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Price } from "@/lib/rates";
import { fromDate } from "@/lib/fromDate";

// One client-side batch fetch of live "from" SSP for every ::hotel card on the page, shared via context
// so each BlogHotelCard shows a price without firing its own request. Near-term default dates (a "from"),
// loaded after paint — the static blog can't fetch rates at build (no LiteAPI there). The SAME dates are
// shared so each card LINKS to the property page on those exact dates → the price the card shows == the
// price the property page (and checkout) shows == one cached value (one true price), instead of the page
// repricing on its own default date.
type Ctx = { prices: Record<string, Price>; checkin: string; checkout: string };
const PriceCtx = createContext<Ctx>({ prices: {}, checkin: "", checkout: "" });
export const useHotelPrice = (id: string): Price | undefined => useContext(PriceCtx).prices[id];
export const useStayDates = () => {
  const c = useContext(PriceCtx);
  return { checkin: c.checkin, checkout: c.checkout };
};

export default function BlogPriceProvider({ ids, children }: { ids: string[]; children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, Price>>({});
  const [dates] = useState(fromDate); // computed once; cards link on the SAME dates they were priced for
  const idsKey = [...new Set(ids)].sort().join(",");

  useEffect(() => {
    const list = idsKey ? idsKey.split(",") : [];
    if (!list.length) return;
    let on = true;
    fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelIds: list, adults: 2, checkin: dates.checkin, checkout: dates.checkout }),
    })
      .then((r) => r.json())
      .then((d: { prices?: Record<string, Price> }) => {
        if (on && d.prices) setPrices(d.prices);
      })
      .catch(() => {
        /* no prices → cards keep "See your price" → the property page */
      });
    return () => {
      on = false;
    };
  }, [idsKey, dates.checkin, dates.checkout]);

  return (
    <PriceCtx.Provider value={{ prices, checkin: dates.checkin, checkout: dates.checkout }}>{children}</PriceCtx.Provider>
  );
}
