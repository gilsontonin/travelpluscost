"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "./LeafletMap";

// Leaflet needs the browser, so load it client-only.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="bg-zinc-100 animate-pulse rounded-lg" style={{ height: 300 }} />,
});

export default function MapView(props: {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: number;
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-black/10">
      <LeafletMap {...props} />
    </div>
  );
}
