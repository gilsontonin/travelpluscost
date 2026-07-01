import { getCityGuide, milesBetween, walkMinutes, type GuideAttraction } from "@/lib/cityGuides";

// The FULL city guide — used on the city hub page (/hotels/<city>). Pass lat/lng/name only when you
// want per-origin distances (kept optional); the city page renders the plain, complete guide.
type Props = { city: string | null | undefined; lat?: number | null; lng?: number | null; name?: string };

// "Exploring <City>" — the evergreen city guide, rendered THROUGH this hotel's location so every
// page is unique: attractions are sorted by real distance from the hotel and labelled with it.
export default function CityGuide({ city, lat, lng, name }: Props) {
  const guide = getCityGuide(city);
  if (!guide) return null;

  const haveGeo = typeof lat === "number" && typeof lng === "number";
  const attractions: (GuideAttraction & { miles?: number })[] = haveGeo
    ? guide.attractions
        .map((a) => ({ ...a, miles: milesBetween(lat as number, lng as number, a.lat, a.lng) }))
        .sort((a, b) => (a.miles as number) - (b.miles as number))
    : guide.attractions;
  const nearest = attractions.slice(0, 3).filter((a) => a.miles != null);

  return (
    <section id="exploring" className="scroll-mt-32 mt-12 border-t border-black/[0.07] pt-10">
      <h2 className="text-xl font-semibold">Exploring {guide.city}</h2>
      <p className="mt-3 max-w-3xl text-black/70">{guide.overview}</p>

      {haveGeo && nearest.length ? (
        <p className="mt-4 rounded-xl bg-accent-tint/50 px-4 py-3 text-sm text-black/75">
          <span className="font-medium text-accent">From {name}, </span>
          the closest sights are{" "}
          {nearest.map((a, i) => (
            <span key={a.name}>
              {i > 0 ? (i === nearest.length - 1 ? ", and " : ", ") : ""}
              <span className="font-medium">{a.name}</span> ({a.miles!.toFixed(1)} mi, {walkMinutes(a.miles!)} min walk)
            </span>
          ))}
          .
        </p>
      ) : null}

      <h3 className="mt-8 font-semibold">Top attractions{haveGeo ? ", nearest first" : ""}</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {attractions.map((a) => (
          <div key={a.name} className="rounded-xl border border-black/[0.07] p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium">{a.name}</span>
              {a.miles != null ? (
                <span className="whitespace-nowrap text-xs font-medium text-accent">
                  {a.miles.toFixed(1)} mi · {walkMinutes(a.miles)} min walk
                </span>
              ) : null}
            </div>
            <div className="mt-0.5 text-xs text-black/50">
              {a.category} · {a.area}
            </div>
            <p className="mt-2 text-sm text-black/70">{a.blurb}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-10 font-semibold">Neighborhoods</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {guide.neighborhoods.map((n) => (
          <div key={n.name} className="rounded-xl border border-black/[0.07] p-4">
            <div className="font-medium">{n.name}</div>
            <p className="mt-1 text-sm text-black/70">{n.character}</p>
            <p className="mt-2 text-xs text-black/50">Best for {n.best_for.replace(/\.$/, "").toLowerCase()}.</p>
          </div>
        ))}
      </div>

      <h3 className="mt-10 font-semibold">Things to do</h3>
      <ul className="mt-3 space-y-2">
        {guide.things_to_do.map((t) => (
          <li key={t.title} className="text-sm text-black/70">
            <span className="font-medium text-black/80">{t.title}.</span> {t.blurb}
          </li>
        ))}
      </ul>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold">Getting around</h3>
          <p className="mt-2 text-sm text-black/70">{guide.getting_around}</p>
        </div>
        <div>
          <h3 className="font-semibold">When to visit</h3>
          <p className="mt-2 text-sm text-black/70">{guide.when_to_visit}</p>
        </div>
      </div>

      <h3 className="mt-10 font-semibold">Best areas to stay</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {guide.best_areas_to_stay.map((b) => (
          <p key={b.area} className="text-sm text-black/70">
            <span className="font-medium text-black/80">{b.area}:</span> {b.who_for}
          </p>
        ))}
      </div>
    </section>
  );
}
