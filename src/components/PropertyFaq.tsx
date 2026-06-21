import type { OahuHotel } from "@/lib/oahu";
import { detectAmenities } from "@/lib/oahu";
import { regionForIsland } from "@/lib/regions";
import { haversineMiles, fmtMiles } from "@/lib/distance";
import { reviewLabel } from "@/lib/format";

type QA = { q: string; a: string };

// Auto-generate an FAQ from the data we actually have (no invented facts).
function buildFaqs(h: OahuHotel): QA[] {
  const am = detectAmenities(h.facilities);
  const faqs: QA[] = [];

  if (h.checkin || h.checkout) {
    faqs.push({
      q: `What are the check-in and check-out times at ${h.name}?`,
      a: `Check-in starts at ${h.checkin ?? "the afternoon"} and check-out is by ${h.checkout ?? "midday"}.`,
    });
  }
  if (am.includes("Pool")) {
    faqs.push({ q: `Does ${h.name} have a pool?`, a: `Yes — ${h.name} has a swimming pool.` });
  }
  if (am.includes("Free WiFi")) {
    faqs.push({ q: `Is there WiFi at ${h.name}?`, a: `Yes, WiFi is available at the property.` });
  }
  if (am.includes("Parking")) {
    faqs.push({ q: `Is parking available at ${h.name}?`, a: `Yes, parking is available at the property.` });
  }
  if (am.includes("Restaurant")) {
    faqs.push({ q: `Does ${h.name} have a restaurant?`, a: `Yes, there is on-site dining at ${h.name}.` });
  }
  if (h.petsAllowed != null) {
    faqs.push({
      q: `Is ${h.name} pet-friendly?`,
      a: h.petsAllowed ? `Yes, pets are allowed at ${h.name}.` : `No, pets are not allowed at ${h.name}.`,
    });
  }

  if (h.lat != null && h.lng != null) {
    const landmarks = regionForIsland(h.island).landmarks;
    const air = landmarks.find((l) => l.airport);
    if (air) {
      faqs.push({
        q: `How far is ${h.name} from ${air.name}?`,
        a: `It's about ${fmtMiles(haversineMiles(h.lat, h.lng, air.lat, air.lng))} (straight-line) from ${air.name}.`,
      });
    }
    const beach = landmarks
      .filter((l) => l.name.includes("Beach"))
      .map((l) => ({ name: l.name, miles: haversineMiles(h.lat as number, h.lng as number, l.lat, l.lng) }))
      .sort((a, b) => a.miles - b.miles)[0];
    if (beach) {
      faqs.push({
        q: `What's the closest beach to ${h.name}?`,
        a: `The nearest is ${beach.name}, about ${fmtMiles(beach.miles)} away (straight-line).`,
      });
    }
  }

  const rev = reviewLabel(h.rating ?? undefined);
  if (rev && h.reviewCount) {
    faqs.push({
      q: `Is ${h.name} a good place to stay?`,
      a: `Guests rate it ${rev.score}/10 (${rev.label}) across ${h.reviewCount.toLocaleString()} reviews.`,
    });
  }

  faqs.push({
    q: `How does pricing work at ${h.name} on travelpluscost?`,
    a: `One honest price: what the hotel charges us plus one small flat fee — the same for everyone, never based on your data. No hidden markup and no fake discounts.`,
  });

  return faqs;
}

export default function PropertyFaq({ hotel }: { hotel: OahuHotel }) {
  const faqs = buildFaqs(hotel);
  if (faqs.length < 2) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Frequently asked questions</h2>
      <div className="max-w-3xl border-y border-black/[0.08] divide-y divide-black/[0.08]">
        {faqs.map((f) => (
          <details key={f.q} className="group py-3.5">
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-medium text-sm [&::-webkit-details-marker]:hidden">
              {f.q}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 text-black/40 transition-transform group-open:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <p className="mt-2 text-sm text-black/65 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </section>
  );
}
