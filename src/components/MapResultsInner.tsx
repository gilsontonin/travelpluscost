"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L, { type LatLngBounds } from "leaflet";
import HotelRow from "@/components/HotelRow";
import type { CardHotel } from "@/lib/oahu";
import type { Price } from "@/lib/rates";

const OAHU_CENTER: [number, number] = [21.34, -157.9];

function priceIcon(label: string, active: boolean) {
  const bg = active ? "#ff385c" : "#ffffff";
  const fg = active ? "#ffffff" : "#1a1a1a";
  const border = active ? "#ff385c" : "rgba(0,0,0,0.18)";
  return L.divIcon({
    className: "tpc-price-pin",
    html: `<div style="background:${bg};color:${fg};border:1px solid ${border};font-weight:700;font-size:12px;line-height:1;padding:5px 9px;border-radius:14px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.28);transform:scale(${active ? 1.14 : 1});transition:transform .15s">${label}</div>`,
    iconSize: [52, 24],
    iconAnchor: [26, 12],
  });
}

// Controls the map: fly to the selected hotel (offset up so its pin clears the bottom
// card) and surface "Search this area" only on genuine user pan/zoom.
function MapBrain({
  hotels,
  selectedId,
  onUserMove,
  registerSearch,
}: {
  hotels: CardHotel[];
  selectedId: string | null;
  onUserMove: () => void;
  registerSearch: (fn: () => LatLngBounds) => void;
}) {
  const map = useMap();
  const programmatic = useRef(false);

  useEffect(() => {
    registerSearch(() => map.getBounds());
  }, [map, registerSearch]);

  useEffect(() => {
    const h = hotels.find((x) => x.id === selectedId);
    if (!h || h.lat == null || h.lng == null) return;
    const zoom = map.getZoom();
    // Center BELOW the pin so the pin sits in the upper area, clear of the bottom card.
    const pt = map.project([h.lat, h.lng], zoom).add([0, 120]);
    programmatic.current = true;
    map.flyTo(map.unproject(pt, zoom), zoom, { duration: 0.4 });
  }, [selectedId, hotels, map]);

  useMapEvents({
    moveend: () => {
      programmatic.current = false;
    },
    dragend: () => {
      if (!programmatic.current) onUserMove();
    },
    zoomend: () => {
      if (!programmatic.current) onUserMove();
    },
  });
  return null;
}

export default function MapResultsInner({
  hotels,
  prices,
  query,
}: {
  hotels: CardHotel[];
  prices: Record<string, Price> | null;
  query?: string;
}) {
  const geo = useMemo(() => hotels.filter((h) => h.lat != null && h.lng != null), [hotels]);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const shown = useMemo(
    () => (bounds ? geo.filter((h) => bounds.contains([h.lat as number, h.lng as number])) : geo),
    [geo, bounds],
  );

  const [selectedId, setSelectedId] = useState<string | null>(geo[0]?.id ?? null);
  // Effective selection — always within the shown set (falls back to first), so we
  // never need a corrective setState when bounds filtering removes the selected hotel.
  const current = shown.some((h) => h.id === selectedId) ? selectedId : shown[0]?.id ?? null;
  const [showSearch, setShowSearch] = useState(false);
  const getBoundsRef = useRef<(() => LatLngBounds) | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<string | null>(current);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    selectedRef.current = current;
  }, [current]);

  const registerSearch = useCallback((fn: () => LatLngBounds) => {
    getBoundsRef.current = fn;
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (!geo.length) return OAHU_CENTER;
    return [
      geo.reduce((s, h) => s + (h.lat as number), 0) / geo.length,
      geo.reduce((s, h) => s + (h.lng as number), 0) / geo.length,
    ];
  }, [geo]);

  // carousel swipe → selection
  const onCarouselScroll = () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = carouselRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      const h = shown[idx];
      if (h && h.id !== selectedRef.current) setSelectedId(h.id);
    }, 110);
  };

  // selection → scroll carousel to that card (pin taps + bounds changes)
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = shown.findIndex((h) => h.id === current);
    if (idx < 0) return;
    const target = idx * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) > 8) el.scrollTo({ left: target, behavior: "smooth" });
  }, [current, shown]);

  const searchThisArea = () => {
    const b = getBoundsRef.current?.();
    if (b) {
      setBounds(b);
      setShowSearch(false);
    }
  };

  if (!geo.length) {
    return (
      <div className="h-[60vh] min-h-[400px] rounded-lg border border-black/10 grid place-items-center text-black/50">
        No mappable stays.
      </div>
    );
  }

  return (
    <div className="relative h-[72vh] min-h-[460px] rounded-lg overflow-hidden border border-black/10">
      <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          detectRetina
        />
        <MapBrain
          hotels={shown}
          selectedId={current}
          onUserMove={() => setShowSearch(true)}
          registerSearch={registerSearch}
        />
        {shown.map((h) => {
          const p = prices?.[h.id];
          const active = h.id === current;
          return (
            <Marker
              key={h.id}
              position={[h.lat as number, h.lng as number]}
              icon={priceIcon(p ? `$${p.perNight}` : "•", active)}
              zIndexOffset={active ? 1000 : 0}
              eventHandlers={{ click: () => setSelectedId(h.id) }}
            />
          );
        })}
      </MapContainer>

      {showSearch ? (
        <button
          onClick={searchThisArea}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white text-accent font-semibold text-sm px-4 py-2 rounded-full shadow-lg border border-black/10 hover:bg-paper"
        >
          Search this area
        </button>
      ) : null}

      {bounds ? (
        <button
          onClick={() => {
            setBounds(null);
            setShowSearch(false);
          }}
          className="absolute top-3 right-3 z-[1000] bg-white text-black/70 text-xs font-medium px-3 py-1.5 rounded-full shadow border border-black/10"
        >
          Show all
        </button>
      ) : null}

      {/* swipeable bottom card carousel (synced with the pins) */}
      <div
        ref={carouselRef}
        onScroll={onCarouselScroll}
        className="absolute bottom-0 inset-x-0 z-[1000] flex overflow-x-auto snap-x snap-mandatory pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {shown.map((h) => (
          <div key={h.id} className="w-full shrink-0 snap-start px-3">
            <HotelRow hotel={h} query={query} price={prices?.[h.id] ?? null} loading={prices === null} />
          </div>
        ))}
      </div>
    </div>
  );
}
