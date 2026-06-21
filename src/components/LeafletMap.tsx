"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string; // e.g. price -> renders a pin; no label -> a dot
  id?: string;
  href?: string;
}

export default function LeafletMap({
  center,
  zoom = 13,
  markers = [],
  height = 300,
}: {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: number;
}) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: "100%" }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m, i) =>
        m.label ? (
          <Marker
            key={m.id ?? i}
            position={[m.lat, m.lng]}
            icon={L.divIcon({
              className: "tpc-pin",
              html: `<div style="background:#ff385c;color:#fff;font-weight:600;font-size:12px;padding:3px 8px;border-radius:8px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.35)">${m.label}</div>`,
              iconSize: [44, 22],
              iconAnchor: [22, 11],
            })}
            eventHandlers={m.href ? { click: () => { window.location.href = m.href!; } } : undefined}
          >
            {m.id ? <Tooltip>{m.label}</Tooltip> : null}
          </Marker>
        ) : (
          <CircleMarker
            key={m.id ?? i}
            center={[m.lat, m.lng]}
            radius={10}
            pathOptions={{ color: "#ff385c", fillColor: "#ff385c", fillOpacity: 0.85, weight: 2 }}
          />
        ),
      )}
    </MapContainer>
  );
}
