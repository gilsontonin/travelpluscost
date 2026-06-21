import AmenityIcon from "@/components/AmenityIcon";
import { detectAmenities } from "@/lib/oahu";

// Expedia-style scannable strip of the top amenities, high on the property page.
export default function PopularAmenities({ facilities }: { facilities: string[] }) {
  const amenities = detectAmenities(facilities).slice(0, 8);
  if (!amenities.length) return null;
  return (
    <div className="mt-6 border-y border-black/[0.07] py-4">
      <h2 className="text-sm font-semibold mb-3">Popular amenities</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {amenities.map((a) => (
          <span key={a} className="inline-flex items-center gap-2 text-sm text-black/75">
            <AmenityIcon name={a} className="w-5 h-5 text-black/45" />
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}
