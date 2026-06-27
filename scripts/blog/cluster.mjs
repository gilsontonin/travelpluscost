// blog:cluster — topical-authority content mapper. Reads a Semrush location broad-match CSV
// (Designs/Locations/<slug>_broad-match_*.csv), keeps the TRAVEL/TOURISM keywords (drops sports/
// jobs/real-estate/news/weather-utility noise), buckets them into content topics, and prints a
// ranked content map (one cluster ≈ one post): head keyword, volume, KD, winnable count, seeds.
//   npm run blog:cluster -- "new orleans"      (auto-finds the newest CSV for that city)
//   npm run blog:cluster -- "new orleans" --topic food   (dump every keyword in one cluster)
import { readFileSync, readdirSync } from "node:fs";

const argv = process.argv.slice(2);
const city = (argv.find((a) => !a.startsWith("--")) || "new orleans").toLowerCase();
const slug = city.replace(/[^a-z0-9]+/g, "-");
const topicArg = (() => { const i = argv.indexOf("--topic"); return i >= 0 ? argv[i + 1] : null; })();

const dir = "Designs/Locations";
const file = readdirSync(dir).filter((f) => f.toLowerCase().startsWith(slug) && f.endsWith(".csv")).sort().pop();
if (!file) { console.error(`No CSV for "${city}" in ${dir}/ (looking for ${slug}_*.csv)`); process.exit(1); }

// --- minimal CSV parser (handles quoted fields with commas) ---
function parseCSV(text) {
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

const rows = parseCSV(readFileSync(`${dir}/${file}`, "utf8"));
const head = rows.shift();
const col = (name) => head.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
const K = col("Keyword"), V = col("Volume"), D = col("Keyword Difficulty"), I = col("Intent");

// Drop the noise: sports, jobs, real-estate, civic, news/crime, utility-weather, generic local services.
const NOISE = /\b(saints?|pelicans?|nfl|nba|mlb|roster|schedule|score|espn|quarterback|playoff|draft|jobs?|hiring|salary|career|craigslist|zillow|realtor|real estate|for sale|for rent|apartments?|homes?|tulane|loyola|\buno\b|\blsu\b|university|college|hospital|ochsner|clinic|dentist|\bdmv\b|courthouse|jail|prison|mugshots?|arrest|warrant|obituar|funeral|news|shooting|murder|homicide|radar|forecast|temperature|humidity|hourly|weather|zip code|area code|population|demographics|election|mayor|council|permit|taxes?|utility|electric|water bill|insurance|lawyer|attorney|plumber|dispensary|pelican|sewerage|flights?|airfare|airlines?|cruise|family business|tv show|cast of)\b/;

// One ordered rule per content topic (first match wins). Tune as the corpus teaches us.
const TOPICS = [
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

const clusters = new Map(TOPICS.map(([t]) => [t, []]));
let kept = 0, dropped = 0;
for (const r of rows) {
  const kw = (r[K] || "").toLowerCase().trim();
  if (!kw) continue;
  const vol = parseInt(r[V] || "0", 10) || 0;
  const kd = parseInt(r[D] || "0", 10) || 0;
  if (NOISE.test(kw)) { dropped++; continue; }
  const hit = TOPICS.find(([, re]) => re.test(kw));
  if (!hit) { dropped++; continue; }
  clusters.get(hit[0]).push({ kw, vol, kd });
  kept++;
}

const med = (a) => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0);

if (topicArg) {
  const list = (clusters.get(topicArg) || []).sort((a, b) => b.vol - a.vol);
  console.log(`\n${topicArg} — ${list.length} keywords (sorted by volume)\n`);
  for (const k of list.slice(0, 80)) console.log(`  ${String(k.vol).padStart(7)}  KD ${String(k.kd).padStart(3)}  ${k.kw}`);
  process.exit(0);
}

const summary = [...clusters.entries()].map(([topic, list]) => {
  const sorted = list.slice().sort((a, b) => b.vol - a.vol);
  const winnable = list.filter((k) => k.kd <= 35).length;
  return { topic, n: list.length, vol: list.reduce((s, k) => s + k.vol, 0), kdMed: med(list.map((k) => k.kd)), winnable, head: sorted[0], seeds: sorted.slice(0, 5) };
}).filter((c) => c.n).sort((a, b) => b.vol - a.vol);

console.log(`\n🗺️  CONTENT MAP — ${city}   (${file})`);
console.log(`   ${kept} travel keywords kept · ${dropped} noise dropped · ${summary.length} content clusters\n`);
for (const c of summary) {
  console.log(`▶ ${c.topic.toUpperCase().padEnd(26)} ${String(c.vol).padStart(8)} vol · ${String(c.n).padStart(4)} kw · ${c.winnable} winnable(KD≤35) · medKD ${c.kdMed}`);
  console.log(`    head: "${c.head.kw}" (vol ${c.head.vol}, KD ${c.head.kd})`);
  console.log(`    seeds: ${c.seeds.map((s) => s.kw).join(" · ")}`);
}
console.log(`\nDrill into one:  npm run blog:cluster -- "${city}" --topic <name>\n`);
