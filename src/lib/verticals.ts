// The verticals the platform supports. Hotels is live; the rest are scaffolded behind the same
// engine (add a provider adapter + flip `enabled` to turn them on). See docs/FRAMEWORK.md.
export type Vertical = "hotels" | "flights" | "cars" | "things-to-do";

export interface VerticalConfig {
  id: Vertical;
  label: string;
  href: string;
  enabled: boolean;
  blurb: string;
}

export const VERTICALS: VerticalConfig[] = [
  {
    id: "hotels",
    label: "Hotels",
    href: "/search?destination=Oahu&adults=2",
    enabled: true,
    blurb: "",
  },
  {
    id: "flights",
    label: "Flights",
    href: "/flights",
    enabled: false,
    blurb: "Flights at our cost plus one small, flat service fee — never priced off your data.",
  },
  {
    id: "cars",
    label: "Cars",
    href: "/cars",
    enabled: false,
    blurb: "Car rentals with one flat, transparent fee — the same for everyone.",
  },
  {
    id: "things-to-do",
    label: "Things to do",
    href: "/things-to-do",
    enabled: false,
    blurb: "Tours, activities and experiences (Viator) — same honest pricing, no hidden markup.",
  },
];

export function getVertical(id: Vertical): VerticalConfig {
  return VERTICALS.find((v) => v.id === id) ?? VERTICALS[0];
}
