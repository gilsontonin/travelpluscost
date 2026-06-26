// Native infographic registry — crawlable, fast, no images. A post embeds one with a line:
//   ::infographic <key>
// Keep one entity-rich prose sentence beside each in the body (the SEO scorer can't read these blocks).
// Seeded with brand infographics; add more as posts need them.

export type Infographic =
  | { kind: "stat"; title?: string; stats: { value: string; label: string }[] }
  | {
      kind: "compare";
      title?: string;
      left: string;
      right: string;
      rows: { label: string; left: string; right: string }[];
    }
  | { kind: "steps"; title?: string; steps: { title: string; detail: string }[] }
  | { kind: "callout"; title: string; body: string };

export const INFOGRAPHICS: Record<string, Infographic> = {
  "honest-vs-surveillance": {
    kind: "compare",
    title: "Two ways to price a hotel room",
    left: "Surveillance pricing",
    right: "travelpluscost",
    rows: [
      { label: "What sets the price", left: "Your device, location & history", right: "The hotel's cost + one flat fee" },
      { label: "Same for everyone?", left: "No — it varies per person", right: "Yes — identical every search" },
      { label: "Can you verify it?", left: "No", right: "Yes — open it in another browser" },
      { label: "Hidden fees at checkout?", left: "Often", right: "No — the all-in price up front" },
    ],
  },
  "maui-west-vs-south": {
    kind: "compare",
    title: "West Maui or South Maui?",
    left: "West Maui — Kāʻanapali & Kapalua",
    right: "South Maui — Wailea & Kihei",
    rows: [
      { label: "The vibe", left: "Lively resort strip, beach bars, sunsets", right: "Sunny, dry, calmer and spread out" },
      { label: "Best for", left: "First-timers, families, walkable beach days", right: "Sun-seekers, couples, snorkeling trips" },
      { label: "Price", left: "Mid to high — Kapalua is the priciest", right: "Kihei affordable, Wailea luxury" },
      { label: "The catch", left: "Winter rates climb; book early", right: "Wailea runs expensive; Kihei is busier" },
    ],
  },
  "how-pricing-works": {
    kind: "steps",
    title: "How your price is built",
    steps: [
      { title: "The hotel's rate", detail: "What the hotel charges us for the room." },
      { title: "One small flat fee", detail: "The same fee for everyone — never set from your data." },
      { title: "The price you see", detail: "All-in and shown up front. No surprises at the last screen." },
    ],
  },
  "keywest-by-numbers": {
    kind: "stat",
    title: "Key West by the numbers",
    stats: [
      { value: "~165 mi", label: "Miami to Key West by car, all on US-1" },
      { value: "42", label: "bridges link the island chain to the mainland" },
      { value: "90 mi", label: "from the Southernmost Point to Cuba" },
      { value: "~4 sq mi", label: "of walkable island — you rarely need a car" },
    ],
  },
  "keywest-oldtown-vs-newtown": {
    kind: "compare",
    title: "Old Town or New Town?",
    left: "Old Town",
    right: "New Town & the beaches",
    rows: [
      { label: "The vibe", left: "Historic inns, gas lamps, Duval, walk everywhere", right: "Bigger hotels, pools, Smathers Beach, parking" },
      { label: "Best for", left: "First-timers, couples, no-car trips", right: "Beach days, families, a lower nightly rate" },
      { label: "To Duval Street", left: "You're on it, or a few blocks off", right: "A 10-minute bike, bus, or scooter" },
      { label: "You wake up to", left: "A tin-roof porch and a loud rooster", right: "A bigger room and a pool deck" },
    ],
  },
  "keywest-getting-there": {
    kind: "steps",
    title: "Getting to Key West",
    steps: [
      { title: "Fly", detail: "Key West International (EYW) sits about 10 minutes from Old Town; most flights connect through Miami or Fort Lauderdale." },
      { title: "Drive", detail: "US-1 from Miami runs ~165 miles and 3.5–4 hours over 42 bridges — the Overseas Highway, one of the great American road trips." },
      { title: "Then skip the car", detail: "Old Town crosses end to end in a 20-minute walk. Bikes and scooters cover the rest, and parking is the island's real headache." },
    ],
  },
  "santabarbara-by-numbers": {
    kind: "stat",
    title: "Santa Barbara by the numbers",
    stats: [
      { value: "~95 mi", label: "up US-101 from Los Angeles, about 2 hours" },
      { value: "1925", label: "earthquake that set the red-tile Spanish look" },
      { value: "1872", label: "Stearns Wharf — California's oldest working wharf" },
      { value: "~45 min", label: "north to Santa Ynez wine country" },
    ],
  },
  "santabarbara-waterfront-vs-downtown": {
    kind: "compare",
    title: "The Waterfront or Downtown?",
    left: "The Waterfront",
    right: "Downtown / State Street",
    rows: [
      { label: "The vibe", left: "Beach inns, the harbor, Stearns Wharf, bike paths", right: "Spanish plazas, shops, restaurants, wine-tasting" },
      { label: "Best for", left: "Beach days, families, sunset walks", right: "Walkers, foodies, no-car trips" },
      { label: "To the sand", left: "You're on it", right: "A 10–15 minute walk or a quick bus" },
      { label: "You wake up to", left: "Palms and the Pacific", right: "Red-tile roofs and the mountains" },
    ],
  },
  "santabarbara-getting-there": {
    kind: "steps",
    title: "Getting to Santa Barbara",
    steps: [
      { title: "Drive", detail: "US-101 from Los Angeles is ~95 miles and about 2 hours up the coast; from San Francisco it's ~5–6 hours down." },
      { title: "Take the train", detail: "Amtrak's Pacific Surfliner drops you right downtown — one of the prettiest coastal rail rides in the country, and no parking to hunt for." },
      { title: "Fly", detail: "Santa Barbara Airport (SBA) sits in Goleta, about 15 minutes from downtown, with regional connections." },
    ],
  },
  "flagstaff-by-numbers": {
    kind: "stat",
    title: "Flagstaff by the numbers",
    stats: [
      { value: "~7,000 ft", label: "elevation — cool pines and real winters" },
      { value: "~80 mi", label: "north to the Grand Canyon's South Rim" },
      { value: "~45 min", label: "south to Sedona's red rocks" },
      { value: "Route 66", label: "the Mother Road runs through downtown" },
    ],
  },
  "flagstaff-vs-sedona": {
    kind: "compare",
    title: "Base in Flagstaff or Sedona?",
    left: "Base in Flagstaff",
    right: "Base in Sedona",
    rows: [
      { label: "The vibe", left: "Pine forest, Route 66, a college town, real snow", right: "Red rocks, resorts, spas, desert warmth" },
      { label: "Best for", left: "Grand Canyon trips, budgets, winter", right: "Hiking the rocks, couples, a splurge" },
      { label: "Nightly rate", left: "Lower — motels and chains", right: "Higher — it's a resort town" },
      { label: "To the Grand Canyon", left: "~1.5 hours north", right: "~2.5 hours" },
    ],
  },
  "flagstaff-basecamp": {
    kind: "steps",
    title: "Flagstaff as a basecamp",
    steps: [
      { title: "The Grand Canyon", detail: "The South Rim is ~80 miles north, about 1.5 hours — Flagstaff is the affordable place to sleep before a Canyon day." },
      { title: "Sedona", detail: "~45 minutes south down Oak Creek Canyon, one of Arizona's prettiest drives." },
      { title: "Snow and the Peaks", detail: "Arizona Snowbowl's slopes sit ~14 miles north; in summer the same lift runs for high-country views." },
    ],
  },
  "tucson-by-numbers": {
    kind: "stat",
    title: "Tucson by the numbers",
    stats: [
      { value: "~110 mi", label: "south of Phoenix on I-10, about 2 hours" },
      { value: "2 districts", label: "of Saguaro National Park flank the city" },
      { value: "9,157 ft", label: "atop Mount Lemmon — ski runs above the desert" },
      { value: "2015", label: "named the first UNESCO City of Gastronomy in the US" },
    ],
  },
  "tucson-downtown-vs-foothills": {
    kind: "compare",
    title: "Downtown or the Catalina Foothills?",
    left: "Downtown & 4th Ave",
    right: "The Catalina Foothills",
    rows: [
      { label: "The vibe", left: "Historic, walkable, arts, breweries, the streetcar", right: "Desert resorts, mountain views, pools, quiet" },
      { label: "Best for", left: "Walkers, foodies, no-car trips", right: "Resort days, golf, Sabino Canyon hikes" },
      { label: "Nightly rate", left: "Mid — boutique and chains", right: "Higher — it's resort country" },
      { label: "You wake up to", left: "Brick storefronts and a mural", right: "Saguaros and the Santa Catalinas" },
    ],
  },
  "tucson-when-to-go": {
    kind: "steps",
    title: "When to go to Tucson",
    steps: [
      { title: "Fly or drive in", detail: "Tucson International (TUS) sits ~15 minutes south of downtown; or drive ~2 hours down I-10 from Phoenix." },
      { title: "Come October–April", detail: "Warm days, cool nights and snowbird season — the resorts fill and rates climb, but the desert is at its best." },
      { title: "Brave summer for a deal", detail: "June–September runs 100°F+, but rates crater and the top of Mount Lemmon stays ~20°F cooler." },
    ],
  },
  "galveston-by-numbers": {
    kind: "stat",
    title: "Galveston by the numbers",
    stats: [
      { value: "~50 mi", label: "southeast of Houston, about an hour down I-45" },
      { value: "10 mi", label: "of Seawall — one of the longest sidewalks in the US" },
      { value: "4th", label: "busiest cruise port in the United States" },
      { value: "1900", label: "the hurricane that built the Seawall and raised the city" },
    ],
  },
  "galveston-seawall-vs-strand": {
    kind: "compare",
    title: "The Seawall or the Strand?",
    left: "The Seawall",
    right: "The Strand & Downtown",
    rows: [
      { label: "The vibe", left: "Beachfront hotels, Pleasure Pier, the Gulf", right: "Victorian district, the harbor, the cruise port" },
      { label: "Best for", left: "Beach days, families, sunsets", right: "History, walking, cruisers" },
      { label: "To the sand", left: "You're on it", right: "A 10-minute drive or the trolley" },
      { label: "You wake up to", left: "Surf and the Seawall", right: "Iron-front buildings and ships" },
    ],
  },
  "galveston-getting-there": {
    kind: "steps",
    title: "Getting to Galveston",
    steps: [
      { title: "Drive from Houston", detail: "Galveston is ~50 miles southeast of Houston, about an hour down I-45 — the island has no major airport, so most visitors fly into Houston (Hobby or Bush) and drive." },
      { title: "Sailing out?", detail: "The cruise terminal sits downtown by the Strand; many cruisers book a nearby hotel with a park-and-cruise package." },
      { title: "Get around", detail: "A car helps, but the Seawall, the Strand and Pleasure Pier are each walkable, with a historic trolley linking downtown." },
    ],
  },
  "albuquerque-by-numbers": {
    kind: "stat",
    title: "Albuquerque by the numbers",
    stats: [
      { value: "~5,300 ft", label: "high-desert elevation — a mile up, and then some" },
      { value: "~1 hr", label: "south of Santa Fe up I-25" },
      { value: "500+", label: "balloons at October's Fiesta, the world's largest" },
      { value: "Route 66", label: "runs straight down Central Avenue" },
    ],
  },
  "albuquerque-oldtown-vs-uptown": {
    kind: "compare",
    title: "Old Town or Uptown?",
    left: "Old Town & Downtown",
    right: "Uptown & the Heights",
    rows: [
      { label: "The vibe", left: "Historic adobe plaza, museums, Route 66", right: "Malls, reliable chains, near the Sandias" },
      { label: "Best for", left: "First-timers, history, walkers", right: "Shopping, the tram, a quieter base" },
      { label: "Nightly rate", left: "Mid — boutique and Heritage hotels", right: "Lower — dependable chains" },
      { label: "You wake up to", left: "Adobe walls and the old plaza", right: "The Sandias turning watermelon-pink" },
    ],
  },
  "albuquerque-getting-there": {
    kind: "steps",
    title: "Getting to Albuquerque",
    steps: [
      { title: "Fly in", detail: "The Albuquerque Sunport (ABQ) sits about 10 minutes from downtown — small, easy and central to the whole city." },
      { title: "Day-trip Santa Fe", detail: "Santa Fe is ~60 miles and an hour north up I-25, or a scenic ride on the Rail Runner train; many split a New Mexico trip between the two." },
      { title: "Ride the tram, pack layers", detail: "The Sandia Peak Tramway climbs above 10,000 feet for the view, and the city itself sits a mile high, so evenings cool off fast." },
    ],
  },
  "sedona-uptown-vs-village": {
    kind: "compare",
    title: "Uptown or the Village of Oak Creek?",
    left: "Uptown Sedona",
    right: "Village of Oak Creek",
    rows: [
      { label: "The feel", left: "Walkable, lively, central", right: "Quieter, spread out, residential" },
      { label: "Best for", left: "First-timers, no car", right: "Couples, golfers, budgets" },
      { label: "Price", left: "The priciest in town", right: "Better value for the same red rocks" },
      { label: "To the shops", left: "On foot", right: "About a 15-minute drive" },
    ],
  },
  "asheville-by-numbers": {
    kind: "stat",
    title: "Asheville, NC by the numbers",
    stats: [
      { value: "~2 hr", label: "drive west of Charlotte (CLT)" },
      { value: "AVL", label: "airport ~15 min south of downtown" },
      { value: "30+", label: "breweries in town (\"Beer City\")" },
      { value: "8,000", label: "acres at the Biltmore Estate" },
    ],
  },
  "sedona-by-numbers": {
    kind: "stat",
    title: "Sedona, Arizona by the numbers",
    stats: [
      { value: "~4,350 ft", label: "high-desert elevation" },
      { value: "~2 hr", label: "north of Phoenix Sky Harbor (PHX)" },
      { value: "~2 hr", label: "to the Grand Canyon's South Rim" },
      { value: "4", label: "areas to base in — all with red-rock views" },
    ],
  },
  "bend-by-numbers": {
    kind: "stat",
    title: "Bend, Oregon by the numbers",
    stats: [
      { value: "~3,623 ft", label: "high-desert elevation" },
      { value: "~300", label: "sunny days a year" },
      { value: "20+", label: "breweries on the Bend Ale Trail" },
      { value: "~3.5 hr", label: "drive from Portland (RDM airport 20 min)" },
    ],
  },
  "branson-by-numbers": {
    kind: "stat",
    title: "Branson by the numbers",
    stats: [
      { value: "16,500+", label: "hotel rooms in one small town" },
      { value: "100+", label: "live shows on and off the Strip" },
      { value: "800 mi", label: "of Table Rock Lake shoreline" },
      { value: "9M+", label: "visitors a year" },
    ],
  },
  "branson-strip-vs-lake": {
    kind: "compare",
    title: "The Strip or the lake?",
    left: "Highway 76 — the Strip",
    right: "Table Rock Lake",
    rows: [
      { label: "The vibe", left: "Neon, theaters, go-karts, nonstop", right: "Docks, pontoons, pine trees, quiet" },
      { label: "Best for", left: "First-timers, show marathons, kids", right: "Boating, families, couples who want calm" },
      { label: "To the theaters", left: "Walk to a few minutes", right: "A 15–20 minute drive" },
      { label: "You wake up to", left: "A parking lot and a billboard", right: "Open water and the odd bald eagle" },
    ],
  },
};

export function getInfographic(key: string): Infographic | null {
  return INFOGRAPHICS[key] ?? null;
}
