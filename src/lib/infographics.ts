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
  "albuquerque-vs-santafe": {
    kind: "compare",
    title: "Albuquerque or Santa Fe?",
    left: "Albuquerque",
    right: "Santa Fe",
    rows: [
      { label: "The draw", left: "Bigger city, Route 66, the Balloon Fiesta", right: "Art galleries, the adobe plaza, higher-end" },
      { label: "Hotels", left: "More choice, more affordable", right: "Pricier, more boutique" },
      { label: "Food", left: "Green-chile everything", right: "Refined New Mexican" },
      { label: "Getting there", left: "The closer airport, the Sunport", right: "About an hour north up I-25" },
    ],
  },
  "sanantonio-by-numbers": {
    kind: "stat",
    title: "San Antonio by the numbers",
    stats: [
      { value: "1718", label: "the Alamo was founded as a Spanish mission" },
      { value: "5 missions", label: "a UNESCO World Heritage Site, the Alamo among them" },
      { value: "~15 mi", label: "of paved River Walk along the San Antonio River" },
      { value: "~80 mi", label: "south of Austin — about 90 minutes up I-35" },
    ],
  },
  "sanantonio-downtown-vs-suburbs": {
    kind: "compare",
    title: "River Walk or the suburbs?",
    left: "Downtown & the River Walk",
    right: "Stone Oak, Medical Center & the airport",
    rows: [
      { label: "The vibe", left: "Walk to the Alamo, river cafes, no car needed", right: "Newer chains, quiet, you drive in" },
      { label: "Best for", left: "First-timers, couples, no-car trips", right: "Value, business, families with a car" },
      { label: "Nightly rate", left: "Higher — historic and boutique", right: "Lower — dependable chains" },
      { label: "You wake up to", left: "The river and the cypress trees", right: "A pool deck and easy parking" },
    ],
  },
  "sanantonio-getting-there": {
    kind: "steps",
    title: "Getting to San Antonio",
    steps: [
      { title: "Fly in", detail: "San Antonio International (SAT) sits about 8 miles north of downtown, roughly 15 minutes — small, easy and close to the center." },
      { title: "Skip the car downtown", detail: "The River Walk and the Alamo are walkable, and the VIA buses cover the core; you only need a car for SeaWorld, Six Flags or the outer missions." },
      { title: "Day-trip the Hill Country", detail: "Austin is ~80 miles north up I-35, and the Hill Country (Fredericksburg, New Braunfels) is an hour out for wineries and the river." },
    ],
  },
  "sanantonio-fiesta": {
    kind: "stat",
    title: "Fiesta San Antonio",
    stats: [
      { value: "11 days", label: "the city's biggest party, every late April" },
      { value: "1891", label: "it began as the Battle of Flowers parade" },
      { value: "River parade", label: "floats on the water down the River Walk" },
      { value: "Book ahead", label: "downtown sells out and rates climb for it" },
    ],
  },
  "sanantonio-riverwalk-tips": {
    kind: "steps",
    title: "Doing the River Walk right",
    steps: [
      { title: "Take the barge first", detail: "The narrated river barge is the fastest way to get your bearings — do it your first night." },
      { title: "Eat a block off the water", detail: "Riverside tables are convenient; the better food is a short walk up at the Pearl or in Southtown." },
      { title: "Walk it early", detail: "A weekday-morning stroll before the crowds is when the River Walk is genuinely at its best." },
    ],
  },
  "sanantonio-with-kids": {
    kind: "stat",
    title: "San Antonio with kids",
    stats: [
      { value: "SeaWorld", label: "plus the Aquatica water park, on the west side" },
      { value: "Six Flags", label: "Fiesta Texas, built into an old limestone quarry" },
      { value: "The zoo", label: "plus the DoSeum and the Japanese Tea Garden" },
      { value: "~25 min", label: "from a downtown base to either theme park" },
    ],
  },
  "kauai-by-numbers": {
    kind: "stat",
    title: "Kauai by the numbers",
    stats: [
      { value: "Poipu", label: "the sunny south shore — the easy first-timer base" },
      { value: "Na Pali", label: "the roadless cliffs — seen by boat, helicopter or foot" },
      { value: "Waimea", label: "Canyon — the 'Grand Canyon of the Pacific'" },
      { value: "No loop", label: "one main road; you drive out and back, not around" },
    ],
  },
  "kauai-north-vs-south": {
    kind: "compare",
    title: "North Shore or South Shore?",
    left: "South Shore (Poipu)",
    right: "North Shore (Princeville / Hanalei)",
    rows: [
      { label: "The weather", left: "Sunnier and drier year-round", right: "Lush and green — and rainier, especially in winter" },
      { label: "Best for", left: "First-timers, families, calm swimming", right: "Scenery, hiking, the Na Pali coast" },
      { label: "The feel", left: "Resorts, restaurants, convenient", right: "Laid-back, rugged, fewer big hotels" },
      { label: "The catch", left: "More built-up; a long drive to the north", right: "Rain, and a long drive to everything else" },
    ],
  },
  "kauai-getting-there": {
    kind: "steps",
    title: "Getting to (and around) Kauai",
    steps: [
      { title: "Fly into Lihue (LIH)", detail: "Kauai's only airport is on the east side by Lihue — most trips connect through Honolulu, with some direct West Coast flights." },
      { title: "Rent a car — you'll need it", detail: "One main highway, no loop road (the Na Pali cliffs block the circle), so you drive out and back. Public transit is minimal." },
      { title: "Pick a side, or split", detail: "Base on the sunny South Shore for a first trip, the North Shore for scenery; for a week, split between Poipu and Princeville." },
    ],
  },
  "sf-by-numbers": {
    kind: "stat",
    title: "San Francisco by the numbers",
    stats: [
      { value: "7×7", label: "square miles — the whole city is small and walkable" },
      { value: "Union Square", label: "the central, transit-hub base for a first trip" },
      { value: "Karl", label: "the summer fog; it's cold and grey, so pack layers" },
      { value: "Sept–Oct", label: "the warmest, clearest months to visit" },
    ],
  },
  "sf-getting-around": {
    kind: "steps",
    title: "Getting to (and around) San Francisco",
    steps: [
      { title: "Fly into SFO (or Oakland)", detail: "BART runs from SFO straight downtown to the Powell Street / Union Square stop in about 30 minutes — no car required." },
      { title: "Skip the rental car", detail: "Hotel parking runs roughly $50–75 a night, the hills and one-way streets are a chore, and smash-and-grabs are real. Rent only if you're leaving the city." },
      { title: "Walk first, then ride", detail: "It's a 7×7-mile city, so you'll walk most of it; cable cars, Muni and BART cover the rest. A central base means less commuting." },
    ],
  },
  "sf-union-vs-wharf": {
    kind: "compare",
    title: "Union Square or Fisherman's Wharf?",
    left: "Union Square",
    right: "Fisherman's Wharf",
    rows: [
      { label: "Best for", left: "First-timers, walkability, transit", right: "Families, the waterfront, Alcatraz trips" },
      { label: "The feel", left: "Central, busy — shops and theaters", right: "Touristy, salty air, sea lions" },
      { label: "Getting around", left: "Cable cars, BART and Muni at the door", right: "A cable-car or bus ride from downtown" },
      { label: "The trade", left: "Some blocks fray toward the Tenderloin edge", right: "Pricey and crowded, and quiet after dark" },
    ],
  },
  "nola-kids-by-numbers": {
    kind: "stat",
    title: "New Orleans with kids, at a glance",
    stats: [
      { value: "Audubon", label: "a beloved zoo, aquarium and insectarium — the family trifecta" },
      { value: "City Park", label: "Storyland, the Carousel Gardens rides and the Children's Museum" },
      { value: "$1.25", label: "a streetcar ride — the cheapest thrill in town for little ones" },
      { value: "Ages 4–12", label: "the sweet spot, though toddlers and teens find plenty too" },
    ],
  },
  "nola-kids-by-age": {
    kind: "stat",
    title: "Best picks by age",
    stats: [
      { value: "Toddlers", label: "Storyland, the Carousel Gardens, the aquarium touch pool, beignets" },
      { value: "Big kids", label: "a swamp tour, the Insectarium, Mardi Gras World, the streetcar" },
      { value: "Tweens & teens", label: "the WWII Museum, a ghost hunt, a cooking class" },
      { value: "Any age", label: "City Park, Jackson Square street performers, the riverfront" },
    ],
  },
  "nola-rainy-day-kids": {
    kind: "stat",
    title: "Rainy-day rescue (all indoors)",
    stats: [
      { value: "Aquarium", label: "sharks, penguins and a hands-on touch pool" },
      { value: "Children's Museum", label: "the Move With the River exhibit in City Park" },
      { value: "Insectarium", label: "bugs, a butterfly garden and a bug bistro if you dare" },
      { value: "WWII Museum", label: "older kids' history that actually lands" },
    ],
  },
  "nola-kids-free": {
    kind: "stat",
    title: "Free with kids in New Orleans",
    stats: [
      { value: "Jackson Square", label: "street performers, brass bands and the cathedral, free to watch" },
      { value: "The riverfront", label: "the Moon Walk promenade and ships rolling down the Mississippi" },
      { value: "French Market", label: "browsing, samples and people-watching cost nothing" },
      { value: "Library storytime", label: "free songs-and-crafts sessions made for toddlers" },
    ],
  },
  "nola-kids-callout": {
    kind: "callout",
    title: "The move: daytime Quarter, family base nearby",
    body: "The French Quarter by day is street performers, beignets and the river — wholesome and walkable. Skip Bourbon Street with kids, base a few blocks off it, and build each day around one big outing plus a park or a nap.",
  },
  "nola-weather-extremes": {
    kind: "stat",
    title: "New Orleans weather, at the extremes",
    stats: [
      { value: "Jul–Aug", label: "the hottest — highs near 92°F with brutal humidity" },
      { value: "January", label: "the coolest — highs around 62°F, lows in the 40s" },
      { value: "Mid-summer", label: "the wettest, with near-daily afternoon thunderstorms" },
      { value: "October", label: "the driest and most comfortable stretch of the year" },
    ],
  },
  "nola-festival-calendar": {
    kind: "stat",
    title: "New Orleans festival calendar (2026)",
    stats: [
      { value: "Feb 17", label: "Mardi Gras — Carnival builds from January 6" },
      { value: "April", label: "French Quarter Festival — free music on the riverfront" },
      { value: "Apr 23–May 3", label: "New Orleans Jazz & Heritage Festival (Jazz Fest)" },
      { value: "July 4", label: "Essence Festival weekend — the summer headliner" },
    ],
  },
  "nola-best-time": {
    kind: "stat",
    title: "Best time to visit New Orleans, in one glance",
    stats: [
      { value: "Oct–Nov", label: "the best weather — crisp 70s and low humidity" },
      { value: "Feb–May", label: "festival season: Mardi Gras, French Quarter Fest, Jazz Fest" },
      { value: "August", label: "the cheapest month — but brutally hot and peak hurricane season" },
      { value: "Mar & Nov", label: "the sweet spot: great weather, smaller crowds, fair prices" },
    ],
  },
  "nola-cheapest": {
    kind: "stat",
    title: "When New Orleans is cheapest",
    stats: [
      { value: "Summer", label: "June–September: rates fall as the heat scares everyone off" },
      { value: "August", label: "the rock-bottom month — hotels can run far below spring rates" },
      { value: "January", label: "a quiet, cheap lull after New Year and before Mardi Gras" },
      { value: "Avoid", label: "Mardi Gras and Jazz Fest weekends — the priciest dates by far" },
    ],
  },
  "nola-seasons": {
    kind: "stat",
    title: "New Orleans by season",
    stats: [
      { value: "Spring", label: "warm, gorgeous, festival-packed — and priced like it" },
      { value: "Summer", label: "hot, humid and stormy, but the cheapest and least crowded" },
      { value: "Fall", label: "the locals' favorite: best weather, easier prices" },
      { value: "Winter", label: "cool and festive, with a cheap January lull before Carnival" },
    ],
  },
  "nola-mardi-gras-2026": {
    kind: "callout",
    title: "Mardi Gras 2027 falls on February 9",
    body: "Carnival season runs from January 6 to Fat Tuesday (Feb 9, 2027). The two weeks before are the city's busiest and most expensive — hotels book up a year ahead and often require 3–4 night minimums. Want the party? Book early. Want the city calm? Avoid those two weeks entirely.",
  },
  "nola-mg-2027-dates": {
    kind: "stat",
    title: "Mardi Gras 2027, at a glance",
    stats: [
      { value: "Feb 9, 2027", label: "Fat Tuesday — Mardi Gras Day, the grand finale" },
      { value: "Jan 6", label: "Twelfth Night — Carnival season begins, king cakes appear" },
      { value: "34 days", label: "a short 2027 season (2026 ran 43 days, 2025 ran 58)" },
      { value: "Feb 8", label: "Lundi Gras — Zulu and Rex arrive by riverboat" },
    ],
  },
  "nola-mg-colors": {
    kind: "stat",
    title: "What the Mardi Gras colors mean",
    stats: [
      { value: "Purple", label: "Justice — one of the three colors Rex chose in 1872" },
      { value: "Green", label: "Faith" },
      { value: "Gold", label: "Power" },
      { value: "1872", label: "Rex debuts the King of Carnival and these colors" },
    ],
  },
  "nola-mg-throws": {
    kind: "stat",
    title: "The throws worth catching",
    stats: [
      { value: "Zulu coconut", label: "the holy grail — hand-passed from the float, not thrown" },
      { value: "Muses shoe", label: "a glittered high heel from the all-women krewe" },
      { value: "Nyx purse", label: "a hand-decorated handbag" },
      { value: "Tucks paper", label: "a roll of toilet paper — yes, really, and it's a classic" },
    ],
  },
  "nola-mg-family-vs-party": {
    kind: "compare",
    title: "Family parade or adult party?",
    left: "Family-friendly (Uptown)",
    right: "Adult party (the Quarter)",
    rows: [
      { label: "Where", left: "St. Charles Ave and Napoleon Ave, Uptown", right: "Bourbon Street and the French Quarter" },
      { label: "The vibe", left: "Ladders, picnics, kids, daytime parades", right: "Costumes, crowds, to-go cups, late nights" },
      { label: "Best for", left: "Families, first-timers, a calmer curb", right: "Adults who came for the wild side" },
      { label: "The catch", left: "Arrive early to claim a spot", right: "No parades roll here — it's the after-party" },
    ],
  },
  "nola-mg-booking": {
    kind: "steps",
    title: "How to book a Mardi Gras room",
    steps: [
      { title: "Book 6–12 months out", detail: "Parade-route hotels sell out nearly a year ahead; most open Carnival bookings 10–12 months early." },
      { title: "Expect minimums and deposits", detail: "Three-to-five-night stays and non-refundable deposits are standard for Carnival week." },
      { title: "Pick your spot", detail: "St. Charles for the parades, the CBD for the Canal Street finish, the Quarter for the costume scene." },
      { title: "Lock the rate early", detail: "Base rates climb across the whole city — the earlier you book, the better you sit." },
    ],
  },
  "nola-mg-callout": {
    kind: "callout",
    title: "The first-timer's move",
    body: "Catch a family parade Uptown on St. Charles by day, costume up for the Quarter by night, and eat king cake until Lent. Book your room 6–12 months out — and know the price you see is the same flat fee everyone sees, never set from your device or history.",
  },
  "nola-day-trips": {
    kind: "stat",
    title: "Best day trips from New Orleans, at a glance",
    stats: [
      { value: "Plantation Country", label: "Oak Alley, Whitney and Laura along River Road, ~1 hour west" },
      { value: "Honey Island Swamp", label: "gator-filled bayou by flat-bottom boat, ~45 minutes east" },
      { value: "Baton Rouge", label: "the state capital and tallest U.S. capitol, ~1.5 hours up I-10" },
      { value: "Cajun Country", label: "Lafayette's dance halls and prairie towns, ~2 hours west" },
    ],
  },
  "nola-plantations": {
    kind: "stat",
    title: "The River Road plantations",
    stats: [
      { value: "Oak Alley", label: "the famous quarter-mile of 28 oaks — the photogenic one" },
      { value: "Whitney", label: "the one museum told from the enslaved people's perspective" },
      { value: "Laura", label: "a Creole plantation and its generations of women" },
      { value: "Destrehan", label: "the closest to the city, about 30 minutes out" },
    ],
  },
  "nola-swamp-tours": {
    kind: "stat",
    title: "Swamp tours, decoded",
    stats: [
      { value: "Honey Island", label: "the classic — cypress, moss and gators near Slidell" },
      { value: "Barataria", label: "free trails at the Jean Lafitte preserve, ~40 minutes south" },
      { value: "Airboat vs pontoon", label: "airboats are fast and loud; covered pontoons are calmer" },
      { value: "Hotel pickup", label: "most tours collect you from the Quarter — no car needed" },
    ],
  },
  "nola-daytrip-callout": {
    kind: "callout",
    title: "Guided tour or rent a car?",
    body: "A guided tour (usually with hotel pickup) is easiest for the swamp and the plantations — no driving, no parking, an expert along for the ride. Renting a car makes sense for Cajun Country, the Northshore, or stringing several stops together at your own pace. For one marquee stop like Oak Alley or Honey Island, let someone else drive.",
  },
  "nola-by-interest": {
    kind: "stat",
    title: "Pick your New Orleans by interest",
    stats: [
      { value: "Music", label: "Frenchmen Street, Preservation Hall, a jazz brunch" },
      { value: "History", label: "the WWII Museum, the cemeteries, a plantation day trip" },
      { value: "Food", label: "beignets, po-boys, gumbo, the grand Creole rooms" },
      { value: "Family", label: "the Audubon Aquarium and Zoo, City Park, the streetcar" },
    ],
  },
  "nola-3-days": {
    kind: "steps",
    title: "Three days in New Orleans",
    steps: [
      { title: "Day 1 — the Quarter", detail: "Jackson Square, Royal Street, beignets, Frenchmen Street jazz at night." },
      { title: "Day 2 — history & garden", detail: "The WWII Museum, then the streetcar through the Garden District." },
      { title: "Day 3 — the wild side", detail: "A swamp tour or steamboat cruise, a cooking class, a cemetery walk." },
    ],
  },
  "nola-things-by-numbers": {
    kind: "stat",
    title: "New Orleans, at a glance",
    stats: [
      { value: "1718", label: "the year it was founded — the French Quarter is its oldest heart" },
      { value: "Nightly", label: "live jazz on Frenchmen Street and at Preservation Hall" },
      { value: "Free", label: "Jackson Square, the French Market and the riverfront cost nothing" },
      { value: "Year-round", label: "festivals from Mardi Gras to Jazz Fest to French Quarter Fest" },
    ],
  },
  "nola-first-day": {
    kind: "steps",
    title: "A perfect first day in the Quarter",
    steps: [
      { title: "Morning", detail: "Beignets and chicory coffee at Café du Monde, then Jackson Square and the cathedral." },
      { title: "Midday", detail: "Browse the French Market and Royal Street; lunch on a po-boy or gumbo." },
      { title: "Afternoon", detail: "Ride the St. Charles streetcar through the Garden District." },
      { title: "Evening", detail: "Live jazz on Frenchmen Street — the locals' Bourbon Street." },
    ],
  },
  "nola-free-vs-ticketed": {
    kind: "compare",
    title: "Free vs worth-the-ticket",
    left: "Free",
    right: "Worth a ticket",
    rows: [
      { label: "Do", left: "Jackson Square, French Market, riverfront, street jazz", right: "WWII Museum, swamp tour, steamboat cruise, cemetery tour" },
      { label: "Best for", left: "Wandering, people-watching, photos", right: "History, the bayou, the Mississippi, the cemeteries" },
      { label: "Tip", left: "Most of the Quarter costs nothing", right: "Book guided tours ahead in peak season" },
    ],
  },
  "nola-things-callout": {
    kind: "callout",
    title: "The move: free by day, tours by night",
    body: "The Quarter's best hits — Jackson Square, the cathedral, the river, the street music — are free and walkable. Save the budget for what genuinely needs a ticket: the WWII Museum, a swamp tour, a steamboat jazz cruise, or a cemetery tour you can't do solo.",
  },
  "nola-safety-by-numbers": {
    kind: "stat",
    title: "New Orleans safety, at a glance",
    stats: [
      { value: "Falling", label: "violent crime has dropped sharply since 2023" },
      { value: "French Quarter", label: "the most-policed, safest base for visitors" },
      { value: "Pickpockets", label: "petty crime, not violence, is the real tourist risk" },
      { value: "Rideshare", label: "the smart way home after a late night" },
    ],
  },
  "nola-safe-vs-avoid": {
    kind: "compare",
    title: "Where to base vs where to skip",
    left: "Safe to base in",
    right: "Skip (especially after dark)",
    rows: [
      { label: "Areas", left: "French Quarter, Garden District, CBD, Marigny, Bywater", right: "Central City, Desire, Upper Ninth Ward, Hollygrove" },
      { label: "Why", left: "Heavily policed, well-lit, full of people", right: "Higher crime, few attractions, not set up for visitors" },
      { label: "The move", left: "Book here, walk the main streets", right: "Don't chase a too-cheap room to save $20" },
    ],
  },
  "nola-stay-safe-steps": {
    kind: "steps",
    title: "The whole New Orleans safety playbook",
    steps: [
      { title: "Base in the corridor", detail: "French Quarter, Garden District, CBD, Marigny or Bywater." },
      { title: "Rideshare after dark", detail: "Skip the long late walk — it's cheap and quick." },
      { title: "Valuables in a front pocket", detail: "Don't flash cash or a phone in a crowd." },
      { title: "Mind your drink", detail: "Don't set it down and walk away on Bourbon Street." },
      { title: "Trust your gut", detail: "Treat any unprompted approach as a sales pitch." },
    ],
  },
  "nola-safety-callout": {
    kind: "callout",
    title: "The mindset that keeps you safe",
    body: "Treat New Orleans like the major city it is — not a theme park, not a war zone. Stay central, keep your wits, and the worst surprise you'll get is how much you spent on oysters.",
  },
  "nola-by-numbers": {
    kind: "stat",
    title: "New Orleans by the numbers",
    stats: [
      { value: "1718", label: "founded — the French Quarter is the original city" },
      { value: "French Quarter", label: "the central, walkable base for a first trip" },
      { value: "Streetcars", label: "the St. Charles line runs to the Garden District" },
      { value: "Mardi Gras", label: "and Jazz Fest — book months ahead and pay up" },
    ],
  },
  "nola-fq-vs-cbd": {
    kind: "compare",
    title: "French Quarter or the CBD?",
    left: "French Quarter",
    right: "Central Business District",
    rows: [
      { label: "Best for", left: "First-timers, atmosphere, walking", right: "Quiet, value, conventions" },
      { label: "The feel", left: "Historic, lively, loud", right: "Modern hotels, calm, central" },
      { label: "At night", left: "Bourbon Street never sleeps", right: "Quiet — a few blocks from the action" },
      { label: "The trade", left: "Pricey and noisy on the wrong block", right: "Less charm, a short walk to it" },
    ],
  },
  "nola-getting-around": {
    kind: "steps",
    title: "Getting to (and around) New Orleans",
    steps: [
      { title: "Fly into MSY", detail: "Louis Armstrong airport is about 30 minutes from downtown by rideshare or airport shuttle — no rental car needed for a city trip." },
      { title: "Skip the car", detail: "The French Quarter is walkable and parking is pricey and scarce; a car is a liability on the narrow one-way streets. Rent only for swamp tours or plantations." },
      { title: "Streetcars and rideshare", detail: "The historic St. Charles line runs to the Garden District and Uptown; the Canal and Riverfront lines cover downtown; rideshares fill the late-night gaps." },
    ],
  },
  "nola-dining-by-numbers": {
    kind: "stat",
    title: "New Orleans dining, at a glance",
    stats: [
      { value: "1840", label: "Antoine's opens — today the oldest family-run restaurant in the US" },
      { value: "1862", label: "Café du Monde starts serving beignets and chicory café au lait" },
      { value: "2★", label: "Michelin stars at Emeril's, the city's only two-star restaurant" },
      { value: "2024", label: "Dakar NOLA wins the James Beard Award for Best New Restaurant" },
    ],
  },
  "nola-trap-vs-local": {
    kind: "compare",
    title: "Tourist trap or local table?",
    left: "The trap near Bourbon",
    right: "Where locals eat",
    rows: [
      { label: "The look", left: "Big sign, a host working the sidewalk, 'authentic Creole'", right: "A corner joint, laminated menu, plastic on the tables" },
      { label: "The food", left: "Fine, frozen, forgettable", right: "The gumbo somebody's grandmother actually makes" },
      { label: "The wait", left: "Walk right in at 7pm", right: "There's a line, and the line is the review" },
      { label: "The move", left: "One photo, keep walking", right: "Two blocks off Bourbon, follow the regulars" },
    ],
  },
  "nola-must-eat-dishes": {
    kind: "steps",
    title: "What to eat (and where) in New Orleans",
    steps: [
      { title: "Beignets", detail: "Café du Monde — three to an order, powdered sugar included whether you asked or not." },
      { title: "A dressed po-boy", detail: "Domilise's or Parkway, on Leidenheimer French bread — shrimp or roast beef." },
      { title: "Gumbo", detail: "Dooky Chase's or any Creole classic — the holy trinity in a bowl." },
      { title: "Char-grilled oysters", detail: "Drago's, which invented them, or Acme Oyster House." },
      { title: "Turtle soup", detail: "Commander's Palace, finished tableside with a pour of sherry." },
      { title: "Bananas Foster", detail: "Brennan's, where it was invented and still flambéed at your table." },
    ],
  },
  "nola-cheap-vs-splurge": {
    kind: "compare",
    title: "Cheap eats or the white-tablecloth splurge?",
    left: "Under ~$15 a plate",
    right: "The grand Creole splurge",
    rows: [
      { label: "Where", left: "Domilise's, Coop's Place, Killer PoBoys, Verti Marte", right: "Commander's Palace, Antoine's, Galatoire's, Emeril's" },
      { label: "The order", left: "A dressed po-boy, red beans, a plate lunch", right: "Turtle soup, a tasting menu, a bread-pudding soufflé" },
      { label: "Reservation", left: "Walk in, maybe wait", right: "Book weeks ahead, longer for festivals" },
      { label: "Dress", left: "However you woke up", right: "Collared shirt; jackets after 5pm at some" },
    ],
  },
  "nola-reservations": {
    kind: "steps",
    title: "How to actually get a table",
    steps: [
      { title: "Book the big names early", detail: "Commander's, Antoine's and Emeril's go 2–8 weeks out — 2+ months on festival weekends." },
      { title: "Know the walk-in move", detail: "Galatoire's downstairs takes no reservations; show up early and queue with the regulars." },
      { title: "Mind the dress code", detail: "Jackets after 5pm at Galatoire's; collared shirts and no shorts at Commander's." },
      { title: "Tip like a local", detail: "Service in the grand rooms is a craft — 20% and up is the floor." },
    ],
  },
  "nola-creole-vs-cajun": {
    kind: "compare",
    title: "Creole or Cajun?",
    left: "Creole (city cooking)",
    right: "Cajun (country cooking)",
    rows: [
      { label: "Roots", left: "French, Spanish and African, in city kitchens", right: "Rural Acadiana, French-Canadian heritage" },
      { label: "The tell", left: "Often tomato-based, more refined sauces", right: "Rustic and one-pot — no tomato in the gumbo" },
      { label: "Signature plates", left: "Shrimp Creole, turtle soup, Creole gumbo", right: "Jambalaya, crawfish étouffée, boudin" },
      { label: "Try it at", left: "Antoine's, Galatoire's, Commander's", right: "Cochon, or a day trip toward Lafayette" },
    ],
  },
  "nola-new-buzzy": {
    kind: "stat",
    title: "The newest tables worth chasing",
    stats: [
      { value: "Acamaya", label: "Ana Castro's Bywater Mexican mariscos — a recent breakout" },
      { value: "The Kingsway", label: "modern Asian cooking on Magazine Street" },
      { value: "Bacchanal", label: "Bywater wine garden with live music and a backyard kitchen" },
      { value: "N7", label: "a hard-to-find Bywater French-Japanese wine spot" },
    ],
  },
  "nola-dining-callout": {
    kind: "callout",
    title: "Eat here, sleep next door",
    body: "The smartest food trip stays walkable to where you want to eat: the French Quarter for Antoine's and Galatoire's, the Garden District for Commander's Palace, the Warehouse District for Emeril's and Compère Lapin — then roll home on foot. And the room you book here is the same price everyone sees, with one flat fee and no surprise charge on the last screen.",
  },
  "staugustine-by-numbers": {
    kind: "stat",
    title: "St. Augustine by the numbers",
    stats: [
      { value: "1565", label: "founded — the oldest city in the United States" },
      { value: "~40 mi", label: "south of Jacksonville, about 45 minutes" },
      { value: "~6 mi", label: "from Old Town to the Atlantic beaches" },
      { value: "3M+", label: "lights in the historic district each winter" },
    ],
  },
  "staugustine-historic-vs-beach": {
    kind: "compare",
    title: "The Historic District or the beach?",
    left: "The Historic District",
    right: "The beaches (Anastasia / Vilano)",
    rows: [
      { label: "The vibe", left: "Cobblestones, the fort, walk to dinner", right: "Sand, surf, low-key, drive in" },
      { label: "Best for", left: "First-timers, history, no-car trips", right: "Beach days, families, quiet" },
      { label: "To the sand", left: "A 10–15 minute drive", right: "You're on it" },
      { label: "You wake up to", left: "Spanish-colonial streets", right: "The Atlantic and the dunes" },
    ],
  },
  "staugustine-getting-there": {
    kind: "steps",
    title: "Getting to St. Augustine",
    steps: [
      { title: "Fly into Jacksonville", detail: "St. Augustine has no commercial airport; Jacksonville (JAX) is ~40 miles and 45 minutes north, Orlando ~2 hours south." },
      { title: "Park once, then walk", detail: "The historic district is tight and parking is scarce — base downtown and you can leave the car for days; the beaches need it." },
      { title: "Ride the trolley", detail: "Hop-on Old Town Trolleys loop the historic sights, and free park-and-ride shuttles run during the busy Nights of Lights season." },
    ],
  },
  "charleston-by-numbers": {
    kind: "stat",
    title: "Charleston by the numbers",
    stats: [
      { value: "1670", label: "founded — the heart of the Lowcountry" },
      { value: "~12 mi", label: "from downtown to the Isle of Palms and Folly beaches" },
      { value: "~15 min", label: "over the Ravenel Bridge to Mount Pleasant" },
      { value: "Holy City", label: "nicknamed for its skyline of historic church steeples" },
    ],
  },
  "charleston-downtown-vs-mtpleasant": {
    kind: "compare",
    title: "Downtown or Mount Pleasant?",
    left: "Downtown (the peninsula)",
    right: "Mount Pleasant & the beaches",
    rows: [
      { label: "The vibe", left: "Cobblestones, King Street, walk everywhere", right: "Suburban porches, Shem Creek, the surf" },
      { label: "Best for", left: "First-timers, history, food, no car", right: "Families, beach days, lower rates" },
      { label: "To the sights", left: "On foot", right: "A 10–15 minute drive over the bridge" },
      { label: "You wake up to", left: "Church steeples and brick", right: "Oak trees, marsh and the beaches nearby" },
    ],
  },
  "charleston-getting-there": {
    kind: "steps",
    title: "Getting to Charleston",
    steps: [
      { title: "Fly into CHS", detail: "Charleston International (CHS) sits in North Charleston, about 12 miles and 20 minutes from downtown." },
      { title: "Park downtown, then walk", detail: "The historic peninsula is flat and walkable; parking is tight, so base downtown and leave the car, or use the free DASH trolley." },
      { title: "Drive for the beaches", detail: "Mount Pleasant, Isle of Palms, Sullivan's Island and Folly Beach all need a car, 15 to 30 minutes out." },
    ],
  },
  "savannah-by-numbers": {
    kind: "stat",
    title: "Savannah by the numbers",
    stats: [
      { value: "1733", label: "founded — Georgia's oldest city" },
      { value: "22", label: "historic squares shaded by live oaks" },
      { value: "~18 mi", label: "from downtown to the Tybee Island beach" },
      { value: "~20 min", label: "from the airport (SAV) to the historic district" },
    ],
  },
  "savannah-north-vs-south": {
    kind: "compare",
    title: "North or South Historic District?",
    left: "North Historic District",
    right: "South Historic District",
    rows: [
      { label: "The vibe", left: "River Street, City Market, the buzz", right: "Forsyth Park, quiet squares, romance" },
      { label: "Best for", left: "First-timers, nightlife, families", right: "Couples, calm, tree-lined walks" },
      { label: "You're near", left: "The waterfront and the bars", right: "The park and the gas-lit lanes" },
      { label: "At night", left: "Lively and walkable", right: "Peaceful and dim" },
    ],
  },
  "savannah-getting-there": {
    kind: "steps",
    title: "Getting to Savannah",
    steps: [
      { title: "Fly into SAV", detail: "Savannah/Hilton Head International (SAV) is about 13 miles and 20 minutes west of the historic district." },
      { title: "Park once, then walk", detail: "The historic district is flat and made for walking; parking is tight, so base downtown and leave the car, or ride the free DOT shuttle and ferry." },
      { title: "Drive to Tybee", detail: "Tybee Island, Savannah's beach, is about 18 miles and 30 minutes east — a car or a day-trip tour gets you there." },
    ],
  },
  "scottsdale-by-numbers": {
    kind: "stat",
    title: "Scottsdale by the numbers",
    stats: [
      { value: "330+", label: "days of sunshine a year in the Sonoran Desert" },
      { value: "~15 min", label: "from Old Town to Phoenix Sky Harbor (PHX)" },
      { value: "Golf country", label: "Troon North, TPC Scottsdale and dozens more courses" },
      { value: "Old Town", label: "the walkable heart — bars, galleries and shopping" },
    ],
  },
  "scottsdale-oldtown-vs-north": {
    kind: "compare",
    title: "Old Town or North Scottsdale?",
    left: "Old Town Scottsdale",
    right: "North Scottsdale",
    rows: [
      { label: "The vibe", left: "Walkable bars, galleries, nightlife", right: "Desert views, golf, quiet luxury" },
      { label: "Best for", left: "First-timers, nightlife, no car", right: "Golfers, spa-goers, calm" },
      { label: "Getting around", left: "Walk everywhere", right: "You'll want a car" },
      { label: "The rate", left: "Mid to high", right: "Resort high" },
    ],
  },
  "scottsdale-getting-there": {
    kind: "steps",
    title: "Getting to Scottsdale",
    steps: [
      { title: "Fly into PHX", detail: "Phoenix Sky Harbor (PHX) is about 12 miles and 15–20 minutes from Old Town Scottsdale — the closest major airport." },
      { title: "Rent a car for most areas", detail: "Old Town is walkable, but North Scottsdale, the golf resorts and the trailheads are spread out — you'll want a car everywhere but Old Town." },
      { title: "Beat the summer heat", detail: "Scottsdale sees 100°F-plus summers; fall through spring is prime, and resorts drop their rates in the summer." },
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

  "nola-day1-plan": {
    kind: "steps",
    title: "Day 1, the French Quarter on foot",
    steps: [
      { title: "Morning", detail: "Beignets and chicory coffee at Café du Monde, then Jackson Square, St. Louis Cathedral, and a slow loop of Royal Street." },
      { title: "Midday", detail: "The French Market, the Pharmacy Museum, and a muffuletta from Central Grocery or a dressed po'boy." },
      { title: "Afternoon", detail: "A guided food or cocktail history walk, or wander the Quarter with a legal to-go cup." },
      { title: "Evening", detail: "Live jazz on Frenchmen Street, the locals' answer to Bourbon. Catch a 7:30 or 9:30 set." },
    ],
  },
  "nola-day2-plan": {
    kind: "steps",
    title: "Day 2, streetcar, Garden District, museums",
    steps: [
      { title: "Morning", detail: "Ride the St. Charles streetcar Uptown past the oak-lined mansions for the price of a coffee." },
      { title: "Midday", detail: "Walk Magazine Street for lunch and shops. See Lafayette Cemetery through the fence, it is closed inside." },
      { title: "Afternoon", detail: "The National WWII Museum, three to four hours and worth every one." },
      { title: "Evening", detail: "Dinner Uptown or in the Warehouse District, then a nightcap with live music." },
    ],
  },
  "nola-day3-options": {
    kind: "compare",
    title: "Day 3, get out of town or stay put?",
    left: "Out of town",
    right: "Stay in the city",
    rows: [
      { label: "The plan", left: "A swamp boat plus a River Road plantation", right: "City Park, a cemetery tour, a cooking class" },
      { label: "Best for", left: "First-timers who want the bayou and the history", right: "Repeat visitors and slow mornings" },
      { label: "How long", left: "A half or full day with hotel pickup", right: "Your own pace, no van schedule" },
      { label: "Book ahead?", left: "Yes, combos sell out in spring", right: "Only the cooking class and tour" },
    ],
  },
  "nola-transit-fares": {
    kind: "stat",
    title: "Getting around for the price of a coffee",
    stats: [
      { value: "$1.25", label: "a single streetcar or bus ride, exact change, no change given" },
      { value: "$3", label: "a one-day Jazzy Pass, unlimited streetcars and buses" },
      { value: "$9", label: "a three-day Jazzy Pass, which pays for itself fast" },
      { value: "~30 min", label: "from Louis Armstrong airport (MSY) to downtown" },
    ],
  },
  "nola-3day-budget": {
    kind: "compare",
    title: "What three days roughly costs",
    left: "Doing it cheap",
    right: "Doing it comfortable",
    rows: [
      { label: "A room a night", left: "$80 to 130 just off the Quarter", right: "$180 to 300 in the Quarter" },
      { label: "Food for a day", left: "$35 to 50 at po'boy counters", right: "$90 to 150 white tablecloth Creole" },
      { label: "Getting around", left: "$9 Jazzy Pass for all three days", right: "$15 to 25 a day in rideshares" },
      { label: "One big day out", left: "A self-guided Garden District walk", right: "$80 to 175 swamp plus plantation" },
    ],
  },
  "nola-3day-callout": {
    kind: "callout",
    title: "The three-day move",
    body: "Base in or one streetcar stop from the French Quarter, so you walk to most of it. Skip the rental car, the parking and one-way streets are a tax you do not need. Front-load the Quarter on Day 1, ride the streetcar on Day 2, and save the swamp and plantation combo for Day 3. Book that combo before you fly in, because the good spring dates sell out.",
  },

  "nola-fq-history": {
    kind: "steps",
    title: "How the French Quarter got Spanish bones",
    steps: [
      { title: "1718", detail: "Bienville founds New Orleans. The Quarter is the original city, the Vieux Carré." },
      { title: "1763", detail: "France hands the colony to Spain after the Seven Years War." },
      { title: "1788 and 1794", detail: "Two great fires burn most of the wooden French town to the ground." },
      { title: "Rebuilt in brick", detail: "The Spanish rebuild with stucco, courtyards, and iron balconies. The French Quarter is mostly Spanish." },
    ],
  },
  "nola-fq-streets": {
    kind: "compare",
    title: "Royal Street or Bourbon Street?",
    left: "Royal Street",
    right: "Bourbon Street",
    rows: [
      { label: "The vibe", left: "Antiques, galleries, iron balconies, calm", right: "Bars, neon, a round-the-clock party" },
      { label: "Best by", left: "Day, for a slow stroll", right: "One night, to see it once" },
      { label: "The sound", left: "A lone street musician", right: "Ten bands at once, all louder" },
      { label: "Watch for", left: "Nothing much", right: "Pickpockets and the Canal end after dark" },
    ],
  },
  "nola-fq-attractions": {
    kind: "stat",
    title: "What it costs to see the Quarter",
    stats: [
      { value: "Free", label: "St. Louis Cathedral, open daily until 4pm" },
      { value: "$11", label: "the New Orleans Jazz Museum at the Old US Mint" },
      { value: "$10", label: "the Historic Voodoo Museum, two rooms of folklore" },
      { value: "$43.50", label: "a Steamboat Natchez jazz cruise on the Mississippi" },
    ],
  },
  "nola-fq-callout": {
    kind: "callout",
    title: "The French Quarter move",
    body: "Walk it. The whole Quarter is about 13 blocks by 7 and dead flat. Spend your days on Royal, Chartres, and the riverfront, and see Bourbon Street once after dark rather than building a trip around it. Stay inside the Quarter so you can walk home, and keep to the busy, well-lit streets at night.",
  },
  "nola-fq-cocktails": {
    kind: "steps",
    title: "Three cocktails the Quarter invented",
    steps: [
      { title: "The Sazerac", detail: "Mixed in a Quarter pharmacy by Antoine Peychaud. Rye, bitters, a whisper of absinthe. Louisiana's official cocktail." },
      { title: "The Hurricane", detail: "Born at Pat O'Brien's in the 1940s. Rum and passion fruit in a lamp shaped glass. Sweet and lethal." },
      { title: "The Vieux Carré", detail: "Invented at the Carousel Bar. Rye, cognac, vermouth, and two kinds of bitters, named for the Quarter itself." },
      { title: "Where to sip them", detail: "Lafitte's Blacksmith Shop by candlelight, Napoleon House for a Pimm's Cup, the Carousel Bar for the slow spin." },
    ],
  },

  "nola-gd-history": {
    kind: "steps",
    title: "How the Garden District grew",
    steps: [
      { title: "After 1803", detail: "Anglo-American newcomers arrive after the Louisiana Purchase, wanting distance from the Creole French Quarter." },
      { title: "1832 onward", detail: "They subdivide the old Livaudais Plantation and build, a couple of grand houses per block." },
      { title: "The gardens", detail: "Each home sits inside a large garden. Visiting writers dub the area the Garden District." },
      { title: "The honest part", detail: "The wealth came from cotton, sugar, and enslaved labor, when New Orleans was the nation's largest slave market." },
    ],
  },
  "nola-gd-homes": {
    kind: "stat",
    title: "The Garden District's famous homes",
    stats: [
      { value: "Buckner Mansion", label: "1856, Miss Robicheaux's Academy in American Horror Story Coven" },
      { value: "The Cornstalk fence", label: "Colonel Short's Villa, 1859, the cast-iron cornstalk and morning glory fence" },
      { value: "1239 First St", label: "the Brevard House, where Anne Rice wrote the Mayfair Witches" },
      { value: "2707 Coliseum", label: "the retirement home in The Curious Case of Benjamin Button" },
    ],
  },
  "nola-gd-callout": {
    kind: "callout",
    title: "The Garden District move",
    body: "Ride the Saint Charles streetcar to Washington Avenue (a dollar and a quarter), then walk. The homes are the show, so do a self-guided loop down Prytania and First Streets. See Lafayette Cemetery through the gates, since it is closed inside, lunch on Magazine Street, and book Commander's Palace ahead for the jazz brunch. Go before 9am for photos, and stay on the busy streets after dark.",
  },
};

export function getInfographic(key: string): Infographic | null {
  return INFOGRAPHICS[key] ?? null;
}
