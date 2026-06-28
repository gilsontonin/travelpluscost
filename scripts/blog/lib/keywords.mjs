// Shared keyword-research primitives for the blog robots (blog:cluster, blog:map).
// Reads a Semrush location broad-match CSV (Designs/Locations/<slug>_broad-match_*.csv), drops the
// non-travel noise, and buckets keywords into travel content topics. Single source of truth so the
// cluster map and the priority map never drift.
import { readFileSync, readdirSync } from "node:fs";

// minimal CSV parser (handles quoted fields with commas)
export function parseCSV(text) {
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") { if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; } if (c === "\r" && text[i + 1] === "\n") i++; }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Drop the noise: sports, jobs, real-estate, civic, news/crime, utility-weather, generic local services,
// and the EXCLUSIONS we never target (near-me = a Google signal not a keyword; competitor brands; verticals
// we don't sell). Keeping this here means both robots exclude the same junk.
export const NOISE = /\b(near me|nearby|saints?|pelicans?|nfl|nba|mlb|roster|schedule|score|espn|quarterback|playoff|draft|jobs?|hiring|salary|career|how to become|apprenticeship|craigslist|zillow|realtor|real estate|for sale|for rent|apartments?|homes?|tulane|loyola|\buno\b|\blsu\b|university|college|hospital|ochsner|clinic|dentist|\bdmv\b|courthouse|jail|prison|mugshots?|arrest|warrant|obituar|funeral|news|shooting|murder|homicide|radar|forecast|temperature|humidity|hourly|weather|zip code|area code|population|demographics|election|mayor|council|permit|taxes?|utility|electric|water bill|insurance|lawyer|attorney|plumber|dispensary|pelican|sewerage|flights?|airfare|airlines?|family business|tv show|cast of|expedia|booking\.com|tripadvisor|hotels\.com|priceline|kayak|vrbo|sex club|strip club|strippers?|escort|gentlemen.?s club|adult entertainment|television guide|tv guide|tv listings|posters?|merch|wallpaper|coloring|clipart|svg|lyrics|webcam|live cam)\b/;

// Branded / navigational / transactional markers — fine as cluster context, but NOT a blog keyword to
// build a post around (someone searching "homewood suites french quarter" wants that exact hotel, not a
// guide). blog:map excludes these from the primary/entry pick.
export const BRANDED = /\b(hilton|hyatt|marriott|homewood|monteleone|drago|sheraton|westin|ritz|hampton inn|holiday inn|best western|wyndham|sonesta|kimpton|ac hotel|moxy|aloft|tickets?|coupon|promo code|phone number|opening hours|login|reservations? number)\b|\bla united states\b|\bnew orleans la$/;

// One ordered rule per content topic (first match wins). Tune as the corpus teaches us.
export const TOPICS = [
  ["mardi-gras", /mardi gras|king cake|krewe|fat tuesday|parade|float\b/],
  ["festivals-events", /jazz ?fest|french quarter fest|essence|festival|second line|new year|halloween|christmas|nye/],
  ["food-restaurants", /restaurant|food|eat\b|eats|dining|breakfast|brunch|lunch|dinner|cafe|beignet|po.?boy|gumbo|jambalaya|oyster|seafood|coffee|bakery|cuisine|menu/],
  ["nightlife-music", /\bbars?\b|nightlife|night club|\bclub\b|music|jazz\b|blues|frenchmen|cocktail|sazerac|daiquiri|\bdrink|piano|burlesque/],
  ["tours-attractions", /\btours?\b|ghost|haunted|cemeter|voodoo|steamboat|riverboat|carriage|airboat|aquarium|\bzoo\b|museum|wwii|garden\b/],
  ["swamp-plantation-daytrips", /swamp|bayou|plantation|day ?trip|from new orleans|baton rouge|lafayette|gulf|biloxi|near new orleans|oak alley/],
  ["where-to-stay-hotels", /hotel|motel|resort|\binn\b|lodging|hostel|where to stay|places? to stay|stay in|stay near|airbnb|bed and breakfast|\bb&b\b|accommodation|vacation rental/],
  ["neighborhoods", /neighborhood|french quarter|garden district|marigny|bywater|treme|uptown|magazine street|warehouse district|where.*district|best area/],
  ["itinerary-days", /itinerary|days? in|weekend in|how many days|\d\s?days?\b|one day|girls? trip|bachelorette/],
  ["things-to-do", /things to do|things to see|attractions|what to do|sightsee|must.see|must.do|to do in|activities|fun things|free things/],
  ["best-time-weather", /best time|when to visit|when to go|cheapest time|weather|temperature|\b(january|february|march|april|may|june|july|august|september|october|november|december)\b|in (winter|spring|summer|fall)/],
  ["family-kids", /\bkids?\b|family|children|toddler/],
  ["budget", /cheap|budget|inexpensive|affordable|on a budget/],
  ["romantic-couples", /romantic|honeymoon|couples?|anniversary|proposal/],
  ["getting-around", /getting around|transportation|streetcar|parking|airport|\buber\b|lyft|rental car|how to get|map\b/],
  ["safety", /\bsafe\b|dangerous|areas to avoid|sketchy|bad area/],
  ["plan-trip-guide", /guide|plan(ning)? a trip|\btrip\b|visit|vacation|travel|things to know|tips|worth (it|visiting|a)|first time/],
];

/** Load + bucket a city's Semrush CSV into travel topics. Returns { file, kept, dropped, clusters }. */
export function loadClusters(city) {
  const slug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const dir = "Designs/Locations";
  const file = readdirSync(dir).filter((f) => f.toLowerCase().startsWith(slug) && f.endsWith(".csv")).sort().pop();
  if (!file) throw new Error(`No CSV for "${city}" in ${dir}/ (looking for ${slug}_*.csv)`);
  const rows = parseCSV(readFileSync(`${dir}/${file}`, "utf8"));
  const head = rows.shift();
  const col = (name) => head.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
  const K = col("Keyword"), V = col("Volume"), D = col("Keyword Difficulty"), I = col("Intent");
  const clusters = new Map(TOPICS.map(([t]) => [t, []]));
  let kept = 0, dropped = 0;
  for (const r of rows) {
    const kw = (r[K] || "").toLowerCase().trim();
    if (!kw) continue;
    const vol = parseInt(r[V] || "0", 10) || 0;
    const kd = parseInt(r[D] || "0", 10) || 0;
    const intent = (r[I] || "").trim();
    if (NOISE.test(kw)) { dropped++; continue; }
    const hit = TOPICS.find(([, re]) => re.test(kw));
    if (!hit) { dropped++; continue; }
    clusters.get(hit[0]).push({ kw, vol, kd, intent });
    kept++;
  }
  return { file, kept, dropped, clusters };
}

export const median = (a) => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0);
