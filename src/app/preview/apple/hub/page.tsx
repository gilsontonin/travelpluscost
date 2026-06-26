import Image from "next/image";
import Link from "next/link";
import { getAllHotels, toCard } from "@/lib/hotels";
import { REGIONS } from "@/lib/regions";

// Apple design trial — hub ("where to stay"). FULL LITERAL Apple: one hotel per full-bleed alternating
// tile, museum-gallery density. Real inventory (the curated Oahu market). Live coral site untouched.

const DARK = ["#272729", "#252527", "#2a2a2c"];

export default function AppleHub() {
  const all = getAllHotels();
  const region = REGIONS.find((r) => r.name.toLowerCase() === "oahu") ?? REGIONS[0];
  const inRegion = all.filter((h) => h.island.toLowerCase() === region.name.toLowerCase());
  const pool = (inRegion.length ? inRegion : all).map(toCard).filter((c) => c.image && c.rating != null);
  const weighted = (c: (typeof pool)[number]) => {
    const v = c.reviewCount ?? 0;
    const R = c.rating ?? 0;
    return (v * R + 25 * 8) / (v + 25);
  };
  const stays = [...pool].sort((a, b) => weighted(b) - weighted(a)).slice(0, 6);

  return (
    <div>
      {/* ── Hero tile ─────────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-24 text-center sm:py-28">
        <p className="text-[19px] font-semibold" style={{ color: "var(--ap-blue)" }}>
          {region.label}
        </p>
        <h1 className="ap-display mx-auto mt-3 max-w-3xl text-[44px] sm:text-[56px]">Where to stay.</h1>
        <p className="ap-tagline mx-auto mt-5 max-w-xl text-[21px] text-[#1d1d1f]/70 sm:text-[24px]">
          {stays.length} guest-loved stays, each at one honest price — the rate plus one small flat fee, the same for
          everyone.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href={`/search?destination=${encodeURIComponent(region.name)}&adults=2`} className="ap-pill ap-pill-primary">
            Search {region.label}
          </Link>
          <Link href="/preview/apple" className="ap-pill ap-pill-ghost">
            Back to overview
          </Link>
        </div>
      </section>

      {/* ── One hotel per full-bleed tile, alternating surface + side ─── */}
      {stays.map((h, i) => {
        const dark = i % 2 === 0;
        const bg = dark ? DARK[Math.floor(i / 2) % DARK.length] : i % 4 === 1 ? "#ffffff" : "#f5f5f7";
        const flip = i % 2 === 1;
        return (
          <section key={h.id} className="px-6 py-20 sm:py-24" style={{ backgroundColor: bg, color: dark ? "#fff" : "var(--ap-ink)" }}>
            <div className={`mx-auto flex max-w-[1024px] flex-col items-center gap-10 lg:gap-16 ${flip ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
              <div className="w-full lg:w-[55%]">
                <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-[18px] ${dark ? "ap-shadow" : ""}`}>
                  <Image src={h.image} alt={h.name} fill sizes="(max-width:1024px) 90vw, 560px" className="object-cover" />
                </div>
              </div>
              <div className="w-full lg:w-[45%]">
                <p className="text-[14px] font-semibold uppercase tracking-[0.04em]" style={{ color: dark ? "var(--ap-blue-dark)" : "var(--ap-blue)" }}>
                  {i === 0 ? "Top rated" : h.city || region.label}
                </p>
                <h2 className="ap-display mt-3 text-[32px] sm:text-[40px]">{h.name}</h2>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[17px]" style={{ color: dark ? "#cccccc" : "rgba(29,29,31,0.7)" }}>
                  {h.rating != null ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="rounded-full px-2.5 py-1 text-[14px] font-semibold" style={{ background: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }}>
                        {h.rating.toFixed(1)}
                      </span>
                      {h.reviewCount ? `${h.reviewCount.toLocaleString()} reviews` : "guest rating"}
                    </span>
                  ) : null}
                </div>
                {h.amenities?.length ? (
                  <p className="mt-4 text-[17px] leading-relaxed" style={{ color: dark ? "#cccccc" : "rgba(29,29,31,0.7)" }}>
                    {h.amenities.slice(0, 4).join(" · ")}
                  </p>
                ) : null}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link href="/preview/apple/property" className="ap-pill ap-pill-primary">
                    View stay
                  </Link>
                  <Link href={`/search?destination=${encodeURIComponent(region.name)}&adults=2`} className={`ap-pill ${dark ? "ap-pill-ghost-dark" : "ap-pill-ghost"}`}>
                    See prices
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Closing tile ──────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-24 text-center sm:py-28">
        <h2 className="ap-display mx-auto max-w-2xl text-[34px] sm:text-[40px]">Same price for everyone. Always.</h2>
        <p className="ap-tagline mx-auto mt-4 max-w-lg text-[19px] text-[#1d1d1f]/65 sm:text-[21px]">
          No surveillance pricing. No fake scarcity. Just the all-in number, up front.
        </p>
        <div className="mt-7 flex justify-center">
          <Link href={`/search?destination=${encodeURIComponent(region.name)}&adults=2`} className="ap-pill ap-pill-primary">
            Search all {region.label} stays
          </Link>
        </div>
      </section>
    </div>
  );
}
