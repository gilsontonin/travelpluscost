// cityGuides.ts — evergreen, grounded city-guide content for hotel pages.
// Facts sourced from OpenStreetMap + Wikipedia (free, storable, evergreen); prose composed in-house.
// Rendered as the "Exploring <City>" section; per-hotel distances are computed live from the
// hotel lat/lng to each attraction (Haversine). PILOT: file-based. SCALE: a Supabase `cities` table.

export type GuideAttraction = { name: string; category: string; area: string; blurb: string; lat: number; lng: number };
export type CityGuide = {
  city: string;
  overview: string;
  attractions: GuideAttraction[];
  neighborhoods: { name: string; character: string; best_for: string }[];
  things_to_do: { title: string; blurb: string }[];
  getting_around: string;
  best_areas_to_stay: { area: string; who_for: string }[];
  when_to_visit: string;
};

const GUIDES: Record<string, CityGuide> = {
  "new orleans": {
  "attractions": [
    {
      "name": "French Quarter",
      "category": "Historic district",
      "area": "French Quarter",
      "blurb": "This is the oldest neighborhood in the city, laid out around a central square after New Orleans was founded in 1718. Most of its surviving buildings date to the Spanish colonial period of the late 18th century and the first half of the 19th century.",
      "lat": 29.9594926,
      "lng": -90.0655403
    },
    {
      "name": "Jackson Square",
      "category": "Historic park",
      "area": "French Quarter",
      "blurb": "Once the Place d'Armes, this park was the site where Louisiana was transferred to the United States under the Louisiana Purchase in 1803. It was named a National Historic Landmark for its central role in the city's history.",
      "lat": 29.957475,
      "lng": -90.06295
    },
    {
      "name": "The Cabildo",
      "category": "Museum",
      "area": "French Quarter",
      "blurb": "This building beside Jackson Square once served as the seat of Spanish colonial city hall. It now forms part of the Louisiana State Museum and stands adjacent to St. Louis Cathedral.",
      "lat": 29.9576622,
      "lng": -90.0638894
    },
    {
      "name": "Bourbon Street",
      "category": "Historic street",
      "area": "French Quarter",
      "blurb": "This street runs twelve blocks through the heart of the French Quarter, from Canal Street to Esplanade Avenue. It is lined with bars and nightlife.",
      "lat": 29.9537913,
      "lng": -90.0699868
    },
    {
      "name": "Congo Square",
      "category": "Historic site",
      "area": "Treme",
      "blurb": "Set within Louis Armstrong Park just north of the French Quarter, this open square shaped the history of African American music, including jazz. Its name traces to the many Bakongo people whose culture took root here.",
      "lat": 29.9612536,
      "lng": -90.0686153
    },
    {
      "name": "Louis Armstrong Park",
      "category": "Park",
      "area": "Treme",
      "blurb": "This 32-acre park sits in the Treme neighborhood, just across Rampart Street from the French Quarter. It contains Congo Square and honors the New Orleans musician for whom it is named.",
      "lat": 29.9627362,
      "lng": -90.0688396
    },
    {
      "name": "New Orleans Jazz National Historical Park",
      "category": "National park",
      "area": "Treme",
      "blurb": "This national historical park in the Treme neighborhood was created to celebrate the origins and growth of jazz. It sits near the French Quarter where the music took form.",
      "lat": 29.9614693,
      "lng": -90.057711
    },
    {
      "name": "New Orleans Jazz Museum",
      "category": "Museum",
      "area": "French Quarter",
      "blurb": "This music museum is devoted to preserving the history of jazz. It occupies the Old U.S. Mint building on Esplanade Avenue at the edge of the French Quarter and is affiliated with the Louisiana State Museum.",
      "lat": 29.9614302,
      "lng": -90.0577754
    },
    {
      "name": "New Orleans Mint",
      "category": "Museum",
      "area": "French Quarter",
      "blurb": "This building served as a branch of the United States Mint during the 19th and early 20th centuries, striking gold and silver coins in nearly every American denomination. It stands at the edge of the French Quarter on Esplanade Avenue.",
      "lat": 29.9613899,
      "lng": -90.0578139
    },
    {
      "name": "Steamboat Natchez",
      "category": "Riverboat",
      "area": "French Quarter Riverfront",
      "blurb": "This steamboat carries a name borne by several vessels before it, each named for the city of Natchez or the Natchez people. The current boat has operated on the Mississippi River since 1975.",
      "lat": 29.9549273,
      "lng": -90.0623927
    },
    {
      "name": "Audubon Aquarium of the Americas",
      "category": "Aquarium",
      "area": "French Quarter Riverfront",
      "blurb": "This aquarium sits along the Mississippi River at the upper end of Woldenberg Park, near Canal Street. It is run by the Audubon Nature Institute and now shares its site with the Audubon Insectarium.",
      "lat": 29.9508952,
      "lng": -90.0632231
    },
    {
      "name": "Audubon Insectarium",
      "category": "Museum",
      "area": "French Quarter Riverfront",
      "blurb": "This insectarium and entomology museum moved from the U.S. Custom House to join the Audubon Aquarium site. It focuses on insects and the wider world of entomology.",
      "lat": 29.9513592,
      "lng": -90.0633176
    },
    {
      "name": "New Orleans Museum of Art",
      "category": "Art museum",
      "area": "City Park",
      "blurb": "Established in 1911, this is the oldest fine arts museum in the city. It stands within City Park near the meeting of Carrollton and Esplanade Avenues.",
      "lat": 29.9864532,
      "lng": -90.0933693
    },
    {
      "name": "City Park",
      "category": "Park",
      "area": "Mid-City",
      "blurb": "This public park covers roughly 1,300 acres, which makes it about half again as large as Central Park in New York. It ranks among the most visited urban parks in the United States.",
      "lat": 30.0009911,
      "lng": -90.0941958
    },
    {
      "name": "New Orleans Botanical Garden",
      "category": "Garden",
      "area": "City Park",
      "blurb": "Located within City Park, this was the first classical garden in New Orleans. It was funded through the Works Progress Administration.",
      "lat": 29.9875877,
      "lng": -90.0960857
    },
    {
      "name": "Ogden Museum of Southern Art",
      "category": "Art museum",
      "area": "Warehouse District",
      "blurb": "This museum is devoted to art by artists from the southern United States. It was established in 1999.",
      "lat": 29.9435723,
      "lng": -90.0713431
    }
  ],
  "neighborhoods": [
    {
      "name": "French Quarter",
      "character": "The oldest part of the city, laid out around Jackson Square in 1718 and lined with Spanish colonial and early 19th century buildings. Streets are walkable and dense with landmarks, museums, and riverfront paths.",
      "best_for": "First-time visitors who want history, dining, and nightlife within walking distance."
    },
    {
      "name": "Treme",
      "character": "A historic neighborhood just north of the French Quarter across Rampart Street, home to Congo Square and Louis Armstrong Park. It holds deep roots in African American music and culture.",
      "best_for": "Travelers drawn to jazz history and cultural sites."
    },
    {
      "name": "Central Business District and Warehouse District",
      "character": "The commercial core, home to Lafayette Square and a cluster of museums including the Ogden Museum of Southern Art. Streets are broad and lined with converted warehouses.",
      "best_for": "Visitors who want museums, galleries, and easy access to the convention center."
    },
    {
      "name": "Mid-City",
      "character": "A residential area built around City Park, with the New Orleans Museum of Art, the Botanical Garden, and open green space. It is reached by the Canal Street streetcar line.",
      "best_for": "Travelers who prefer parks, gardens, and a quieter base away from the crowds."
    },
    {
      "name": "French Quarter Riverfront",
      "character": "The stretch of the Mississippi River at the edge of the Quarter, taking in Woldenberg Park, the Audubon Aquarium, and steamboat docks. Paved paths follow the water.",
      "best_for": "Families and anyone who wants the aquarium, riverboat rides, and river views."
    }
  ],
  "things_to_do": [
    {
      "title": "Walk the French Quarter",
      "blurb": "Explore the oldest neighborhood in the city on foot. The compact grid takes in Jackson Square, the Cabildo, and streets of preserved colonial architecture."
    },
    {
      "title": "Trace the roots of jazz",
      "blurb": "Visit Congo Square, the New Orleans Jazz National Historical Park, and the New Orleans Jazz Museum to follow the music from its origins to the present."
    },
    {
      "title": "Spend a day at City Park",
      "blurb": "This 1,300-acre park holds the New Orleans Museum of Art and the Botanical Garden. There is room to walk, and cultural stops along the way."
    },
    {
      "title": "Ride the Mississippi River",
      "blurb": "Board the Steamboat Natchez, which has run on the river since 1975, for a view of the city from the water."
    },
    {
      "title": "Visit the riverfront attractions",
      "blurb": "The Audubon Aquarium and the Audubon Insectarium share a site along the river at the edge of the Quarter, an easy stop within Woldenberg Park."
    },
    {
      "title": "See Southern art",
      "blurb": "The Ogden Museum of Southern Art gathers work by artists from across the southern United States, a short walk from Lafayette Square."
    }
  ],
  "getting_around": "Most French Quarter landmarks sit within walking distance of one another, and the neighborhood grid is easy to cover on foot. Streetcar lines connect the Quarter and the Central Business District to Mid-City and City Park, including the Canal Street line that ends near the New Orleans Museum of Art. Riverfront paths link the aquarium, Woldenberg Park, and the steamboat docks. For sights farther out, such as Mardi Gras World along the river or the Chalmette Battlefield, a car or rideshare is the simpler choice.",
  "best_areas_to_stay": [
    {
      "area": "French Quarter",
      "who_for": "First-time visitors who want to walk to Jackson Square, Bourbon Street, museums, and the riverfront."
    },
    {
      "area": "Central Business District and Warehouse District",
      "who_for": "Travelers who want museums and galleries nearby, with easy reach to the convention center and streetcar lines."
    },
    {
      "area": "French Quarter Riverfront",
      "who_for": "Families who want the aquarium, riverboat rides, and river views close at hand."
    },
    {
      "area": "Mid-City",
      "who_for": "Visitors who prefer a quieter base near City Park, its museum, and its gardens."
    },
    {
      "area": "Treme",
      "who_for": "Guests focused on jazz history and cultural sites just north of the Quarter."
    }
  ],
  "when_to_visit": "New Orleans rewards visitors in the cooler, drier stretch of the year, when walking the French Quarter and City Park is most comfortable. Summers are hot and humid, so plan for shade, indoor museums, and river breezes. The city's festival calendar draws large crowds at peak times, which raises demand for rooms and fills the streets around the Quarter. For a calmer pace, choose a period away from the major festivals and expect easier access to the main sights.",
  "overview": "New Orleans grew up around the French Quarter, the oldest neighborhood in the city, founded in 1718 and built out under Spanish and later American rule. The Quarter still holds much of the city's history, from Jackson Square, where Louisiana passed to the United States in 1803, to the museums and colonial buildings that line its streets. Just beyond it, Treme carries the roots of jazz at Congo Square and Louis Armstrong Park, while the riverfront draws visitors to the aquarium and steamboat docks. Farther out, City Park spreads across 1,300 acres with the oldest fine arts museum in the city and a classical botanical garden. Most travelers base themselves in or near the Quarter, where the main landmarks sit within an easy walk of one another.",
  "city": "New Orleans"
},
};

export function getCityGuide(city: string | null | undefined): CityGuide | null {
  if (!city) return null;
  return GUIDES[city.trim().toLowerCase()] ?? null;
}

// straight-line miles between two coords (Haversine) — deterministic, no API, never hallucinated
export function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(lat2 - lat1), dLng = r(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function walkMinutes(miles: number): number {
  return Math.max(1, Math.round((miles / 3.1) * 60));
}
