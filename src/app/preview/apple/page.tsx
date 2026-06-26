import Image from "next/image";
import Link from "next/link";
import { getAllHotels, toCard } from "@/lib/hotels";
import { REGIONS } from "@/lib/regions";

// Apple design trial — homepage. Full-bleed alternating tiles, one focus per viewport, the single
// Action Blue, SF Pro / Inter tight type. Real top-rated inventory; the live coral site is untouched.

export default function AppleHome() {
  const all = getAllHotels();
  const cards = all.map(toCard);
  const weighted = (c: (typeof cards)[number]) => {
    const v = c.reviewCount ?? 0;
    const R = c.rating ?? 0;
    return (v * R + 25 * 8) / (v + 25);
  };
  const topRated = [...cards].filter((c) => c.rating != null).sort((a, b) => weighted(b) - weighted(a));
  const hero = topRated[0];
  const second = topRated.find((c) => c.image && c.id !== hero?.id) ?? topRated[1];

  const destinations = REGIONS.map((r) => {
    const hs = all.filter((h) => h.island.toLowerCase() === r.name.toLowerCase());
    const top = [...hs].filter((h) => h.rating != null).sort((a, b) => (b.rating as number) - (a.rating as number))[0] ?? hs[0];
    return { region: r, image: top?.image ?? "", count: hs.length };
  }).filter((d) => d.count > 0 && d.image);

  return (
    <div>
      {/* ── Tile 1 · light hero ───────────────────────────────────────── */}
      <section className="bg-white px-6 py-24 text-center sm:py-28">
        <p className="text-[19px] font-semibold" style={{ color: "var(--ap-blue)" }}>
          travelpluscost
        </p>
        <h1 className="ap-display mx-auto mt-3 max-w-3xl text-[44px] sm:text-[56px]">
          One honest price.
          <br />
          The same for everyone.
        </h1>
        <p className="ap-tagline mx-auto mt-5 max-w-xl text-[21px] text-[#1d1d1f]/70 sm:text-[24px]">
          What the hotel charges us, plus one small flat fee. Search from any phone, any city, any day — the same
          number. Never based on your data.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/search?adults=2" className="ap-pill ap-pill-primary">
            Search hotels
          </Link>
          <Link href="/preview/apple/hub" className="ap-pill ap-pill-ghost">
            See where to stay
          </Link>
        </div>
      </section>

      {/* ── Tile 2 · dark — featured stay rests on the surface ─────────── */}
      {hero?.image ? (
        <section className="bg-[#272729] px-6 py-24 text-center text-white sm:py-28">
          <h2 className="ap-display mx-auto max-w-2xl text-[36px] sm:text-[44px]">
            The price you see is the price everyone sees.
          </h2>
          <p className="ap-tagline mx-auto mt-4 max-w-xl text-[19px] text-[#cccccc] sm:text-[21px]">
            Open it in another browser. Sign out. Try a different phone. It doesn&apos;t move.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/preview/apple/property" className="ap-pill ap-pill-primary">
              See a property
            </Link>
            <Link href="/preview/apple/hub" className="ap-pill ap-pill-ghost-dark">
              Explore stays
            </Link>
          </div>
          <div className="mx-auto mt-14 max-w-3xl">
            <div className="ap-shadow relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-[18px]">
              <Image src={hero.image} alt={hero.name} fill sizes="(max-width:768px) 90vw, 768px" className="object-cover" />
            </div>
            <p className="mt-4 text-[14px] text-[#cccccc]">
              {hero.name}
              {hero.rating ? ` · ${hero.rating.toFixed(1)} guest rating` : ""}
            </p>
          </div>
        </section>
      ) : null}

      {/* ── Tile 3 · light — the three guarantees ─────────────────────── */}
      <section className="bg-[#f5f5f7] px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-[980px]">
          <h2 className="ap-display text-center text-[36px] sm:text-[44px]">Pricing you can verify.</h2>
          <div className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-3">
            {[
              ["Same price for everyone", "One deterministic formula — cost times one fixed multiplier. No segments, no A/B tests."],
              ["Never based on your data", "Not your device, not your location, not your search history. The number is blind to you."],
              ["No fake discounts", "No struck-through phantom prices, no “1 left at this rate.” Just the all-in number, up front."],
            ].map(([title, body]) => (
              <div key={title}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: "var(--ap-blue)" }}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <h3 className="mt-4 text-[21px] font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-[17px] leading-relaxed text-[#1d1d1f]/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tile 4 · light — destinations ─────────────────────────────── */}
      {destinations.length ? (
        <section className="bg-white px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-[1024px]">
            <h2 className="ap-display text-center text-[36px] sm:text-[44px]">Where to?</h2>
            <p className="ap-tagline mx-auto mt-3 max-w-lg text-center text-[19px] text-[#1d1d1f]/65 sm:text-[21px]">
              The markets we cover today. More on the way.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map(({ region, image, count }) => (
                <Link key={region.slug} href="/preview/apple/hub" className="group relative block aspect-[4/3] overflow-hidden rounded-[18px]">
                  <Image src={image} alt={region.label} fill sizes="(max-width:1024px) 90vw, 340px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <span className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="block text-[24px] font-semibold tracking-tight">{region.label}</span>
                    <span className="mt-0.5 block text-[14px] text-white/85">{count} stays</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Tile 5 · dark — the model, in one line ────────────────────── */}
      <section className="bg-[#252527] px-6 py-24 text-center text-white sm:py-28">
        <h2 className="ap-display mx-auto max-w-2xl text-[36px] sm:text-[44px]">
          Cost, plus one flat fee.
          <br />
          That&apos;s the whole model.
        </h2>
        <p className="ap-tagline mx-auto mt-4 max-w-xl text-[19px] text-[#cccccc] sm:text-[21px]">
          We don&apos;t make more when you pay more. The subscription funds the company — so the fee can stay small,
          and the same, for everyone.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/about" className="ap-pill ap-pill-primary">
            How it works
          </Link>
          {second?.image ? (
            <Link href="/preview/apple/hub" className="ap-pill ap-pill-ghost-dark">
              Browse stays
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
