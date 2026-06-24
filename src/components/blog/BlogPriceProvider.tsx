"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Price } from "@/lib/rates";

// One client-side batch fetch of live "from" SSP for every ::hotel card on the page, shared via context
// so each BlogHotelCard shows a price without firing its own request. Near-term default dates (a "from"),
// loaded after paint — the static blog can't fetch rates at build (no LiteAPI there).
const PriceCtx = createContext<Record<string, Price>>({});
export const useHotelPrice = (id: string): Price | undefined => useContext(PriceCtx)[id];

export default function BlogPriceProvider({ ids, children }: { ids: string[]; children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, Price>>({});
  const idsKey = [...new Set(ids)].sort().join(",");

  useEffect(() => {
    const list = idsKey ? idsKey.split(",") : [];
    if (!list.length) return;
    let on = true;
    fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelIds: list, adults: 2 }),
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
  }, [idsKey]);

  return <PriceCtx.Provider value={prices}>{children}</PriceCtx.Provider>;
}
