import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getHotelContent } from "@/lib/hotelContent";
import { hotelHref } from "@/lib/hotelUrl";

// Legacy /hotel/{id} permanently redirects (308) to the SEO URL /hotels/{city}/{name}-{id}.
// Kept so old links / indexed URLs never 404.
const getHotel = cache(getHotelContent);

export default async function LegacyHotelRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hotel = await getHotel(id);
  if (!hotel) notFound();
  permanentRedirect(hotelHref({ id, name: hotel.name, city: hotel.city }));
}
