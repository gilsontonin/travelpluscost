"use client";

import dynamic from "next/dynamic";
import type { CardHotel } from "@/lib/oahu";
import type { Price } from "@/lib/rates";

// Leaflet needs the browser — load the map experience client-only.
const Inner = dynamic(() => import("./MapResultsInner"), {
  ssr: false,
  loading: () => <div className="bg-zinc-100 animate-pulse rounded-lg h-[72vh] min-h-[460px]" />,
});

export default function MapResults(props: {
  hotels: CardHotel[];
  prices: Record<string, Price> | null;
  query?: string;
  onClose?: () => void;
}) {
  return <Inner {...props} />;
}
