import Link from "next/link";
import { getCityGuide, milesBetween, walkMinutes } from "@/lib/cityGuides";

type Props = {
  city: string | null | undefined;
  lat: number | null | undefined;
  lng: number | null | undefined;
  name: string;
  citySlug: string;
};

// Lean, per-hotel "area around this hotel" block. It shows the nearest attractions with REAL distances
// from this hotel (unique to every page) and links up to the full city guide. The rich city content
// lives ONCE on /hotels/<city> — this keeps hotel pages short and non-duplicative.
export default function HotelAreaSnippet({ city, lat, lng, name, citySlug }: Props) {
  const guide = getCityGuide(city);
  if (!guide) return null;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const nearest = guide.attractions
    .map((a) => ({ ...a, miles: milesBetween(lat, lng, a.lat, a.lng) }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, 5);
  if (!nearest.length) return null;
  const top3 = nearest.slice(0, 3);

  return (
    <section id="area" className="scroll-mt-32 mt-12 border-t border-black/[0.07] pt-8">
      <h2 className="text-xl font-semibold">The area around {name}</h2>
      <p className="mt-2 max-w-3xl text-black/70">
        The closest sights are{" "}
        {top3.map((a, i) => (
          <span key={a.name}>
            {i > 0 ? (i === top3.length - 1 ? ", and " : ", ") : ""}
            <span className="font-medium">{a.name}</span> ({a.miles.toFixed(1)} mi, {walkMinutes(a.miles)} min walk)
          </span>
        ))}
        .
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {nearest.map((a) => (
          <li key={a.name} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-black/75">
              {a.name} <span className="text-black/45">· {a.category}</span>
            </span>
            <span className="whitespace-nowrap text-xs font-medium text-accent">
              {a.miles.toFixed(1)} mi · {walkMinutes(a.miles)} min
            </span>
          </li>
        ))}
      </ul>
      <Link
        href={`/hotels/${citySlug}`}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/30 px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent-tint/40"
      >
        See the full {guide.city} guide for where to stay, attractions, and things to do
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
