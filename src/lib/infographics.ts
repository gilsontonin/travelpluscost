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
  "resort-fees-at-a-glance": {
    kind: "stat",
    title: "Resort fees at a glance",
    stats: [
      { value: "$33 to $42", label: "Average US resort fee per night, about 11 percent of the room cost" },
      { value: "$25 to $60", label: "The usual range, climbing past $55 in Las Vegas and Hawaii" },
      { value: "28 percent", label: "Share of US hotels charging one in 2025, up from 2 percent in 2010" },
      { value: "$2.9 billion", label: "Collected in resort and amenity fees by the hotel industry in a year" },
      { value: "1997", label: "When the first mandatory resort fees appeared, mostly in Las Vegas" },
    ],
  },
  "why-hotels-charge-resort-fees": {
    kind: "steps",
    title: "How the resort fee trick works",
    steps: [
      { title: "Quote the low number", detail: "The hotel advertises $199 and leaves the $45 fee out, so it looks cheaper than the honest hotel next door." },
      { title: "Win the comparison", detail: "Travel sites sort by price, so the lower headline number gets the click. The FTC calls this drip pricing." },
      { title: "Dodge the commission", detail: "For years the fee sat outside the room rate, so the hotel kept all of it and paid the booking site nothing on that part." },
      { title: "Collect at the desk", detail: "The fee lands after you have stopped shopping, free money on a stay you already booked." },
    ],
  },
  "resort-fees-by-place": {
    kind: "stat",
    title: "Where resort fees cost the most",
    stats: [
      { value: "$54 to $59", label: "Top fees in Las Vegas and Hawaii, the Hilton Hawaiian Village hits $59 a night" },
      { value: "$30 to $50", label: "Typical range in New York City, where destination fees spread fast after 2016" },
      { value: "About $50", label: "Marriott's average fee when charged, the highest of the big chains" },
      { value: "Over $100", label: "The most extreme fee found, a Ritz Carlton Reserve in Puerto Rico" },
    ],
  },
  "ftc-junk-fee-rule": {
    kind: "compare",
    title: "The FTC junk fees rule, effective May 12, 2025",
    left: "What it does",
    right: "What it does not do",
    rows: [
      { label: "The price", left: "Forces the all in total up front, fees included", right: "Does not cap or lower the fee" },
      { label: "The fee", left: "Bans hiding a mandatory fee", right: "Does not ban the fee itself" },
      { label: "The math", left: "A $199 room plus a $39 fee must show $238", right: "The hotel can still charge the $39" },
      { label: "The teeth", left: "Penalties up to $53,088 per violation", right: "Taxes can still be added at the end" },
    ],
  },
  "how-to-avoid-resort-fees": {
    kind: "steps",
    title: "Four ways to skip a resort fee",
    steps: [
      { title: "Book points at Hilton or Hyatt", detail: "Both waive resort fees on award stays booked entirely with points, at every tier. Marriott does not." },
      { title: "Reach Hyatt Globalist", detail: "The only major elite status that waives the fee on regular cash stays, not just award nights." },
      { title: "Pick a hotel with no fee", detail: "Drury, every Disney resort, and most select service brands skip it. ResortFeeChecker lists the fee before you book." },
      { title: "Dispute a closed amenity", detail: "If the pool or gym was shut, the fee bought a service you could not use. Ask the manager, then a card chargeback." },
    ],
  },
  "where-to-stay-in-maui-kaanapali-vs-kihei": {
    kind: "compare",
    title: "Kaanapali or Kihei, the two first timer bases",
    left: "Kaanapali (West)",
    right: "Kihei (South)",
    rows: [
      { label: "Vibe", left: "Lively resort beach", right: "Casual condos and plate lunch" },
      { label: "Price level", left: "Mid to high", right: "Value, the cheapest area" },
      { label: "Lodging", left: "Big resorts on the sand", right: "Condos with a kitchen and lanai" },
      { label: "Beaches", left: "Kaanapali Beach, Black Rock", right: "Kamaole I, II and III" },
      { label: "Drive from OGG airport", left: "About 45 to 60 minutes", right: "About 30 minutes" },
    ],
  },
  "where-to-stay-in-maui-condo-strip-stats": {
    kind: "stat",
    title: "The midrange West Maui condo strip",
    stats: [
      { value: "Honokowai", label: "Small beach park and a Saturday farmers market, the value end of the strip" },
      { value: "Kahana", label: "Sits a little higher with bigger condo units, good for families" },
      { value: "Napili", label: "Prettiest and priciest of the three, anchored by protected Napili Bay" },
      { value: "Kahekili Beach", label: "Underrated snorkeling at the north end of Kaanapali" },
      { value: "Under a resort room", label: "A one bedroom condo here often lands well below a resort room ten minutes south" },
    ],
  },
  "where-to-stay-in-maui-how-to-pick": {
    kind: "steps",
    title: "How to pick where to stay in Maui",
    steps: [
      { title: "Pick the coast first", detail: "The sunny South side suits couples and budgets. The lively West side is the easy first timer base. This one call narrows the whole island." },
      { title: "Pick the town second", detail: "Within the coast, choose by trip. Kihei for value, Wailea for luxury, Kaanapali for a walkable resort beach, Kapalua for quiet snorkeling and golf." },
      { title: "Pick the lodging type third", detail: "A resort buys you a pool and housekeeping. A condo or rental buys you a kitchen and room to spread out, often for less." },
      { title: "Pick the hotel last", detail: "Only after the side and the town are settled. Search the live rate rather than trusting a figure in a guide." },
    ],
  },
  "where-to-stay-in-maui-rental-licensing-tip": {
    kind: "callout",
    title: "Book a licensed rental, not a too good to be true one",
    body: "Hawaii has tightened its short term rental rules in recent years, so confirm a listing is legitimate and licensed before you pay. The same building can hold a dated studio and a renovated oceanfront unit, so read the specific listing, not just the complex name, and you will avoid a surprise at check in.",
  },
  "where-to-stay-in-telluride-base-quickfacts": {
    kind: "stat",
    title: "The Two Telluride Bases at a Glance",
    stats: [
      { value: "Town of Telluride", label: "Victorian mining town from 1878, best for dining, nightlife and festivals, down in the box canyon" },
      { value: "Mountain Village", label: "Purpose built resort base around 9,500 feet, best for ski in, ski out luxury at the top of the gondola" },
      { value: "Lift 7 plus the gondola", label: "How you reach the slopes from town, a few minutes either way" },
      { value: "Steps to the lifts", label: "Many Mountain Village properties put you on snow, so ski days start at the door" },
      { value: "Widest price range", label: "The town holds the inns, hostel and condos, so the value sits downtown" },
    ],
  },
  "where-to-stay-in-telluride-town-vs-village": {
    kind: "compare",
    title: "Town of Telluride vs Mountain Village",
    left: "Town of Telluride",
    right: "Mountain Village",
    rows: [
      { label: "Feel", left: "Historic, walkable, lively", right: "Modern resort village, quiet" },
      { label: "Best for", left: "Dining, nightlife and festivals", right: "Luxury, families, convenience" },
      { label: "Ski access", left: "Lift 7 and the free gondola, a few minutes up", right: "Ski in, ski out, steps to the lifts" },
      { label: "Elevation", left: "Down in the box canyon", right: "Up around 9,500 feet" },
      { label: "Prices", left: "The widest range, where the value sits", right: "The bigger luxury hotels, at prices to match" },
    ],
  },
  "where-to-stay-in-telluride-how-to-pick": {
    kind: "steps",
    title: "How to Pick Your Telluride Base",
    steps: [
      { title: "Start from the trip, not the hotel", detail: "Skiers who want convenience lean to Mountain Village. First timers, foodies and festival goers do best in the Town of Telluride." },
      { title: "Set your ski access", detail: "Want to roll out of bed onto a run, book Mountain Village. Happy to ride the free gondola each morning, the town costs you only a few minutes." },
      { title: "Match the season", detail: "Winter is skiing with Christmas and Presidents week the busiest. Summer is festivals and hiking. Late September brings the golden aspens." },
      { title: "Work the budget", detail: "Budgets stretch furthest at the town inns, the hostel, or a down valley rental. Nothing in Telluride is truly cheap, but the town holds the range." },
      { title: "Book early for peak weeks", detail: "Both bases sell out for Christmas, Presidents week and festival dates, and the prices climb with demand, so reserve the moment dates are announced." },
    ],
  },
  "where-to-stay-in-telluride-getting-there": {
    kind: "stat",
    title: "Three Ways to Reach Telluride",
    stats: [
      { value: "Montrose Regional Airport", label: "About an hour and a half away by car, the most flights and the most reliable weather, what most visitors use" },
      { value: "Telluride Regional Airport", label: "The highest commercial airport in the country, spectacular, but flights cancel for weather often enough to be a coin flip" },
      { value: "6.5 hours from Denver", label: "The drive in over some of the prettiest mountain passes in the Rockies" },
      { value: "About 5 hours from Albuquerque", label: "The other long drive option, also over high mountain passes" },
      { value: "Car free is possible", label: "The town is walkable and the gondola is free, so a car only helps for Montrose or day trips" },
    ],
  },
  "where-to-stay-in-kauai-nightly-rates": {
    kind: "stat",
    title: "What a Kauai night runs, by format",
    stats: [
      { value: "$600+", label: "Luxury resorts in season, the Poipu marquees and 1 Hotel Hanalei Bay, including taxes" },
      { value: "$300 to 500", label: "Beachfront condos within walking distance of the sand, a kitchen and a washer included" },
      { value: "$250 to 300", label: "Budget hotels like Kauai Shores and the Kauai Inn, often with free parking and Wi-Fi" },
      { value: "9.4", label: "Top guest score on the island, shared by Koloa Landing, Ko'a Kea and Marriott's Kauai Lagoons" },
    ],
  },
  "where-to-stay-in-kauai-poipu-vs-kapaa": {
    kind: "compare",
    title: "Poipu versus the East Side, sun or value",
    left: "Poipu, South Shore",
    right: "Kapaa and Wailua, East Side",
    rows: [
      { label: "The feel", left: "Sunny resort row, the most polish", right: "Central town and beach, a home base" },
      { label: "The rate", left: "Mid to high, the resorts cluster here", right: "Low to mid, lower than Poipu or Princeville" },
      { label: "The swimming", left: "Calm crescent at Poipu Beach, gentle year round", right: "Beaches for strolling, you drive for the best water" },
      { label: "Drive to the airport", left: "About 25 minutes, roughly 13 miles", right: "A few minutes, you are next to Lihue" },
      { label: "Best for", left: "First timers, families, sun", right: "Value, longer stays, a central base" },
    ],
  },
  "where-to-stay-in-kauai-how-to-pick": {
    kind: "steps",
    title: "How to pick where to stay in Kauai",
    steps: [
      { title: "Start with sun or scenery", detail: "Choose the dry South Shore for reliable sun and calm swimming, or the lush North Shore for the waterfalls and the Na Pali coast." },
      { title: "Weigh the drive against the trip", detail: "Remember there is one road and no loop, so commit to one side if you are staying put, or base on the central East Side to reach both ends." },
      { title: "Pick the format that fits the bill", detail: "A full service resort buys pools and daily service, while a condo with a kitchen and a washer turns a week from a splurge into a value." },
      { title: "Split a longer stay", detail: "For a week or more, book a few nights in Poipu for the sun and a few in Princeville for the scenery, and skip the daily cross island drive." },
      { title: "Book on your exact dates", detail: "Rates move daily, so search the real nights you are traveling rather than trusting a stamped figure from a travel site." },
    ],
  },
  "where-to-stay-in-kauai-split-stay-tip": {
    kind: "callout",
    title: "The split stay move for a week",
    body: "If you have five days or more, do not pick a single side. Spend a few nights in Poipu for the reliable sun and calm swimming, then move north to Princeville for Hanalei Bay and the Na Pali coast. You wake up in both Kauais and you are not driving 45 minutes across the island every single day. Build in one buffer day for weather, and if the North Shore is socked in, flip the plan and chase the sun south.",
  },
  "where-to-stay-in-wisconsindells-areas": {
    kind: "stat",
    title: "The Three Bases, at a Glance",
    stats: [
      { value: "Downtown Dells", label: "Walkable historic strip on the river, best for first timers with no car, about 10 to 15 minutes from the big waterparks" },
      { value: "Lake Delton", label: "The village by the parks, go karts and the lake, best for families who want a walk to a slide, not a drive" },
      { value: "Parkway resorts", label: "Hotel row by the big parks, slides minutes away without the bundled direct only resort bill" },
      { value: "Black Hawk Motel", label: "Downtown gem scoring 9.6, walkable strip and an outdoor pool, no 600 room mega resort needed" },
      { value: "Staybridge Suites", label: "The biggest bookable Lake Delton base, 9.1 across more than a thousand reviews, all suite with kitchens" },
      { value: "Wingate by Wyndham", label: "A waterpark you can actually book on one honest bill, scores well across 965 reviews, free breakfast" },
    ],
  },
  "where-to-stay-in-wisconsindells-downtown-vs-delton": {
    kind: "compare",
    title: "Downtown Dells vs Lake Delton",
    left: "Downtown Dells",
    right: "Lake Delton",
    rows: [
      { label: "The feel", left: "Walkable historic strip on the Wisconsin River", right: "The village by the parks, go karts and the lake" },
      { label: "Best for", left: "First timers and couples who'd rather walk than drive", right: "Families doing the waterparks every day" },
      { label: "To the waterparks", left: "About 10 to 15 minutes by car", right: "A walk to a few, minutes to the rest" },
      { label: "Need a car", left: "No, the strip, the docks and the boat tours are a stroll", right: "Yes for the daily hops, but the slides are close" },
      { label: "The draw", left: "The river gorge, the Original Wisconsin Ducks, the supper clubs", right: "Mt. Olympus, the parkway slides and a sand beach lake" },
    ],
  },
  "where-to-stay-in-wisconsindells-cheapest-months": {
    kind: "callout",
    title: "When the Dells Is Cheapest",
    body: "Want the slides for less? January and the stretch from October into November are typically the cheapest months, because the indoor waterparks run year round even when the outdoor parks close. A January waterpark weekend, toasty inside while it snows past the window, is one of the Midwest's better value family trips. Summer, June through August, is peak, so if you come then, book early.",
  },
  "where-to-stay-in-wisconsindells-how-to-pick": {
    kind: "steps",
    title: "How to Pick Where to Stay",
    steps: [
      { title: "Name the trip", detail: "If it is the river, the boat tours and the strip, lean downtown. If it is slides every day, lean Lake Delton and the parkway." },
      { title: "Decide on the car", detail: "Downtown lets you leave the car parked and walk. Out by the parks you will drive the short hops between the parkway resorts." },
      { title: "Pick the slide plan", detail: "For a waterpark on one honest bill, book a hotel with its own park like the Wingate. The mega resorts, Kalahari, Wilderness and Great Wolf, book direct with wristbands." },
      { title: "Match the budget", detail: "Value brands and indie motels off the parkway, like the Sleep Inn or All Star Inn, give you an indoor pool and free breakfast for far less than a bundled resort." },
      { title: "Book ahead for summer", detail: "June through August is peak and the good rooms go first, so lock the dates early, or come off season for the lower rates." },
    ],
  },
  "where-to-stay-in-sanfrancisco-nobhill-vs-marina": {
    kind: "compare",
    title: "Nob Hill vs the Marina, Two Quiet Bases",
    left: "Nob Hill",
    right: "The Marina and Cow Hollow",
    rows: [
      { label: "The feel", left: "Classic, hilly, hotel grandeur", right: "Trendy, residential, bayfront" },
      { label: "Best for", left: "Couples, views, a quieter base", right: "Couples, calm, fresh air" },
      { label: "Getting around", left: "Two cable car lines, a short climb to downtown", right: "A bus or rideshare from downtown" },
      { label: "The view", left: "Big city and bay views from the hilltop", right: "Golden Gate Bridge from Marina Green and Crissy Field" },
      { label: "The catch", left: "Real hills, the postcard climb is also your commute", right: "Off the transit spine, budget for buses downtown" },
    ],
  },
  "where-to-stay-in-sanfrancisco-other-hoods": {
    kind: "stat",
    title: "Other Neighborhoods, at a Glance",
    stats: [
      { value: "Chinatown", label: "The oldest in the country, a stop you walk through, not really a base" },
      { value: "The Mission", label: "The sunniest, liveliest district, best taquerias, a BART ride from the sights" },
      { value: "The Castro", label: "Historic LGBTQ heart since the 1970s, friendly, walkable, a few small inns" },
      { value: "Pacific Heights and Japantown", label: "Leafy, upscale and residential, pretty but light on hotels" },
      { value: "The Richmond and Sunset", label: "Near Ocean Beach and the park, foggy and the longest commute downtown" },
    ],
  },
  "where-to-stay-in-sanfrancisco-block-check": {
    kind: "callout",
    title: "Check the Block, Not the District",
    body: "A cheap downtown rate is almost always a location tell. The Tenderloin and mid Market sit right beside the prime hotels, so a bargain often means a few blocks closer to the rough edge. Before you book, pin the exact address, read the cross streets, and confirm a hotel on the good side of Geary or Mason rather than the block southwest of it. Two minutes on the map saves the late night walk you do not want.",
  },
  "where-to-stay-in-sanfrancisco-how-to-pick": {
    kind: "steps",
    title: "How to Pick Where to Stay",
    steps: [
      { title: "Match the area to your trip", detail: "Union Square for a first visit, Nob Hill for views, the Wharf for families, the Marina for calm, SoMa or the Embarcadero for a modern central room." },
      { title: "Stay central and skip the car", detail: "The city is seven miles across and walkable, so a central base turns the cable cars, Muni and BART into a backup rather than a daily commute." },
      { title: "Pin the exact address", detail: "Blocks change corner to corner near the Tenderloin and mid Market, so check the cross streets before you book, not just the neighborhood name." },
      { title: "Search your real dates", detail: "Rates move daily, so price your exact nights rather than trusting a stamped figure, with midweek and the rainy winter weeks the best value." },
    ],
  },
  "where-to-stay-in-sanantonio-areas-at-a-glance": {
    kind: "stat",
    title: "The San Antonio areas, who each suits",
    stats: [
      { value: "River Walk and downtown", label: "first timers, couples and no car trips, mid to high rates" },
      { value: "The Pearl and Broadway", label: "foodies and repeat visitors, walkable, mid to high rates" },
      { value: "Southtown and King William", label: "art, history and a local feel, mid rates" },
      { value: "Near SeaWorld and Six Flags", label: "families and theme park days, low to mid rates" },
      { value: "Stone Oak and the airport", label: "value, quiet and early flights, the lowest rates" },
    ],
  },
  "where-to-stay-in-sanantonio-pearl-vs-southtown": {
    kind: "compare",
    title: "The Pearl or Southtown?",
    left: "The Pearl and Broadway",
    right: "Southtown and King William",
    rows: [
      { label: "The draw", left: "A weekend farmers market and the city's best new restaurants", right: "Galleries, micro distilleries and the best tacos in town" },
      { label: "The vibe", left: "Polished food district, north of downtown", right: "Leafy historic homes, south of downtown" },
      { label: "Best for", left: "Foodies and repeat visitors", right: "Art, history and a quieter local feel" },
      { label: "The event", left: "The Pearl farmers market every weekend", right: "The First Friday art walk every month" },
      { label: "Where to book", left: "The north River Walk, a walk or barge from the Pearl", right: "The south River Walk, a short walk up to it" },
    ],
  },
  "where-to-stay-in-sanantonio-how-to-choose": {
    kind: "steps",
    title: "How to pick your San Antonio base",
    steps: [
      { title: "Start with the river question", detail: "If it is your first trip and you want to skip the car, base on the River Walk and downtown. Everything else is a trade against that." },
      { title: "Match the area to the trip", detail: "The Pearl or Southtown for food and a local feel, the northwest for the theme parks, the Medical Center or Stone Oak when the nightly rate matters most." },
      { title: "Weigh character against convenience", detail: "Historic River Walk hotels trade on location and charm. The suburban chains give you newer, larger rooms with free parking and breakfast for less." },
      { title: "Search your exact dates", detail: "Prices move daily and the only honest number is the live one, so check your real nights rather than trusting a stamped figure." },
    ],
  },
  "where-to-stay-in-sanantonio-value-tip": {
    kind: "callout",
    title: "The one calendar that moves the rate",
    body: "Fiesta runs 11 days every late April and downtown sells out as rates climb, so book a few months ahead if you are coming for it. The rest of the year, a midweek stay in the spring or fall shoulders stretches the dollar furthest, and the Medical Center, Stone Oak or the airport undercut downtown by a wide margin when the rate matters most.",
  },
  "where-to-stay-in-oahu-bases": {
    kind: "stat",
    title: "Oahu's four main bases at a glance",
    stats: [
      { value: "Waikiki", label: "First timers and no car trips, the airport is close and the bus reaches most of the island" },
      { value: "Ko Olina", label: "Families with young kids, calm man made lagoons about 40 minutes west of the airport" },
      { value: "North Shore", label: "Surfers and quiet seekers, big winter surf and mostly vacation rentals, plan to drive" },
      { value: "Kailua", label: "Beach purists and home rentals, a 30 minute drive to Waikiki so a car is close to essential" },
      { value: "Ala Moana", label: "Shoppers and longer stays, next to the largest open air mall with Waikiki's access" },
    ],
  },
  "where-to-stay-in-oahu-waikiki-vs-koolina": {
    kind: "compare",
    title: "Waikiki or Ko Olina",
    left: "Waikiki",
    right: "Ko Olina",
    rows: [
      { label: "Best for", left: "First timers, nightlife and dining", right: "Families with young kids" },
      { label: "Water", left: "Gentle, good for a first ocean swim", right: "Calm, sheltered man made lagoons" },
      { label: "From the airport", left: "Short transfer, very close", right: "About 40 minutes west" },
      { label: "Car needed", left: "No, walk or take the bus", right: "Yes for day trips off the resort" },
      { label: "Around you", left: "Hotels, restaurants and shopping on foot", right: "Self contained resorts, far from Honolulu sights" },
    ],
  },
  "where-to-stay-in-oahu-how-to-pick": {
    kind: "steps",
    title: "How to pick your Oahu base",
    steps: [
      { title: "Start from the trip, not the map", detail: "Decide what you came for, nightlife and dining, calm water for kids, winter surf, or the island's best beaches, then let that choose the area." },
      { title: "Default to Waikiki for a first visit", detail: "It has the widest choice of hotels, the easiest beach and dining access, and the shortest airport transfer, all without a car." },
      { title: "Match a special trip to its area", detail: "Ko Olina for young kids and calm lagoons, the North Shore for winter surf, or Kailua and Lanikai when great beaches matter more than nightlife." },
      { title: "Decide on a rental car", detail: "You can skip it from a Waikiki base, but the North Shore, the Windward beaches and Ko Olina all reward a car, so rent one for the days you explore." },
      { title: "Book ahead in winter", detail: "Waikiki and Ko Olina fill up from November to March and around the holidays, when rates and crowds both peak, so reserve early." },
    ],
  },
  "where-to-stay-in-oahu-budget-tip": {
    kind: "callout",
    title: "A money saving note for a lagoon trip",
    body: "You do not have to pay resort rates to enjoy Ko Olina's calm water. Disney's Aulani and the Four Seasons book direct, but the Hampton Inn and Suites in nearby Kapolei is the rate verified pick that puts you minutes from the lagoons without the resort bill.",
  },
  "where-to-stay-in-moab-areas": {
    kind: "stat",
    title: "The Three Moab Bases, at a Glance",
    stats: [
      { value: "Downtown Moab", label: "First timers and bikers, walkable to restaurants and breweries, about 5 minutes to Arches" },
      { value: "North end, near Arches", label: "Early park starts, brand hotels closest to the gate booth" },
      { value: "Colorado River, Highway 128", label: "Scenery and a splurge, red rock river resorts about 15 to 20 minutes from town" },
      { value: "Castle Valley", label: "Total quiet and 360 degree views, about 20 minutes further up Highway 128, mostly books direct" },
      { value: "Vacation rentals and glamping", label: "Space for families and groups, or canvas tents out on the rock, almost all book direct" },
    ],
  },
  "where-to-stay-in-moab-downtown-vs-river": {
    kind: "compare",
    title: "Downtown Moab vs the Colorado River Resorts",
    left: "Downtown Moab",
    right: "Colorado River, Highway 128",
    rows: [
      { label: "The feel", left: "Main Street, central and walkable", right: "Red rock ranch resort under the cliffs" },
      { label: "To restaurants and bars", left: "Walk out the door", right: "Drive about 15 to 20 minutes into town" },
      { label: "To the Arches gate", left: "About 5 minutes north", right: "A short drive back through town" },
      { label: "Best for", left: "First timers, bikers, no car needed in town", right: "Scenery, families wanting on site activities, a splurge" },
      { label: "Booking", left: "Bookable here at one honest rate", right: "Many ranch resorts book direct on their own sites" },
    ],
  },
  "where-to-stay-in-moab-pick": {
    kind: "steps",
    title: "How to Pick Where to Stay in Moab",
    steps: [
      { title: "Pick walkable or scenic first", detail: "Decide whether you want to walk to dinner downtown, or wake up under the red cliffs on the river. That one call sorts most of the choice." },
      { title: "Match the area to your plan", detail: "Downtown or the north end for early Arches starts and the Slickrock trails. Highway 128 for scenery over convenience." },
      { title: "Decide hotel or rental", detail: "A traditional hotel here means no chores and no drive. Rentals and glamping add space and quiet, but most book direct on their own sites." },
      { title: "Plan the season around the heat", detail: "Aim for spring or fall. Summer routinely tops 100 degrees Fahrenheit on exposed slickrock, so book a hotel with a pool for the midday hours." },
      { title: "Search the live rate and sort", detail: "Rates swing hard by season, so check the current Moab price and sort by what matters to you rather than trusting a stamped number." },
    ],
  },
  "where-to-stay-in-moab-heat": {
    kind: "callout",
    title: "Summer in Moab Is a Safety Decision",
    body: "In summer, Moab is not a place to wing it. Carry at least a gallon of water per person per day, start hikes at first light, and treat the midday hours as time for the pool, a brewery, or an air conditioned drive out to a Canyonlands overlook. The desert is gorgeous and completely indifferent to your itinerary, so plan around it.",
  },
  "where-to-stay-in-albuquerque-areas-at-a-glance": {
    kind: "stat",
    title: "The six areas, who each one suits",
    stats: [
      { value: "Old Town", label: "first timers, families and no car travelers, mid to high rates" },
      { value: "Downtown", label: "nightlife, business and walking home from a show, mid rates" },
      { value: "Nob Hill", label: "foodies and younger travelers on Route 66, mid rates" },
      { value: "Uptown", label: "shoppers and the Sandia foothills, mid rates" },
      { value: "North Valley", label: "nature, quiet and the Balloon Fiesta, low to high rates" },
      { value: "Airport", label: "budgets and early flights, about 5 miles out, low rates" },
    ],
  },
  "where-to-stay-in-albuquerque-downtown-vs-nobhill": {
    kind: "compare",
    title: "Downtown or Nob Hill?",
    left: "Downtown",
    right: "Nob Hill",
    rows: [
      { label: "The feel", left: "Urban Route 66, theaters and breweries", right: "Hip Route 66, neon signs and patios" },
      { label: "Best for", left: "Nightlife, business and a night out", right: "Foodies, couples and younger travelers" },
      { label: "The hotels", left: "Historic landmarks like the 1939 Hotel Andaluz", right: "Independents and restored motor courts like El Vado" },
      { label: "Getting around", left: "Walk to a show, the Rail Runner to Santa Fe", right: "Walk the cafes and breweries, leave the car parked" },
      { label: "Watch out for", left: "Central Avenue gets edgier a few blocks out", right: "The chains sit on the edges, a few blocks walk in" },
    ],
  },
  "where-to-stay-in-albuquerque-how-to-pick": {
    kind: "steps",
    title: "How to pick your Albuquerque base",
    steps: [
      { title: "Start with the trip", detail: "Old Town for a first visit and museums, Nob Hill or Downtown for food and Route 66, the north end for the Balloon Fiesta." },
      { title: "Decide if you want to walk", detail: "Old Town and Nob Hill reward leaving the car parked, the corridors trade character for value and easy parking." },
      { title: "Pick one base and stay put", detail: "The districts sit a few miles apart, so most people settle in one walkable area and drive to the rest." },
      { title: "Plan for a car", detail: "There is no rail link from the airport, and the tram, the petroglyphs and the Fiesta all need a car, so a rental is the norm." },
    ],
  },
  "where-to-stay-in-albuquerque-fiesta-booking": {
    kind: "callout",
    title: "Book a year ahead for Fiesta week",
    body: "The Balloon Fiesta fills the first nine days of October, and the city sells out close to a year ahead at its highest rates of the year. Many hotels set multi night minimums for the week. Book the I-25 north corridor or the North Valley last winter, not last week, or you will end up commuting from Santa Fe.",
  },
  "where-to-stay-in-staugustine-area-snapshot": {
    kind: "stat",
    title: "St. Augustine Areas at a Glance",
    stats: [
      { value: "Historic District", label: "First timers, history and no car visitors, about 10 to 15 minutes to the beach" },
      { value: "Anastasia Island", label: "Beach days and families, right on the sand about 6 miles east of downtown" },
      { value: "Vilano Beach", label: "Families wanting quiet and value, a barrier island just north, a few minutes to the sand" },
      { value: "Uptown and the highway", label: "Budgets and road trips, cheapest beds near US-1 and I-95, about 15 to 20 minutes to the beach" },
      { value: "Lincolnville", label: "Architecture lovers and longer stays, a quieter Victorian neighborhood a short walk from the fort" },
    ],
  },
  "where-to-stay-in-staugustine-parking-tip": {
    kind: "callout",
    title: "Skip the Downtown Parking Fight",
    body: "Base where you can walk and you barely touch the car for a day or two. Downtown lots fill fast and a garage spot can run about $40 during Nights of Lights, so when you stay farther out, lean on the free park and ride shuttles and the hop on Old Town Trolleys instead of circling for a space.",
  },
  "where-to-stay-in-staugustine-how-to-pick": {
    kind: "steps",
    title: "How to Pick Your St. Augustine Base",
    steps: [
      { title: "Decide history or sand", detail: "This is the one question that splits the whole city. Pick the Historic District for cobblestones and the fort, pick Anastasia Island or Vilano Beach for the Atlantic and the dunes." },
      { title: "Match the area to your travelers", detail: "First timers and history lovers do best downtown, families wanting a pool and the ocean lean to the beach, and budget trips or one night stopovers win out on the highway." },
      { title: "Weigh the car and parking", detail: "Downtown you can park and walk, the beaches and Vilano need wheels. Downtown parking is genuinely tight, so factor that into where you sleep." },
      { title: "Flag Nights of Lights early", detail: "If you are coming from late November to mid January, base in or beside the Historic District and book months ahead, because rooms near the lights go first." },
      { title: "Book your exact dates live", detail: "Once the area fits, rates move daily, so search your real dates rather than trusting a stamped price, and you pay one small flat fee that is the same for everyone." },
    ],
  },
  "where-to-stay-in-savannah-pick-base-steps": {
    kind: "steps",
    title: "How to Pick Your Savannah Base in Four Steps",
    steps: [
      { title: "Decide if you want to walk everything", detail: "If yes, base in the Historic District. It is a flat, walkable grid of 22 oak shaded squares where the mansions, restaurants and the river are all on foot." },
      { title: "Pick the buzz or the calm", detail: "The north end by River Street and City Market is lively and best for first timers and families. The south end by Forsyth Park is quiet and romantic." },
      { title: "Match the area to your trip", detail: "Choose Plant Riverside for a modern waterfront splurge, an all suite hotel for a family, and Midtown or the Southside when the nightly rate matters most." },
      { title: "Then book the hotel by price and parking", detail: "Pick the property whose location, rate and parking fit your trip. Many historic district hotels charge for parking, so check the fee if you are driving." },
    ],
  },
  "where-to-stay-in-savannah-local-neighborhoods": {
    kind: "stat",
    title: "Savannah's Residential Neighborhoods, Off the Tourist Trail",
    stats: [
      { value: "Starland District", label: "The city's hippest pocket, muraled streets, indie coffee and breweries, just south of Forsyth Park" },
      { value: "Victorian District", label: "A leafy stretch of colorful, gingerbread trimmed Victorian homes next to Starland" },
      { value: "Thomas Square", label: "Quiet, tree lined options a little farther out, good for a longer stay" },
      { value: "Ardsley Park", label: "A calm residential base where a lot of locals actually eat and drink" },
      { value: "10 to 20 minutes", label: "Walk or a short ride from downtown to these pockets" },
    ],
  },
  "where-to-stay-in-savannah-parking-tip": {
    kind: "callout",
    title: "The Real Cost of a Cheaper Room Downtown",
    body: "Parking is the hidden line on a Savannah bill. Many historic district hotels charge for parking or use valet, and downtown garages and metered spots fill up fast. A walkable base means you can park once and leave the car, which saves on parking and rideshares and often offsets a higher room rate. If you are driving, check the parking fee or prefer a hotel with parking included.",
  },
  "where-to-stay-in-neworleans-bourbon-noise": {
    kind: "callout",
    title: "The Bourbon Street noise rule",
    body: "You can have the French Quarter atmosphere and still sleep, but the exact block decides it. Bourbon Street and the few streets around it run loud and late every night. Book two or three blocks toward Royal, Chartres or Esplanade, the lower Quarter, and the volume drops to a civilized hum.",
  },
  "where-to-stay-in-neworleans-pick-steps": {
    kind: "steps",
    title: "How to pick where to stay in New Orleans",
    steps: [
      { title: "Start with the trip you are taking", detail: "A first visit points to the French Quarter for atmosphere and walkability. A quieter, better value night points to the CBD next door." },
      { title: "Match the area to your interest", detail: "Museums and galleries suit the Warehouse District, live music suits the Marigny, and a calm, leafy stay suits the Garden District." },
      { title: "Pick the right block, not just the area", detail: "In the French Quarter, book toward Royal, Chartres or Esplanade to stay away from the Bourbon Street noise." },
      { title: "Keep inside the tourist corridor", detail: "Stay within the French Quarter, CBD, Warehouse District, Marigny or the Garden District, and treat everywhere else as a place to visit by day." },
      { title: "Then book the hotel for your exact dates", detail: "Rates swing hard with the calendar, so search your real travel dates rather than trusting a stamped price." },
    ],
  },
  "where-to-stay-in-neworleans-price-by-area": {
    kind: "stat",
    title: "What a central New Orleans room runs by area",
    stats: [
      { value: "$120 to $200", label: "A solid central room most of the year, before the calendar takes over" },
      { value: "Under $130", label: "Central Business District and the edges of the French Quarter, the best value rooms" },
      { value: "Mid to high", label: "French Quarter and the Warehouse District, atmosphere and museums at a premium" },
      { value: "Low to mid", label: "Faubourg Marigny, the local, live music base for less" },
      { value: "Lower still", label: "Mid-City and Uptown, where rates drop and you ride the streetcar in" },
      { value: "Double or triple", label: "A Mardi Gras or Jazz Fest weekend, booked months ahead" },
    ],
  },
  "magazine-stretches": {
    kind: "compare",
    title: "Pick your stretch of Magazine Street",
    left: "What it is for",
    right: "The shops",
    rows: [
      { label: "2000 to 2300, Lower Garden", left: "Vintage and local gifts", right: "Century Girl, Trashy Diva, Dirty Coast" },
      { label: "3000 to 4000, Napoleon to Louisiana", left: "Antiques, art, and jewelry", right: "Magazine Antique Mall, Mignon Faget" },
      { label: "4200 to 4800, Uptown", left: "James Beard dining", right: "La Petite Grocery, Shaya, Casamento's" },
      { label: "5500 to 6100, Uptown", left: "Old money boutiques", right: "Perlis, Azby's, Hazelnut" },
    ],
  },
  "magazine-eat": {
    kind: "stat",
    title: "Where to eat on Magazine Street",
    stats: [
      { value: "La Petite Grocery", label: "James Beard French-Creole, blue crab beignets, 4238" },
      { value: "Shaya", label: "best new US restaurant 2016, modern Israeli, 4213" },
      { value: "Casamento's", label: "oyster house since 1919, closed every summer, 4330" },
      { value: "Commander's Palace", label: "the 1893 landmark, a block off, jazz brunch" },
    ],
  },
  "magazine-around": {
    kind: "stat",
    title: "Getting around the six miles",
    stats: [
      { value: "Route 11 bus", label: "runs the whole street, $1.25 a ride" },
      { value: "$3 day pass", label: "bus, streetcar, and ferry, all day" },
      { value: "St. Charles streetcar", label: "one block over, Garden District to Uptown" },
      { value: "$2 an hour", label: "meters Mon to Sat, free Sundays and after 7pm" },
    ],
  },
  "christmas-nola-when": {
    kind: "stat",
    title: "The New Orleans holiday season at a glance",
    stats: [
      { value: "Late Nov to Jan 3", label: "the Christmas New Orleans Style season" },
      { value: "Low 60s by day", label: "December highs, upper 40s after dark" },
      { value: "Two price worlds", label: "early December is cheap, New Year's Eve peaks" },
      { value: "Dec 24, 7pm", label: "the levee bonfires light to guide Papa Noel" },
    ],
  },
  "christmas-nola-oaks": {
    kind: "stat",
    title: "Celebration in the Oaks",
    stats: [
      { value: "1M+ lights", label: "strung through the 800 year old oaks of City Park" },
      { value: "$25 to $40", label: "per car for the self guided driving tour" },
      { value: "$20 to $35", label: "per person walking, with rides and Storyland" },
      { value: "Free", label: "parking in City Park, a holiday miracle" },
    ],
  },
  "christmas-nola-free": {
    kind: "compare",
    title: "What is free, and what costs money",
    left: "Free",
    right: "Ticketed",
    rows: [
      { label: "Lights and fireworks", left: "New Year's Eve fireworks, the bonfires from River Road", right: "Celebration in the Oaks, $20 to $80" },
      { label: "Music and services", left: "Caroling in Jackson Square, the cathedral concert", right: "Reveillon dinners, $65 to $135" },
      { label: "Walking around", left: "The hotel lobby displays, all City Park parking", right: "Home tours, $35 to $40" },
      { label: "Indoor fun", left: "Window shopping on Magazine Street", right: "NOLA ChristmasFest skating, $25 to $30" },
    ],
  },
  "christmas-nola-bonfires": {
    kind: "callout",
    title: "Three ways to see the Christmas Eve bonfires",
    body: "They light at 7pm on December 24 in St. James Parish, about an hour upriver in Gramercy, Lutcher, and Paulina. Drive up River Road and park at the foot of the levee for the free show. Take a bus tour from the city if you would rather not drive home in the dark. Or book a riverboat that floats past the lit levee. Not in town on the Eve? The Festival of the Bonfires in Lutcher runs the second weekend of December.",
  },
  "christmas-nola-stay": {
    kind: "compare",
    title: "Where to stay for the holidays",
    left: "Best for",
    right: "Getting around and rates",
    rows: [
      { label: "French Quarter", left: "Caroling, decorations, the midnight fireworks", right: "Walk everywhere, no car needed" },
      { label: "Mid-City", left: "Celebration in the Oaks at City Park", right: "Canal streetcar, 10 minutes to the Quarter" },
      { label: "Early December", left: "Mild weather and low crowds", right: "Off season, $180 to $280 a mid range room" },
      { label: "New Year's week", left: "The whole city celebrating at once", right: "The priciest nights of the year" },
    ],
  },
  "jazz-fest-tickets": {
    kind: "stat",
    title: "What a day at Jazz Fest costs",
    stats: [
      { value: "$99 to $149", label: "single day at the gate, depending on the day of week" },
      { value: "From $399", label: "a four day weekend pass (Louisiana residents pay less)" },
      { value: "$2,099", label: "the top Big Chief VIP tier, which buys air conditioning" },
      { value: "$5", label: "kids 2 to 10, sold only at the gate" },
    ],
  },
  "jazz-fest-getting-there": {
    kind: "stat",
    title: "How to reach the Fair Grounds",
    stats: [
      { value: "None", label: "general parking at the venue, do not drive yourself" },
      { value: "~$29", label: "the Jazz Fest Express shuttle, the only ride that drops inside" },
      { value: "Outer ring", label: "where Uber and Lyft must drop, a few blocks out" },
      { value: "Route 91", label: "the city bus, within a short walk for a couple of dollars" },
    ],
  },
  "jazz-fest-stay": {
    kind: "compare",
    title: "Where to stay, by how you reach the gate",
    left: "Getting to the Fair Grounds",
    right: "The trade off",
    rows: [
      { label: "Mid-City", left: "A genuine 10 to 15 minute walk, no surge", right: "Thin hotel inventory that books up first" },
      { label: "French Quarter / CBD", left: "About 30 minutes on the Canal streetcar", right: "The most rooms and the best nightlife" },
      { label: "Marigny / Frenchmen", left: "A short ride or a long walk", right: "Closest to the late night club shows" },
    ],
  },
  "jazz-fest-food": {
    kind: "stat",
    title: "Eat these first",
    stats: [
      { value: "Crawfish Monica", label: "the best selling dish since 1983, a creamy Cajun pasta" },
      { value: "Cochon de lait", label: "slow cooked pork po boy with a crunchy slaw" },
      { value: "Mango Freeze", label: "the frozen palate cleanser, a WWOZ radio fundraiser" },
      { value: "Cards only", label: "every booth is cashless, bring a card or your phone" },
    ],
  },
  "jazz-fest-bring": {
    kind: "callout",
    title: "Pack for sun and a swamp",
    body: "Jazz Fest is rain or shine, and rain turns the dirt track to deep mud, so bring a poncho and shoes you can ruin, plus extra socks. Bags must be under 17 by 12 by 10 inches and get searched at the gate. One folding chair, a personal umbrella, sealed water, and a small soft cooler are allowed. Leave the tents, glass, outside alcohol, and pets at home.",
  },
  "jazz-fest-vs-mardigras": {
    kind: "compare",
    title: "Jazz Fest or Mardi Gras?",
    left: "Jazz Fest",
    right: "Mardi Gras",
    rows: [
      { label: "What it is", left: "A ticketed music, food, and culture festival", right: "A free, citywide street party" },
      { label: "Where", left: "One venue, the Fair Grounds", right: "Parades all over the city" },
      { label: "When", left: "Late April into early May", right: "February, on a date that moves" },
      { label: "Come for", left: "A music marathon and the food", right: "The parades and the streets" },
    ],
  },
  "nola-haunt-real-vs-legend": {
    kind: "compare",
    title: "Documented history, or tourist legend?",
    left: "Documented history",
    right: "Tourist legend",
    rows: [
      { label: "LaLaurie Mansion", left: "A real 1834 fire, seven enslaved people tortured", right: "Mad experiments, bodies in the walls" },
      { label: "Voodoo", left: "A living religion, Marie Laveau, the lwa spirits", right: "Pin stuck dolls and gift shop spells" },
      { label: "The Casket Girls", left: "Orphan brides with dowry trunks, 1728", right: "Pale vampires sealed in the convent attic" },
      { label: "The vampires", left: "Anne Rice fiction, written here in 1976", right: "Real, says nobody, including the guides" },
    ],
  },
  "nola-haunt-cemetery": {
    kind: "callout",
    title: "Visiting the Cities of the Dead",
    body: "St. Louis Cemetery No. 1 allows visits only with a licensed guide, on tours every 15 minutes from 9am. The rules are simple and they matter, do not mark the tombs, leave no offerings or coins, do not lean or climb. These are active graves where families still bury their people, not a photo backdrop.",
  },
  "nola-haunt-hotels": {
    kind: "stat",
    title: "Haunted hotels you can actually book",
    stats: [
      { value: "Bourbon Orleans", label: "the ballroom dancer, plus a $500 Ghost Camp weekend" },
      { value: "Monteleone", label: "Maurice, a child ghost, family run since 1886" },
      { value: "Andrew Jackson", label: "an 1790s orphanage, small footsteps reported" },
      { value: "Provincial", label: "a wing that was a Civil War hospital" },
    ],
  },
  "nola-haunt-tours": {
    kind: "stat",
    title: "Ghost tours, the short list",
    stats: [
      { value: "Haunted History", label: "the original, since 1995, from $30" },
      { value: "FQ Phantoms", label: "the top voted ghost and vampire walk, $22" },
      { value: "Ghost City", label: "family friendly or adults only versions" },
      { value: "2 to 3 weeks", label: "how far ahead to book in October" },
    ],
  },
  "nola-haunt-when": {
    kind: "stat",
    title: "When to come for the ghosts",
    stats: [
      { value: "Year round", label: "tours run nightly in every season" },
      { value: "October", label: "peak Halloween, book 2 to 3 months ahead" },
      { value: "Double", label: "what hotels charge on Halloween weekend" },
      { value: "Nov to Mar", label: "cheaper, kinder weather, quiet cemeteries" },
    ],
  },
  "nola-bach-stay": {
    kind: "compare",
    title: "Central hotel, or a house in the suburbs?",
    left: "Central French Quarter hotel",
    right: "Cheaper rental, 20 minutes out",
    rows: [
      { label: "Getting to Bourbon Street", left: "A short walk, at any hour", right: "A ride, and a surge at 1am" },
      { label: "Keeping the group together", left: "One block of rooms", right: "Scattered and texting" },
      { label: "The real budget", left: "Higher room, lower everything else", right: "Lower room, eighty dollars in rides" },
      { label: "The vibe", left: "In the middle of it all", right: "A quiet street and an early night" },
    ],
  },
  "nola-bach-when": {
    kind: "stat",
    title: "When to go for a New Orleans bachelorette",
    stats: [
      { value: "Spring", label: "March to May, the prettiest weather of the year" },
      { value: "Fall", label: "September to November, festival season" },
      { value: "Avoid", label: "the summer heat and the 90s humidity" },
      { value: "Book a year out", label: "for a Mardi Gras or Jazz Fest weekend" },
    ],
  },
  "nola-bach-plan": {
    kind: "steps",
    title: "The honest three day plan",
    steps: [
      { title: "Friday, arrive and dine", detail: "Drop the bags and have a real dinner while the memories still form." },
      { title: "Saturday, one thing then the night", detail: "A daytime activity, a nap, brunch into dinner into Bourbon Street." },
      { title: "Sunday, beignets and goodbyes", detail: "Cafe du Monde, then everyone leaves on their own headache." },
    ],
  },
  "nola-bach-drinks": {
    kind: "stat",
    title: "The drinks you flew here for",
    stats: [
      { value: "Sazerac", label: "the official cocktail of New Orleans" },
      { value: "Hurricane", label: "the rum classic from Pat O Brien's" },
      { value: "Hand Grenade", label: "melon, 24 percent, handle with care" },
      { value: "Go cup", label: "plastic only, and the street is yours" },
    ],
  },
  "nola-bach-activities": {
    kind: "stat",
    title: "Daytime things that are not a bar",
    stats: [
      { value: "$35 to $119", label: "an airboat swamp tour with alligators" },
      { value: "about $150", label: "a hands on Creole cooking class" },
      { value: "about $30", label: "a two hour ghost and cemetery tour" },
      { value: "$500 and up", label: "your own hired second line parade" },
    ],
  },
  "nola-bach-cost": {
    kind: "stat",
    title: "What it costs, split across the group",
    stats: [
      { value: "$1,000 to $1,300", label: "per person for a four day weekend" },
      { value: "$220 to $280", label: "a night, mid range French Quarter hotel" },
      { value: "Split it", label: "a hotel block divides fast across a dozen people" },
      { value: "Same price", label: "our flat fee is identical for everyone" },
    ],
  },
  "nola-mgh-areas": {
    kind: "stat",
    title: "Where to stay for Mardi Gras, by area",
    stats: [
      { value: "Uptown / St. Charles", label: "On the parade route. Family vibe, oak trees, roll out of bed onto the floats." },
      { value: "CBD / Canal St", label: "Where the parades finish. Wide, central, a short walk to the Quarter." },
      { value: "French Quarter", label: "The costume scene, not the route. Walk to Canal for floats. Priciest." },
      { value: "Marigny / Bywater", label: "Roughly 30 to 40 percent cheaper, a short walk from the Quarter." },
    ],
  },
  "nola-mgh-costs": {
    kind: "stat",
    title: "What a Mardi Gras room costs",
    stats: [
      { value: "200 to 300%", label: "how much French Quarter rates jump during Carnival week" },
      { value: "$400 to $800", label: "a normal $150 to $200 room, during Mardi Gras" },
      { value: "30 to 40%", label: "what the Marigny and Bywater save vs the Quarter" },
      { value: "3 to 5 nights", label: "the minimum stay most hotels require" },
    ],
  },
  "honest-vs-surveillance": {
    kind: "compare",
    title: "Two ways to price a hotel room",
    left: "Surveillance pricing",
    right: "travelpluscost",
    rows: [
      { label: "What sets the price", left: "Your device, location & history", right: "The hotel's cost + one flat fee" },
      { label: "Same for everyone?", left: "No, it varies per person", right: "Yes, identical every search" },
      { label: "Can you verify it?", left: "No", right: "Yes, open it in another browser" },
      { label: "Hidden fees at checkout?", left: "Often", right: "No, the all in price up front" },
    ],
  },
  "maui-west-vs-south": {
    kind: "compare",
    title: "West Maui or South Maui?",
    left: "West Maui, Kāʻanapali & Kapalua",
    right: "South Maui, Wailea & Kihei",
    rows: [
      { label: "The vibe", left: "Lively resort strip, beach bars, sunsets", right: "Sunny, dry, calmer and spread out" },
      { label: "Best for", left: "First timers, families, walkable beach days", right: "Sun seekers, couples, snorkeling trips" },
      { label: "Price", left: "Mid to high, Kapalua is the priciest", right: "Kihei affordable, Wailea luxury" },
      { label: "The catch", left: "Winter rates climb. Book early", right: "Wailea runs expensive. Kihei is busier" },
    ],
  },
  "how-pricing-works": {
    kind: "steps",
    title: "How your price is built",
    steps: [
      { title: "The hotel's rate", detail: "What the hotel charges us for the room." },
      { title: "One small flat fee", detail: "The same fee for everyone, never set from your data." },
      { title: "The price you see", detail: "All in and shown up front. No surprises at the last screen." },
    ],
  },
  "keywest-by-numbers": {
    kind: "stat",
    title: "Key West by the numbers",
    stats: [
      { value: "~165 mi", label: "Miami to Key West by car, all on US-1" },
      { value: "42", label: "bridges link the island chain to the mainland" },
      { value: "90 mi", label: "from the Southernmost Point to Cuba" },
      { value: "~4 sq mi", label: "of walkable island, you rarely need a car" },
    ],
  },
  "keywest-oldtown-vs-newtown": {
    kind: "compare",
    title: "Old Town or New Town?",
    left: "Old Town",
    right: "New Town & the beaches",
    rows: [
      { label: "The vibe", left: "Historic inns, gas lamps, Duval, walk everywhere", right: "Bigger hotels, pools, Smathers Beach, parking" },
      { label: "Best for", left: "First timers, couples, no car trips", right: "Beach days, families, a lower nightly rate" },
      { label: "To Duval Street", left: "You are on it, or a few blocks off", right: "A 10-minute bike, bus, or scooter" },
      { label: "You wake up to", left: "A tin roof porch and a loud rooster", right: "A bigger room and a pool deck" },
    ],
  },
  "keywest-getting-there": {
    kind: "steps",
    title: "Getting to Key West",
    steps: [
      { title: "Fly", detail: "Key West International (EYW) sits about 10 minutes from Old Town. Most flights connect through Miami or Fort Lauderdale." },
      { title: "Drive", detail: "US-1 from Miami runs ~165 miles and 3.5 to 4 hours over 42 bridges, the Overseas Highway, one of the great American road trips." },
      { title: "Then skip the car", detail: "Old Town crosses end to end in a 20-minute walk. Bikes and scooters cover the rest, and parking is the island's real headache." },
    ],
  },
  "santabarbara-by-numbers": {
    kind: "stat",
    title: "Santa Barbara by the numbers",
    stats: [
      { value: "~95 mi", label: "up US-101 from Los Angeles, about 2 hours" },
      { value: "1925", label: "earthquake that set the red tile Spanish look" },
      { value: "1872", label: "Stearns Wharf, California's oldest working wharf" },
      { value: "~45 min", label: "north to Santa Ynez wine country" },
    ],
  },
  "santabarbara-waterfront-vs-downtown": {
    kind: "compare",
    title: "The Waterfront or Downtown?",
    left: "The Waterfront",
    right: "Downtown / State Street",
    rows: [
      { label: "The vibe", left: "Beach inns, the harbor, Stearns Wharf, bike paths", right: "Spanish plazas, shops, restaurants, wine tasting" },
      { label: "Best for", left: "Beach days, families, sunset walks", right: "Walkers, foodies, no car trips" },
      { label: "To the sand", left: "You are on it", right: "A 10 to 15 minute walk or a quick bus" },
      { label: "You wake up to", left: "Palms and the Pacific", right: "Red tile roofs and the mountains" },
    ],
  },
  "santabarbara-getting-there": {
    kind: "steps",
    title: "Getting to Santa Barbara",
    steps: [
      { title: "Drive", detail: "US-101 from Los Angeles is ~95 miles and about 2 hours up the coast. From San Francisco it is ~5 to 6 hours down." },
      { title: "Take the train", detail: "Amtrak's Pacific Surfliner drops you right downtown, one of the prettiest coastal rail rides in the country, and no parking to hunt for." },
      { title: "Fly", detail: "Santa Barbara Airport (SBA) sits in Goleta, about 15 minutes from downtown, with regional connections." },
    ],
  },
  "flagstaff-by-numbers": {
    kind: "stat",
    title: "Flagstaff by the numbers",
    stats: [
      { value: "~7,000 ft", label: "elevation, cool pines and real winters" },
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
      { label: "Nightly rate", left: "Lower, motels and chains", right: "Higher, it is a resort town" },
      { label: "To the Grand Canyon", left: "~1.5 hours north", right: "~2.5 hours" },
    ],
  },
  "flagstaff-basecamp": {
    kind: "steps",
    title: "Flagstaff as a basecamp",
    steps: [
      { title: "The Grand Canyon", detail: "The South Rim is ~80 miles north, about 1.5 hours, Flagstaff is the affordable place to sleep before a Canyon day." },
      { title: "Sedona", detail: "~45 minutes south down Oak Creek Canyon, one of Arizona's prettiest drives." },
      { title: "Snow and the Peaks", detail: "Arizona Snowbowl's slopes sit ~14 miles north. In summer the same lift runs for high country views." },
    ],
  },
  "tucson-by-numbers": {
    kind: "stat",
    title: "Tucson by the numbers",
    stats: [
      { value: "~110 mi", label: "south of Phoenix on I-10, about 2 hours" },
      { value: "2 districts", label: "of Saguaro National Park flank the city" },
      { value: "9,157 ft", label: "atop Mount Lemmon, ski runs above the desert" },
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
      { label: "Best for", left: "Walkers, foodies, no car trips", right: "Resort days, golf, Sabino Canyon hikes" },
      { label: "Nightly rate", left: "Mid, boutique and chains", right: "Higher, it is resort country" },
      { label: "You wake up to", left: "Brick storefronts and a mural", right: "Saguaros and the Santa Catalinas" },
    ],
  },
  "tucson-when-to-go": {
    kind: "steps",
    title: "When to go to Tucson",
    steps: [
      { title: "Fly or drive in", detail: "Tucson International (TUS) sits ~15 minutes south of downtown. Or drive ~2 hours down I-10 from Phoenix." },
      { title: "Come October, April", detail: "Warm days, cool nights and snowbird season, the resorts fill and rates climb, but the desert is at its best." },
      { title: "Brave summer for a deal", detail: "June, September runs 100°F+, but rates crater and the top of Mount Lemmon stays ~20°F cooler." },
    ],
  },
  "galveston-by-numbers": {
    kind: "stat",
    title: "Galveston by the numbers",
    stats: [
      { value: "~50 mi", label: "southeast of Houston, about an hour down I-45" },
      { value: "10 mi", label: "of Seawall, one of the longest sidewalks in the US" },
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
      { label: "To the sand", left: "You are on it", right: "A 10-minute drive or the trolley" },
      { label: "You wake up to", left: "Surf and the Seawall", right: "Iron front buildings and ships" },
    ],
  },
  "galveston-getting-there": {
    kind: "steps",
    title: "Getting to Galveston",
    steps: [
      { title: "Drive from Houston", detail: "Galveston is ~50 miles southeast of Houston, about an hour down I-45, the island has no major airport, so most visitors fly into Houston (Hobby or Bush) and drive." },
      { title: "Sailing out?", detail: "The cruise terminal sits downtown by the Strand. Many cruisers book a nearby hotel with a park and cruise package." },
      { title: "Get around", detail: "A car helps, but the Seawall, the Strand and Pleasure Pier are each walkable, with a historic trolley linking downtown." },
    ],
  },
  "albuquerque-by-numbers": {
    kind: "stat",
    title: "Albuquerque by the numbers",
    stats: [
      { value: "~5,300 ft", label: "high desert elevation, a mile up, and then some" },
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
      { label: "Best for", left: "First timers, history, walkers", right: "Shopping, the tram, a quieter base" },
      { label: "Nightly rate", left: "Mid, boutique and Heritage hotels", right: "Lower, dependable chains" },
      { label: "You wake up to", left: "Adobe walls and the old plaza", right: "The Sandias turning watermelon pink" },
    ],
  },
  "albuquerque-getting-there": {
    kind: "steps",
    title: "Getting to Albuquerque",
    steps: [
      { title: "Fly in", detail: "The Albuquerque Sunport (ABQ) sits about 10 minutes from downtown, small, easy and central to the whole city." },
      { title: "Day trip Santa Fe", detail: "Santa Fe is ~60 miles and an hour north up I-25, or a scenic ride on the Rail Runner train. Many split a New Mexico trip between the two." },
      { title: "Ride the tram, pack layers", detail: "The Sandia Peak Tramway climbs above 10,000 feet for the view, and the city itself sits a mile high, so evenings cool off fast." },
    ],
  },
  "albuquerque-vs-santafe": {
    kind: "compare",
    title: "Albuquerque or Santa Fe?",
    left: "Albuquerque",
    right: "Santa Fe",
    rows: [
      { label: "The draw", left: "Bigger city, Route 66, the Balloon Fiesta", right: "Art galleries, the adobe plaza, higher end" },
      { label: "Hotels", left: "More choice, more affordable", right: "Pricier, more boutique" },
      { label: "Food", left: "Green chile everything", right: "Refined New Mexican" },
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
      { value: "~80 mi", label: "south of Austin, about 90 minutes up I-35" },
    ],
  },
  "sanantonio-downtown-vs-suburbs": {
    kind: "compare",
    title: "River Walk or the suburbs?",
    left: "Downtown & the River Walk",
    right: "Stone Oak, Medical Center & the airport",
    rows: [
      { label: "The vibe", left: "Walk to the Alamo, river cafes, no car needed", right: "Newer chains, quiet, you drive in" },
      { label: "Best for", left: "First timers, couples, no car trips", right: "Value, business, families with a car" },
      { label: "Nightly rate", left: "Higher, historic and boutique", right: "Lower, dependable chains" },
      { label: "You wake up to", left: "The river and the cypress trees", right: "A pool deck and easy parking" },
    ],
  },
  "sanantonio-getting-there": {
    kind: "steps",
    title: "Getting to San Antonio",
    steps: [
      { title: "Fly in", detail: "San Antonio International (SAT) sits about 8 miles north of downtown, roughly 15 minutes, small, easy and close to the center." },
      { title: "Skip the car downtown", detail: "The River Walk and the Alamo are walkable, and the VIA buses cover the core. You only need a car for SeaWorld, Six Flags or the outer missions." },
      { title: "Day trip the Hill Country", detail: "Austin is ~80 miles north up I-35, and the Hill Country (Fredericksburg, New Braunfels) is an hour out for wineries and the river." },
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
      { title: "Take the barge first", detail: "The narrated river barge is the fastest way to get your bearings, do it your first night." },
      { title: "Eat a block off the water", detail: "Riverside tables are convenient. The better food is a short walk up at the Pearl or in Southtown." },
      { title: "Walk it early", detail: "A weekday morning stroll before the crowds is when the River Walk is genuinely at its best." },
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
      { value: "Poipu", label: "the sunny south shore, the easy first timer base" },
      { value: "Na Pali", label: "the roadless cliffs, seen by boat, helicopter or foot" },
      { value: "Waimea", label: "Canyon, the 'Grand Canyon of the Pacific'" },
      { value: "No loop", label: "one main road. You drive out and back, not around" },
    ],
  },
  "kauai-north-vs-south": {
    kind: "compare",
    title: "North Shore or South Shore?",
    left: "South Shore (Poipu)",
    right: "North Shore (Princeville / Hanalei)",
    rows: [
      { label: "The weather", left: "Sunnier and drier year round", right: "Lush and green, and rainier, especially in winter" },
      { label: "Best for", left: "First timers, families, calm swimming", right: "Scenery, hiking, the Na Pali coast" },
      { label: "The feel", left: "Resorts, restaurants, convenient", right: "Laid back, rugged, fewer big hotels" },
      { label: "The catch", left: "More built up. A long drive to the north", right: "Rain, and a long drive to everything else" },
    ],
  },
  "kauai-getting-there": {
    kind: "steps",
    title: "Getting to (and around) Kauai",
    steps: [
      { title: "Fly into Lihue (LIH)", detail: "Kauai's only airport is on the east side by Lihue, most trips connect through Honolulu, with some direct West Coast flights." },
      { title: "Rent a car, you will need it", detail: "One main highway, no loop road (the Na Pali cliffs block the circle), so you drive out and back. Public transit is minimal." },
      { title: "Pick a side, or split", detail: "Base on the sunny South Shore for a first trip, the North Shore for scenery. For a week, split between Poipu and Princeville." },
    ],
  },
  "sf-by-numbers": {
    kind: "stat",
    title: "San Francisco by the numbers",
    stats: [
      { value: "7×7", label: "square miles, the whole city is small and walkable" },
      { value: "Union Square", label: "the central, transit hub base for a first trip" },
      { value: "Karl", label: "the summer fog. It is cold and grey, so pack layers" },
      { value: "Sept, Oct", label: "the warmest, clearest months to visit" },
    ],
  },
  "sf-getting-around": {
    kind: "steps",
    title: "Getting to (and around) San Francisco",
    steps: [
      { title: "Fly into SFO (or Oakland)", detail: "BART runs from SFO straight downtown to the Powell Street / Union Square stop in about 30 minutes, no car required." },
      { title: "Skip the rental car", detail: "Hotel parking runs roughly $50 to 75 a night, the hills and one way streets are a chore, and smash and grabs are real. Rent only if you are leaving the city." },
      { title: "Walk first, then ride", detail: "It is a 7×7-mile city, so you will walk most of it. Cable cars, Muni and BART cover the rest. A central base means less commuting." },
    ],
  },
  "sf-union-vs-wharf": {
    kind: "compare",
    title: "Union Square or Fisherman's Wharf?",
    left: "Union Square",
    right: "Fisherman's Wharf",
    rows: [
      { label: "Best for", left: "First timers, walkability, transit", right: "Families, the waterfront, Alcatraz trips" },
      { label: "The feel", left: "Central, busy, shops and theaters", right: "Touristy, salty air, sea lions" },
      { label: "Getting around", left: "Cable cars, BART and Muni at the door", right: "A cable car or bus ride from downtown" },
      { label: "The trade", left: "Some blocks fray toward the Tenderloin edge", right: "Pricey and crowded, and quiet after dark" },
    ],
  },
  "nola-kids-by-numbers": {
    kind: "stat",
    title: "New Orleans with kids, at a glance",
    stats: [
      { value: "Audubon", label: "a beloved zoo, aquarium and insectarium, the family trifecta" },
      { value: "City Park", label: "Storyland, the Carousel Gardens rides and the Children's Museum" },
      { value: "$1.25", label: "a streetcar ride, the cheapest thrill in town for little ones" },
      { value: "Ages 4 to 12", label: "the sweet spot, though toddlers and teens find plenty too" },
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
    title: "Rainy day rescue (all indoors)",
    stats: [
      { value: "Aquarium", label: "sharks, penguins and a hands on touch pool" },
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
      { value: "French Market", label: "browsing, samples and people watching cost nothing" },
      { value: "Library storytime", label: "free songs and crafts sessions made for toddlers" },
    ],
  },
  "nola-kids-callout": {
    kind: "callout",
    title: "The move, daytime Quarter, family base nearby",
    body: "The French Quarter by day is street performers, beignets and the river, wholesome and walkable. Skip Bourbon Street with kids, base a few blocks off it, and build each day around one big outing plus a park or a nap.",
  },
  "nola-weather-extremes": {
    kind: "stat",
    title: "New Orleans weather, at the extremes",
    stats: [
      { value: "Jul, Aug", label: "the hottest, highs near 92°F with brutal humidity" },
      { value: "January", label: "the coolest, highs around 62°F, lows in the 40s" },
      { value: "Mid summer", label: "the wettest, with near daily afternoon thunderstorms" },
      { value: "October", label: "the driest and most comfortable stretch of the year" },
    ],
  },
  "nola-festival-calendar": {
    kind: "stat",
    title: "New Orleans festival calendar (2026)",
    stats: [
      { value: "Feb 17", label: "Mardi Gras, Carnival builds from January 6" },
      { value: "April", label: "French Quarter Festival, free music on the riverfront" },
      { value: "Apr 23, May 3", label: "New Orleans Jazz & Heritage Festival (Jazz Fest)" },
      { value: "July 4", label: "Essence Festival weekend, the summer headliner" },
    ],
  },
  "nola-best-time": {
    kind: "stat",
    title: "Best time to visit New Orleans, in one glance",
    stats: [
      { value: "Oct, Nov", label: "the best weather, crisp 70s and low humidity" },
      { value: "Feb, May", label: "festival season, Mardi Gras, French Quarter Fest, Jazz Fest" },
      { value: "August", label: "the cheapest month, but brutally hot and peak hurricane season" },
      { value: "Mar & Nov", label: "the sweet spot, great weather, smaller crowds, fair prices" },
    ],
  },
  "nola-cheapest": {
    kind: "stat",
    title: "When New Orleans is cheapest",
    stats: [
      { value: "Summer", label: "June, September, rates fall as the heat scares everyone off" },
      { value: "August", label: "the rock bottom month, hotels can run far below spring rates" },
      { value: "January", label: "a quiet, cheap lull after New Year and before Mardi Gras" },
      { value: "Avoid", label: "Mardi Gras and Jazz Fest weekends, the priciest dates by far" },
    ],
  },
  "nola-seasons": {
    kind: "stat",
    title: "New Orleans by season",
    stats: [
      { value: "Spring", label: "warm, gorgeous, festival packed, and priced like it" },
      { value: "Summer", label: "hot, humid and stormy, but the cheapest and least crowded" },
      { value: "Fall", label: "the locals' favorite, best weather, easier prices" },
      { value: "Winter", label: "cool and festive, with a cheap January lull before Carnival" },
    ],
  },
  "nola-mardi-gras-2026": {
    kind: "callout",
    title: "Mardi Gras 2027 falls on February 9",
    body: "Carnival season runs from January 6 to Fat Tuesday (Feb 9, 2027). The two weeks before are the city's busiest and most expensive, hotels book up a year ahead and often require 3 to 4 night minimums. Want the party? Book early. Want the city calm? Avoid those two weeks entirely.",
  },
  "nola-mg-2027-dates": {
    kind: "stat",
    title: "Mardi Gras 2027, at a glance",
    stats: [
      { value: "Feb 9, 2027", label: "Fat Tuesday, Mardi Gras Day, the grand finale" },
      { value: "Jan 6", label: "Twelfth Night, Carnival season begins, king cakes appear" },
      { value: "34 days", label: "a short 2027 season (2026 ran 43 days, 2025 ran 58)" },
      { value: "Feb 8", label: "Lundi Gras, Zulu and Rex arrive by riverboat" },
    ],
  },
  "nola-mg-colors": {
    kind: "stat",
    title: "What the Mardi Gras colors mean",
    stats: [
      { value: "Purple", label: "Justice, one of the three colors Rex chose in 1872" },
      { value: "Green", label: "Faith" },
      { value: "Gold", label: "Power" },
      { value: "1872", label: "Rex debuts the King of Carnival and these colors" },
    ],
  },
  "nola-mg-throws": {
    kind: "stat",
    title: "The throws worth catching",
    stats: [
      { value: "Zulu coconut", label: "the holy grail, hand passed from the float, not thrown" },
      { value: "Muses shoe", label: "a glittered high heel from the all women krewe" },
      { value: "Nyx purse", label: "a hand decorated handbag" },
      { value: "Tucks paper", label: "a roll of toilet paper, yes, really, and it is a classic" },
    ],
  },
  "nola-mg-family-vs-party": {
    kind: "compare",
    title: "Family parade or adult party?",
    left: "Family friendly (Uptown)",
    right: "Adult party (the Quarter)",
    rows: [
      { label: "Where", left: "St. Charles Ave and Napoleon Ave, Uptown", right: "Bourbon Street and the French Quarter" },
      { label: "The vibe", left: "Ladders, picnics, kids, daytime parades", right: "Costumes, crowds, to go cups, late nights" },
      { label: "Best for", left: "Families, first timers, a calmer curb", right: "Adults who came for the wild side" },
      { label: "The catch", left: "Arrive early to claim a spot", right: "No parades roll here, it is the after party" },
    ],
  },
  "nola-mg-booking": {
    kind: "steps",
    title: "How to book a Mardi Gras room",
    steps: [
      { title: "Book 6 to 12 months out", detail: "Parade route hotels sell out nearly a year ahead. Most open Carnival bookings 10 to 12 months early." },
      { title: "Expect minimums and deposits", detail: "Three to five night stays and non refundable deposits are standard for Carnival week." },
      { title: "Pick your spot", detail: "St. Charles for the parades, the CBD for the Canal Street finish, the Quarter for the costume scene." },
      { title: "Lock the rate early", detail: "Base rates climb across the whole city, the earlier you book, the better you sit." },
    ],
  },
  "nola-mg-callout": {
    kind: "callout",
    title: "The first-timer's move",
    body: "Catch a family parade Uptown on St. Charles by day, costume up for the Quarter by night, and eat king cake until Lent. Book your room 6 to 12 months out, and know the price you see is the same flat fee everyone sees, never set from your device or history.",
  },
  "nola-day-trips": {
    kind: "stat",
    title: "Best day trips from New Orleans, at a glance",
    stats: [
      { value: "Plantation Country", label: "Oak Alley, Whitney and Laura along River Road, ~1 hour west" },
      { value: "Honey Island Swamp", label: "gator filled bayou by flat bottom boat, ~45 minutes east" },
      { value: "Baton Rouge", label: "the state capital and tallest U.S. capitol, ~1.5 hours up I-10" },
      { value: "Cajun Country", label: "Lafayette's dance halls and prairie towns, ~2 hours west" },
    ],
  },
  "nola-plantations": {
    kind: "stat",
    title: "The River Road plantations",
    stats: [
      { value: "Oak Alley", label: "the famous quarter mile of 28 oaks, the photogenic one" },
      { value: "Whitney", label: "the one museum told from the enslaved people's perspective" },
      { value: "Laura", label: "a Creole plantation and its generations of women" },
      { value: "Destrehan", label: "the closest to the city, about 30 minutes out" },
    ],
  },
  "nola-swamp-tours": {
    kind: "stat",
    title: "Swamp tours, decoded",
    stats: [
      { value: "Honey Island", label: "the classic, cypress, moss and gators near Slidell" },
      { value: "Barataria", label: "free trails at the Jean Lafitte preserve, ~40 minutes south" },
      { value: "Airboat vs pontoon", label: "airboats are fast and loud. Covered pontoons are calmer" },
      { value: "Hotel pickup", label: "most tours collect you from the Quarter, no car needed" },
    ],
  },
  "nola-daytrip-callout": {
    kind: "callout",
    title: "Guided tour or rent a car?",
    body: "A guided tour (usually with hotel pickup) is easiest for the swamp and the plantations, no driving, no parking, an expert along for the ride. Renting a car makes sense for Cajun Country, the Northshore, or stringing several stops together at your own pace. For one marquee stop like Oak Alley or Honey Island, let someone else drive.",
  },
  "nola-by-interest": {
    kind: "stat",
    title: "Pick your New Orleans by interest",
    stats: [
      { value: "Music", label: "Frenchmen Street, Preservation Hall, a jazz brunch" },
      { value: "History", label: "the WWII Museum, the cemeteries, a plantation day trip" },
      { value: "Food", label: "beignets, po boys, gumbo, the grand Creole rooms" },
      { value: "Family", label: "the Audubon Aquarium and Zoo, City Park, the streetcar" },
    ],
  },
  "nola-3-days": {
    kind: "steps",
    title: "Three days in New Orleans",
    steps: [
      { title: "Day 1, the Quarter", detail: "Jackson Square, Royal Street, beignets, Frenchmen Street jazz at night." },
      { title: "Day 2, history & garden", detail: "The WWII Museum, then the streetcar through the Garden District." },
      { title: "Day 3, the wild side", detail: "A swamp tour or steamboat cruise, a cooking class, a cemetery walk." },
    ],
  },
  "nola-things-by-numbers": {
    kind: "stat",
    title: "New Orleans, at a glance",
    stats: [
      { value: "1718", label: "the year it was founded, the French Quarter is its oldest heart" },
      { value: "Nightly", label: "live jazz on Frenchmen Street and at Preservation Hall" },
      { value: "Free", label: "Jackson Square, the French Market and the riverfront cost nothing" },
      { value: "Year round", label: "festivals from Mardi Gras to Jazz Fest to French Quarter Fest" },
    ],
  },
  "nola-first-day": {
    kind: "steps",
    title: "A perfect first day in the Quarter",
    steps: [
      { title: "Morning", detail: "Beignets and chicory coffee at Café du Monde, then Jackson Square and the cathedral." },
      { title: "Midday", detail: "Browse the French Market and Royal Street. Lunch on a po boy or gumbo." },
      { title: "Afternoon", detail: "Ride the St. Charles streetcar through the Garden District." },
      { title: "Evening", detail: "Live jazz on Frenchmen Street, the locals' Bourbon Street." },
    ],
  },
  "nola-free-vs-ticketed": {
    kind: "compare",
    title: "Free vs worth the ticket",
    left: "Free",
    right: "Worth a ticket",
    rows: [
      { label: "Do", left: "Jackson Square, French Market, riverfront, street jazz", right: "WWII Museum, swamp tour, steamboat cruise, cemetery tour" },
      { label: "Best for", left: "Wandering, people watching, photos", right: "History, the bayou, the Mississippi, the cemeteries" },
      { label: "Tip", left: "Most of the Quarter costs nothing", right: "Book guided tours ahead in peak season" },
    ],
  },
  "nola-things-callout": {
    kind: "callout",
    title: "The move, free by day, tours by night",
    body: "The Quarter's best hits, Jackson Square, the cathedral, the river, the street music, are free and walkable. Save the budget for what genuinely needs a ticket, the WWII Museum, a swamp tour, a steamboat jazz cruise, or a cemetery tour you cannot do solo.",
  },
  "nola-safety-by-numbers": {
    kind: "stat",
    title: "New Orleans safety, at a glance",
    stats: [
      { value: "Falling", label: "violent crime has dropped sharply since 2023" },
      { value: "French Quarter", label: "the most policed, safest base for visitors" },
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
      { label: "Why", left: "Heavily policed, well lit, full of people", right: "Higher crime, few attractions, not set up for visitors" },
      { label: "The move", left: "Book here, walk the main streets", right: "Do not chase a too cheap room to save $20" },
    ],
  },
  "nola-stay-safe-steps": {
    kind: "steps",
    title: "The whole New Orleans safety playbook",
    steps: [
      { title: "Base in the corridor", detail: "French Quarter, Garden District, CBD, Marigny or Bywater." },
      { title: "Rideshare after dark", detail: "Skip the long late walk, it is cheap and quick." },
      { title: "Valuables in a front pocket", detail: "Do not flash cash or a phone in a crowd." },
      { title: "Mind your drink", detail: "Do not set it down and walk away on Bourbon Street." },
      { title: "Trust your gut", detail: "Treat any unprompted approach as a sales pitch." },
    ],
  },
  "nola-safety-callout": {
    kind: "callout",
    title: "The mindset that keeps you safe",
    body: "Treat New Orleans like the major city it is, not a theme park, not a war zone. Stay central, keep your wits, and the worst surprise you will get is how much you spent on oysters.",
  },
  "nola-by-numbers": {
    kind: "stat",
    title: "New Orleans by the numbers",
    stats: [
      { value: "1718", label: "founded, the French Quarter is the original city" },
      { value: "French Quarter", label: "the central, walkable base for a first trip" },
      { value: "Streetcars", label: "the St. Charles line runs to the Garden District" },
      { value: "Mardi Gras", label: "and Jazz Fest, book months ahead and pay up" },
    ],
  },
  "nola-fq-vs-cbd": {
    kind: "compare",
    title: "French Quarter or the CBD?",
    left: "French Quarter",
    right: "Central Business District",
    rows: [
      { label: "Best for", left: "First timers, atmosphere, walking", right: "Quiet, value, conventions" },
      { label: "The feel", left: "Historic, lively, loud", right: "Modern hotels, calm, central" },
      { label: "At night", left: "Bourbon Street never sleeps", right: "Quiet, a few blocks from the action" },
      { label: "The trade", left: "Pricey and noisy on the wrong block", right: "Less charm, a short walk to it" },
    ],
  },
  "nola-getting-around": {
    kind: "steps",
    title: "Getting to (and around) New Orleans",
    steps: [
      { title: "Fly into MSY", detail: "Louis Armstrong airport is about 30 minutes from downtown by rideshare or airport shuttle, no rental car needed for a city trip." },
      { title: "Skip the car", detail: "The French Quarter is walkable and parking is pricey and scarce. A car is a liability on the narrow one way streets. Rent only for swamp tours or plantations." },
      { title: "Streetcars and rideshare", detail: "The historic St. Charles line runs to the Garden District and Uptown. The Canal and Riverfront lines cover downtown. Rideshares fill the late night gaps." },
    ],
  },
  "nola-dining-by-numbers": {
    kind: "stat",
    title: "New Orleans dining, at a glance",
    stats: [
      { value: "1840", label: "Antoine's opens, today the oldest family run restaurant in the US" },
      { value: "1862", label: "Café du Monde starts serving beignets and chicory café au lait" },
      { value: "2★", label: "Michelin stars at Emeril's, the city's only two star restaurant" },
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
      { label: "The wait", left: "Walk right in at 7pm", right: "There is a line, and the line is the review" },
      { label: "The move", left: "One photo, keep walking", right: "Two blocks off Bourbon, follow the regulars" },
    ],
  },
  "nola-must-eat-dishes": {
    kind: "steps",
    title: "What to eat (and where) in New Orleans",
    steps: [
      { title: "Beignets", detail: "Café du Monde, three to an order, powdered sugar included whether you asked or not." },
      { title: "A dressed po boy", detail: "Domilise's or Parkway, on Leidenheimer French bread, shrimp or roast beef." },
      { title: "Gumbo", detail: "Dooky Chase's or any Creole classic, the holy trinity in a bowl." },
      { title: "Char grilled oysters", detail: "Drago's, which invented them, or Acme Oyster House." },
      { title: "Turtle soup", detail: "Commander's Palace, finished tableside with a pour of sherry." },
      { title: "Bananas Foster", detail: "Brennan's, where it was invented and still flambéed at your table." },
    ],
  },
  "nola-cheap-vs-splurge": {
    kind: "compare",
    title: "Cheap eats or the white tablecloth splurge?",
    left: "Under ~$15 a plate",
    right: "The grand Creole splurge",
    rows: [
      { label: "Where", left: "Domilise's, Coop's Place, Killer PoBoys, Verti Marte", right: "Commander's Palace, Antoine's, Galatoire's, Emeril's" },
      { label: "The order", left: "A dressed po boy, red beans, a plate lunch", right: "Turtle soup, a tasting menu, a bread pudding soufflé" },
      { label: "Reservation", left: "Walk in, maybe wait", right: "Book weeks ahead, longer for festivals" },
      { label: "Dress", left: "However you woke up", right: "Collared shirt. Jackets after 5pm at some" },
    ],
  },
  "nola-reservations": {
    kind: "steps",
    title: "How to actually get a table",
    steps: [
      { title: "Book the big names early", detail: "Commander's, Antoine's and Emeril's go 2 to 8 weeks out, 2+ months on festival weekends." },
      { title: "Know the walk-in move", detail: "Galatoire's downstairs takes no reservations. Show up early and queue with the regulars." },
      { title: "Mind the dress code", detail: "Jackets after 5pm at Galatoire's. Collared shirts and no shorts at Commander's." },
      { title: "Tip like a local", detail: "Service in the grand rooms is a craft, 20% and up is the floor." },
    ],
  },
  "nola-creole-vs-cajun": {
    kind: "compare",
    title: "Creole or Cajun?",
    left: "Creole (city cooking)",
    right: "Cajun (country cooking)",
    rows: [
      { label: "Roots", left: "French, Spanish and African, in city kitchens", right: "Rural Acadiana, French-Canadian heritage" },
      { label: "The tell", left: "Often tomato based, more refined sauces", right: "Rustic and one pot, no tomato in the gumbo" },
      { label: "Signature plates", left: "Shrimp Creole, turtle soup, Creole gumbo", right: "Jambalaya, crawfish étouffée, boudin" },
      { label: "Try it at", left: "Antoine's, Galatoire's, Commander's", right: "Cochon, or a day trip toward Lafayette" },
    ],
  },
  "nola-new-buzzy": {
    kind: "stat",
    title: "The newest tables worth chasing",
    stats: [
      { value: "Acamaya", label: "Ana Castro's Bywater Mexican mariscos, a recent breakout" },
      { value: "The Kingsway", label: "modern Asian cooking on Magazine Street" },
      { value: "Bacchanal", label: "Bywater wine garden with live music and a backyard kitchen" },
      { value: "N7", label: "a hard to find Bywater French-Japanese wine spot" },
    ],
  },
  "nola-dining-callout": {
    kind: "callout",
    title: "Eat here, sleep next door",
    body: "The smartest food trip stays walkable to where you want to eat, the French Quarter for Antoine's and Galatoire's, the Garden District for Commander's Palace, the Warehouse District for Emeril's and Compère Lapin, then roll home on foot. And the room you book here is the same price everyone sees, with one flat fee and no surprise charge on the last screen.",
  },
  "staugustine-by-numbers": {
    kind: "stat",
    title: "St. Augustine by the numbers",
    stats: [
      { value: "1565", label: "founded, the oldest city in the United States" },
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
      { label: "The vibe", left: "Cobblestones, the fort, walk to dinner", right: "Sand, surf, low key, drive in" },
      { label: "Best for", left: "First timers, history, no car trips", right: "Beach days, families, quiet" },
      { label: "To the sand", left: "A 10 to 15 minute drive", right: "You are on it" },
      { label: "You wake up to", left: "Spanish colonial streets", right: "The Atlantic and the dunes" },
    ],
  },
  "staugustine-getting-there": {
    kind: "steps",
    title: "Getting to St. Augustine",
    steps: [
      { title: "Fly into Jacksonville", detail: "St. Augustine has no commercial airport. Jacksonville (JAX) is ~40 miles and 45 minutes north, Orlando ~2 hours south." },
      { title: "Park once, then walk", detail: "The historic district is tight and parking is scarce, base downtown and you can leave the car for days. The beaches need it." },
      { title: "Ride the trolley", detail: "Hop on Old Town Trolleys loop the historic sights, and free park and ride shuttles run during the busy Nights of Lights season." },
    ],
  },
  "charleston-by-numbers": {
    kind: "stat",
    title: "Charleston by the numbers",
    stats: [
      { value: "1670", label: "founded, the heart of the Lowcountry" },
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
      { label: "Best for", left: "First timers, history, food, no car", right: "Families, beach days, lower rates" },
      { label: "To the sights", left: "On foot", right: "A 10 to 15 minute drive over the bridge" },
      { label: "You wake up to", left: "Church steeples and brick", right: "Oak trees, marsh and the beaches nearby" },
    ],
  },
  "charleston-getting-there": {
    kind: "steps",
    title: "Getting to Charleston",
    steps: [
      { title: "Fly into CHS", detail: "Charleston International (CHS) sits in North Charleston, about 12 miles and 20 minutes from downtown." },
      { title: "Park downtown, then walk", detail: "The historic peninsula is flat and walkable. Parking is tight, so base downtown and leave the car, or use the free DASH trolley." },
      { title: "Drive for the beaches", detail: "Mount Pleasant, Isle of Palms, Sullivan's Island and Folly Beach all need a car, 15 to 30 minutes out." },
    ],
  },
  "savannah-by-numbers": {
    kind: "stat",
    title: "Savannah by the numbers",
    stats: [
      { value: "1733", label: "founded, Georgia's oldest city" },
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
      { label: "Best for", left: "First timers, nightlife, families", right: "Couples, calm, tree lined walks" },
      { label: "You are near", left: "The waterfront and the bars", right: "The park and the gas lit lanes" },
      { label: "At night", left: "Lively and walkable", right: "Peaceful and dim" },
    ],
  },
  "savannah-getting-there": {
    kind: "steps",
    title: "Getting to Savannah",
    steps: [
      { title: "Fly into SAV", detail: "Savannah/Hilton Head International (SAV) is about 13 miles and 20 minutes west of the historic district." },
      { title: "Park once, then walk", detail: "The historic district is flat and made for walking. Parking is tight, so base downtown and leave the car, or ride the free DOT shuttle and ferry." },
      { title: "Drive to Tybee", detail: "Tybee Island, Savannah's beach, is about 18 miles and 30 minutes east, a car or a day trip tour gets you there." },
    ],
  },
  "scottsdale-by-numbers": {
    kind: "stat",
    title: "Scottsdale by the numbers",
    stats: [
      { value: "330+", label: "days of sunshine a year in the Sonoran Desert" },
      { value: "~15 min", label: "from Old Town to Phoenix Sky Harbor (PHX)" },
      { value: "Golf country", label: "Troon North, TPC Scottsdale and dozens more courses" },
      { value: "Old Town", label: "the walkable heart, bars, galleries and shopping" },
    ],
  },
  "scottsdale-oldtown-vs-north": {
    kind: "compare",
    title: "Old Town or North Scottsdale?",
    left: "Old Town Scottsdale",
    right: "North Scottsdale",
    rows: [
      { label: "The vibe", left: "Walkable bars, galleries, nightlife", right: "Desert views, golf, quiet luxury" },
      { label: "Best for", left: "First timers, nightlife, no car", right: "Golfers, spa goers, calm" },
      { label: "Getting around", left: "Walk everywhere", right: "You will want a car" },
      { label: "The rate", left: "Mid to high", right: "Resort high" },
    ],
  },
  "scottsdale-getting-there": {
    kind: "steps",
    title: "Getting to Scottsdale",
    steps: [
      { title: "Fly into PHX", detail: "Phoenix Sky Harbor (PHX) is about 12 miles and 15 to 20 minutes from Old Town Scottsdale, the closest major airport." },
      { title: "Rent a car for most areas", detail: "Old Town is walkable, but North Scottsdale, the golf resorts and the trailheads are spread out, you will want a car everywhere but Old Town." },
      { title: "Beat the summer heat", detail: "Scottsdale sees 100°F plus summers. Fall through spring is prime, and resorts drop their rates in the summer." },
    ],
  },
  "sedona-uptown-vs-village": {
    kind: "compare",
    title: "Uptown or the Village of Oak Creek?",
    left: "Uptown Sedona",
    right: "Village of Oak Creek",
    rows: [
      { label: "The feel", left: "Walkable, lively, central", right: "Quieter, spread out, residential" },
      { label: "Best for", left: "First timers, no car", right: "Couples, golfers, budgets" },
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
      { value: "~4,350 ft", label: "high desert elevation" },
      { value: "~2 hr", label: "north of Phoenix Sky Harbor (PHX)" },
      { value: "~2 hr", label: "to the Grand Canyon's South Rim" },
      { value: "4", label: "areas to base in, all with red rock views" },
    ],
  },
  "bend-by-numbers": {
    kind: "stat",
    title: "Bend, Oregon by the numbers",
    stats: [
      { value: "~3,623 ft", label: "high desert elevation" },
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
    left: "Highway 76, the Strip",
    right: "Table Rock Lake",
    rows: [
      { label: "The vibe", left: "Neon, theaters, go karts, nonstop", right: "Docks, pontoons, pine trees, quiet" },
      { label: "Best for", left: "First timers, show marathons, kids", right: "Boating, families, couples who want calm" },
      { label: "To the theaters", left: "Walk to a few minutes", right: "A 15 to 20 minute drive" },
      { label: "You wake up to", left: "A parking lot and a billboard", right: "Open water and the odd bald eagle" },
    ],
  },

  "nola-day1-plan": {
    kind: "steps",
    title: "Day 1, the French Quarter on foot",
    steps: [
      { title: "Morning", detail: "Beignets and chicory coffee at Café du Monde, then Jackson Square, St. Louis Cathedral, and a slow loop of Royal Street." },
      { title: "Midday", detail: "The French Market, the Pharmacy Museum, and a muffuletta from Central Grocery or a dressed po'boy." },
      { title: "Afternoon", detail: "A guided food or cocktail history walk, or wander the Quarter with a legal to go cup." },
      { title: "Evening", detail: "Live jazz on Frenchmen Street, the locals' answer to Bourbon. Catch a 7:30 or 9:30 set." },
    ],
  },
  "nola-day2-plan": {
    kind: "steps",
    title: "Day 2, streetcar, Garden District, museums",
    steps: [
      { title: "Morning", detail: "Ride the St. Charles streetcar Uptown past the oak lined mansions for the price of a coffee." },
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
      { label: "Best for", left: "First timers who want the bayou and the history", right: "Repeat visitors and slow mornings" },
      { label: "How long", left: "A half or full day with hotel pickup", right: "Your own pace, no van schedule" },
      { label: "Book ahead?", left: "Yes, combos sell out in spring", right: "Only the cooking class and tour" },
    ],
  },
  "nola-transit-fares": {
    kind: "stat",
    title: "Getting around for the price of a coffee",
    stats: [
      { value: "$1.25", label: "a single streetcar or bus ride, exact change, no change given" },
      { value: "$3", label: "a one day Jazzy Pass, unlimited streetcars and buses" },
      { value: "$9", label: "a three day Jazzy Pass, which pays for itself fast" },
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
      { label: "One big day out", left: "A self guided Garden District walk", right: "$80 to 175 swamp plus plantation" },
    ],
  },
  "nola-3day-callout": {
    kind: "callout",
    title: "The three day move",
    body: "Base in or one streetcar stop from the French Quarter, so you walk to most of it. Skip the rental car, the parking and one way streets are a tax you do not need. Front load the Quarter on Day 1, ride the streetcar on Day 2, and save the swamp and plantation combo for Day 3. Book that combo before you fly in, because the good spring dates sell out.",
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
      { label: "The vibe", left: "Antiques, galleries, iron balconies, calm", right: "Bars, neon, a round the clock party" },
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
    body: "Walk it. The whole Quarter is about 13 blocks by 7 and dead flat. Spend your days on Royal, Chartres, and the riverfront, and see Bourbon Street once after dark rather than building a trip around it. Stay inside the Quarter so you can walk home, and keep to the busy, well lit streets at night.",
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
      { value: "The Cornstalk fence", label: "Colonel Short's Villa, 1859, the cast iron cornstalk and morning glory fence" },
      { value: "1239 First St", label: "the Brevard House, where Anne Rice wrote the Mayfair Witches" },
      { value: "2707 Coliseum", label: "the retirement home in The Curious Case of Benjamin Button" },
    ],
  },
  "nola-gd-callout": {
    kind: "callout",
    title: "The Garden District move",
    body: "Ride the Saint Charles streetcar to Washington Avenue (a dollar and a quarter), then walk. The homes are the show, so do a self guided loop down Prytania and First Streets. See Lafayette Cemetery through the gates, since it is closed inside, lunch on Magazine Street, and book Commander's Palace ahead for the jazz brunch. Go before 9am for photos, and stay on the busy streets after dark.",
  },

  "nola-fs-venues": {
    kind: "stat",
    title: "The clubs to hop between on Frenchmen",
    stats: [
      { value: "The Spotted Cat", label: "623, the iconic trad and swing jazz room, cash and a tip jar" },
      { value: "Snug Harbor", label: "626, serious modern jazz, ticketed sets at 7:30 and 9:30" },
      { value: "d.b.a.", label: "618, brass and funk, early set free, late set a small cover" },
      { value: "Blue Nile", label: "532, the club that sparked the street, funk and brass" },
    ],
  },
  "nola-fs-vs-bourbon": {
    kind: "compare",
    title: "Frenchmen Street or Bourbon Street?",
    left: "Frenchmen Street",
    right: "Bourbon Street",
    rows: [
      { label: "The point", left: "The music, real bands every night", right: "The party, the booze, the neon" },
      { label: "The crowd", left: "Locals and music fans", right: "Bachelorette parties and to go cups" },
      { label: "Cover", left: "Often free or a few dollars, tip the band", right: "No cover, pricey novelty drinks" },
      { label: "Go for", left: "Jazz, brass, funk, soul, reggae", right: "One loud lap, then leave" },
    ],
  },
  "nola-fs-callout": {
    kind: "callout",
    title: "The Frenchmen Street move",
    body: "Walk down from the French Quarter after dark, about ten minutes past Esplanade Avenue. Bring cash, wander in and out of three or four clubs (most are free or a few dollars early), and always tip the band, since the jar is half their pay. See the brass band at Frenchmen and Chartres, browse the night art market, and rideshare home after midnight.",
  },
};

export function getInfographic(key: string): Infographic | null {
  return INFOGRAPHICS[key] ?? null;
}
