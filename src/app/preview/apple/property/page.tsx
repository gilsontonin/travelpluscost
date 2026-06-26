import Image from "next/image";
import Link from "next/link";
import { getAllHotels } from "@/lib/hotels";

// Apple design trial — property page. Reverent full-bleed photography, tight display type, the single
// Action Blue, the one product-shadow on the gallery strip. Real hotel data. Live coral site untouched.

export default function AppleProperty() {
  const all = getAllHotels();
  // A representative, well-reviewed curated hotel with real photos + facilities + sentiment.
  const hotel =
    all
      .filter((h) => h.island.toLowerCase() === "oahu" && (h.images?.length ?? 0) >= 4 && h.facilities.length && h.rating != null)
      .sort((a, b) => (b.rating as number) - (a.rating as number))[0] ?? all.find((h) => (h.images?.length ?? 0) >= 4) ?? all[0];

  const heroImg = hotel.images?.[0] ?? hotel.image;
  const strip = (hotel.images ?? []).slice(1, 5);
  const loc = [hotel.address, hotel.city].filter(Boolean).join(", ");
  const pros = hotel.sentiment?.pros ?? [];
  const facilities = hotel.facilities.slice(0, 12);

  return (
    <div>
      {/* ── Full-bleed gallery hero ───────────────────────────────────── */}
      <section className="relative bg-black">
        <div className="relative h-[64vh] min-h-[420px] w-full">
          {heroImg ? <Image src={heroImg} alt={hotel.name} fill priority sizes="100vw" className="object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
          {/* back chip */}
          <Link href="/preview/apple/hub" className="ap-chip absolute left-5 top-5 inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Stays
          </Link>
          {hotel.images?.length ? (
            <span className="ap-chip absolute bottom-5 right-5 rounded-full px-3.5 py-1.5 text-[13px] font-medium">
              1 / {hotel.images.length}
            </span>
          ) : null}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-10">
            <div className="mx-auto max-w-[1024px] text-white">
              {hotel.stars ? (
                <span className="inline-flex items-center gap-0.5" aria-label={`${hotel.stars} stars`} style={{ color: "var(--ap-blue-dark)" }}>
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01Z" />
                    </svg>
                  ))}
                </span>
              ) : null}
              <h1 className="ap-display mt-2 max-w-3xl text-[36px] sm:text-[48px]">{hotel.name}</h1>
              {loc ? <p className="mt-2 text-[17px] text-white/85">{loc}</p> : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── Rating + CTA bar ──────────────────────────────────────────── */}
      <section className="bg-white px-6 py-10">
        <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            {hotel.rating != null ? (
              <span className="rounded-full px-3 py-1.5 text-[15px] font-semibold text-white" style={{ background: "var(--ap-blue)" }}>
                {hotel.rating.toFixed(1)}
              </span>
            ) : null}
            <span className="text-[17px] text-[#1d1d1f]/70">
              {hotel.rating != null ? "Exceptional" : "Guest-loved"}
              {hotel.reviewCount ? ` · ${hotel.reviewCount.toLocaleString()} reviews` : ""}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#rooms" className="ap-pill ap-pill-primary">
              Check availability
            </Link>
            <Link href="#price" className="ap-pill ap-pill-ghost">
              Our pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Photo strip (the one product-shadow) ──────────────────────── */}
      {strip.length ? (
        <section className="bg-[#f5f5f7] px-6 py-16">
          <div className="mx-auto grid max-w-[1024px] grid-cols-2 gap-5 sm:grid-cols-4">
            {strip.map((src, i) => (
              <div key={i} className="ap-shadow relative aspect-square overflow-hidden rounded-[18px]">
                <Image src={src} alt={`${hotel.name} photo ${i + 2}`} fill sizes="(max-width:640px) 45vw, 230px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── About (light) ─────────────────────────────────────────────── */}
      {hotel.description ? (
        <section className="bg-white px-6 py-24">
          <div className="mx-auto max-w-[820px]">
            <h2 className="ap-display text-[32px] sm:text-[40px]">About {hotel.name}.</h2>
            <p className="mt-6 text-[19px] leading-[1.5] text-[#1d1d1f]/80">{hotel.description}</p>
          </div>
        </section>
      ) : null}

      {/* ── Amenities (dark) ──────────────────────────────────────────── */}
      {facilities.length ? (
        <section className="bg-[#272729] px-6 py-24 text-white">
          <div className="mx-auto max-w-[1024px]">
            <h2 className="ap-display text-[32px] sm:text-[40px]">Everything here.</h2>
            <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((f) => (
                <div key={f} className="flex items-start gap-3 border-t border-white/10 pt-5 text-[17px]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mt-0.5 shrink-0" style={{ color: "var(--ap-blue-dark)" }}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="text-[#e8e8ea]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Honest price (parchment) — the signature brand tile ───────── */}
      <section id="price" className="scroll-mt-24 bg-[#f5f5f7] px-6 py-28 text-center">
        <h2 className="ap-display mx-auto max-w-2xl text-[36px] sm:text-[44px]">One honest price.</h2>
        <p className="ap-tagline mx-auto mt-5 max-w-xl text-[21px] text-[#1d1d1f]/70 sm:text-[24px]">
          What the hotel charges us, plus one small flat fee — the same for everyone, never based on your data. The
          all-in number is shown up front, with nothing waiting on the last screen.
        </p>
        <div id="rooms" className="scroll-mt-24 mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/search?adults=2" className="ap-pill ap-pill-primary">
            Choose a room
          </Link>
          <Link href="/preview/apple/hub" className="ap-pill ap-pill-ghost">
            Compare nearby stays
          </Link>
        </div>
      </section>

      {/* ── What guests loved (dark) ──────────────────────────────────── */}
      {pros.length ? (
        <section className="bg-[#252527] px-6 py-24 text-white">
          <div className="mx-auto max-w-[1024px]">
            <h2 className="ap-display text-[32px] sm:text-[40px]">What guests loved.</h2>
            <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {pros.slice(0, 6).map((p, i) => (
                <blockquote key={i} className="text-[21px] font-semibold leading-snug tracking-tight text-[#f5f5f7]">
                  <span style={{ color: "var(--ap-blue-dark)" }}>“</span>
                  {p}
                  <span style={{ color: "var(--ap-blue-dark)" }}>”</span>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
