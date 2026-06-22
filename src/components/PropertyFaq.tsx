import type { OahuHotel } from "@/lib/oahu";
import { detectAmenities } from "@/lib/oahu";
import { regionForIsland } from "@/lib/regions";
import { haversineMiles, fmtMiles } from "@/lib/distance";
import { reviewLabel } from "@/lib/format";
import FaqList from "@/components/FaqList";

type QA = { q: string; a: string };

// The ~20 questions guests most commonly ask about a hotel (the universal, "one size fits all" set:
// check-in, WiFi, parking, breakfast, pool, spa, gym, dining, A/C, room service, accessibility, pets,
// family, smoking, airport/beach distance, cancellation, fees, services, rating, pricing). Each answer
// is derived from the hotel's real data — questions we can't answer from the data are skipped.
function buildFaqs(h: OahuHotel): QA[] {
  const am = detectAmenities(h.facilities);
  const has = (re: RegExp) => (h.facilities ?? []).some((f) => re.test(f));
  const roomHas = (re: RegExp) => (h.rooms ?? []).some((r) => (r.amenities ?? []).some((a) => re.test(a)));
  const n = h.name;
  const info = h.importantInfo ?? "";
  const faqs: QA[] = [];

  if (h.checkin || h.checkout)
    faqs.push({
      q: `What are the check-in and check-out times at ${n}?`,
      a: `Check-in starts at ${h.checkin ?? "the afternoon"} and check-out is by ${h.checkout ?? "midday"}.`,
    });
  if (has(/wi-?fi|internet/i) || am.includes("Free WiFi"))
    faqs.push({ q: `Does ${n} have WiFi?`, a: `WiFi is available at ${n}. Check your room's details for whether it's free or carries a charge.` });
  if (has(/parking/i) || am.includes("Parking"))
    faqs.push({
      q: `Is parking available at ${n}?`,
      a: `Yes, parking is available at ${n}${has(/valet/i) ? ", including valet" : ""}. A fee may apply — see the property's important information.`,
    });
  if (has(/breakfast/i))
    faqs.push({ q: `Does ${n} serve breakfast?`, a: `Yes, breakfast is available at ${n}. A fee may apply unless your rate includes it.` });
  if (has(/pool|swimming/i) || am.includes("Pool")) faqs.push({ q: `Does ${n} have a pool?`, a: `Yes — ${n} has a swimming pool.` });
  if (has(/spa|sauna|massage/i)) faqs.push({ q: `Does ${n} have a spa?`, a: `Yes, ${n} offers spa or wellness facilities.` });
  if (has(/fitness|gym/i)) faqs.push({ q: `Is there a gym at ${n}?`, a: `Yes, ${n} has fitness facilities.` });
  if (has(/restaurant|dining/i) || am.includes("Restaurant"))
    faqs.push({ q: `Does ${n} have a restaurant?`, a: `Yes, there is on-site dining at ${n}.${has(/\bbar\b|lounge/i) ? " There's also a bar or lounge." : ""}` });
  if (has(/air ?condition/i)) faqs.push({ q: `Do the rooms at ${n} have air conditioning?`, a: `Yes, rooms at ${n} have air conditioning.` });
  if (roomHas(/room service/i)) faqs.push({ q: `Does ${n} offer room service?`, a: `Yes, room service is available at ${n} (hours may be limited).` });
  if (has(/disab|wheelchair|accessible/i))
    faqs.push({ q: `Is ${n} wheelchair accessible?`, a: `${n} offers facilities for guests with disabilities. Contact the property to confirm the specifics for your needs.` });
  if (h.petsAllowed != null)
    faqs.push({ q: `Is ${n} pet-friendly?`, a: h.petsAllowed ? `Yes, pets are allowed at ${n}.` : `No, pets are not allowed at ${n}.` });
  if (has(/child|kid|family|playground/i) || h.childAllowed)
    faqs.push({ q: `Is ${n} family-friendly?`, a: `Yes, ${n} welcomes families${has(/playground|kid|child/i) ? " and offers family facilities" : ""}.` });
  if (has(/non-smoking throughout/i)) faqs.push({ q: `Is ${n} non-smoking?`, a: `Yes, ${n} is non-smoking throughout.` });

  if (h.lat != null && h.lng != null) {
    const landmarks = regionForIsland(h.island).landmarks;
    const air = landmarks.find((l) => l.airport);
    if (air)
      faqs.push({
        q: `How far is ${n} from ${air.name}?`,
        a: `It's about ${fmtMiles(haversineMiles(h.lat, h.lng, air.lat, air.lng))} (straight-line) from ${air.name}.`,
      });
    const beach = landmarks
      .filter((l) => l.name.includes("Beach"))
      .map((l) => ({ name: l.name, miles: haversineMiles(h.lat as number, h.lng as number, l.lat, l.lng) }))
      .sort((a, b) => a.miles - b.miles)[0];
    if (beach) faqs.push({ q: `What's the closest beach to ${n}?`, a: `The nearest is ${beach.name}, about ${fmtMiles(beach.miles)} away (straight-line).` });
  }

  faqs.push({
    q: `What is the cancellation policy at ${n}?`,
    a: `It depends on the rate you pick — many rooms at ${n} offer free cancellation. You'll see each room's exact policy before you book.`,
  });
  faqs.push({
    q: `Are there extra fees at ${n}?`,
    a: `${/resort fee/i.test(info) ? `${n} may charge a resort fee. ` : ""}Any mandatory property fees are shown in your all-in total before you book — no surprises at checkout.`,
  });
  const svc = [has(/concierge/i) && "concierge", has(/laundry|dry clean/i) && "laundry", has(/luggage/i) && "luggage storage"].filter(Boolean);
  if (svc.length) faqs.push({ q: `What guest services does ${n} offer?`, a: `${n} offers services such as ${svc.join(", ")}.` });

  const rev = reviewLabel(h.rating ?? undefined);
  if (rev && h.reviewCount)
    faqs.push({ q: `Is ${n} a good place to stay?`, a: `Guests rate it ${rev.score}/10 (${rev.label}) across ${h.reviewCount.toLocaleString()} reviews.` });
  faqs.push({
    q: `How does pricing work at ${n} on travelpluscost?`,
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
      <h2 className="text-xl font-semibold mb-4">Frequently asked questions about {hotel.name}</h2>
      <FaqList faqs={faqs} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </section>
  );
}
