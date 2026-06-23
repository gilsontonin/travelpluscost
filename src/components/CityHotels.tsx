import HotelRail from "@/components/HotelRail";
import { hotelsByCity } from "@/lib/directory";

// Bottom-of-page "More hotels in {city}" rail — other properties in the same city, with a See-all
// link into the city search. Server-fetched + cached with the page (ISR).
export default async function CityHotels({
  city,
  state,
  excludeId,
}: {
  city: string;
  state?: string | null;
  excludeId: string;
}) {
  if (!city) return null;
  let rows: Awaited<ReturnType<typeof hotelsByCity>> = [];
  try {
    rows = await hotelsByCity(city, "us", 14, state ?? undefined);
  } catch {
    return null;
  }
  const hotels = rows
    .filter((h) => h.id !== excludeId && h.thumbnail)
    .slice(0, 12)
    .map((h) => ({
      id: h.id,
      name: h.name,
      image: h.thumbnail ?? "",
      city: h.city ?? city,
      rating: h.rating,
      reviewCount: h.review_count,
      propertyType: "",
    }));
  if (hotels.length < 3) return null;

  return (
    <HotelRail
      title={`More hotels in ${city}`}
      hotels={hotels}
      seeAllHref={`/search?destination=${encodeURIComponent(city)}&adults=2`}
    />
  );
}
