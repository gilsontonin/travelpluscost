// Editorial blog content. Flat, typed, no DB — same philosophy as the region JSON files.
// Bodies are Markdown (rendered with react-markdown + remark-gfm). Add new posts to the TOP
// of POSTS (newest first); the index renders in array order.

export interface PostFaq {
  q: string;
  a: string;
}

export interface PostImage {
  src: string;
  alt: string;
  credit?: { name: string; url: string };
}

export interface Post {
  slug: string;
  title: string;
  /** ≤160 chars — meta description */
  description: string;
  /** one-line teaser for the index card */
  excerpt: string;
  /** YYYY-MM-DD published */
  date: string;
  /** YYYY-MM-DD last meaningful edit (drives sitemap lastmod) */
  updated?: string;
  author: string;
  category: string;
  cover: PostImage;
  /** if set, the post's CTA + breadcrumb point at this market's search */
  region?: { name: string; destination: string };
  faqs?: PostFaq[];
  /** Markdown */
  body: string;
}

export const POSTS: Post[] = [
  {
    slug: "where-to-stay-in-oahu",
    title: "Where to Stay in Oahu: A Neighborhood Guide",
    description:
      "Where to stay in Oahu by neighborhood — Waikiki, Ko Olina, the North Shore, Kailua and Downtown — matched to the kind of trip you're taking.",
    excerpt:
      "Waikiki, Ko Olina, the North Shore or Kailua? A plain-English guide to picking the right Oahu base for your trip.",
    date: "2026-06-22",
    author: "The travelpluscost team",
    category: "Destination guides",
    cover: {
      src: "https://images.unsplash.com/photo-1698094276348-c542aa9c5609?fm=webp&fit=crop&w=1200&h=675&q=80",
      alt: "Aerial view of Waikiki Beach and the Honolulu skyline on Oahu",
      credit: { name: "Spenser Sembrat", url: "https://unsplash.com/@spensersembrat" },
    },
    region: { name: "Oahu", destination: "Oahu" },
    faqs: [
      {
        q: "What is the best area to stay in Oahu for first-timers?",
        a: "Waikiki. It has the most hotels, the easiest beach access, walkable dining and the shortest transfers from the airport — so a first trip spends less time on logistics and more on the island.",
      },
      {
        q: "Is it better to stay in Waikiki or the North Shore?",
        a: "Waikiki for nightlife, dining and convenience; the North Shore for big winter surf, a slower pace and far fewer crowds. Many people split the trip — a few nights in each — rather than choosing one.",
      },
      {
        q: "Do you need a car to stay in Oahu?",
        a: "Not if you base yourself in Waikiki, where you can walk or take the bus to most things. You'll want a car for the North Shore, the Windward side, or any plan built around driving the island.",
      },
      {
        q: "Which side of Oahu is best for families?",
        a: "Ko Olina, on the leeward west side. Its calm, man-made lagoons are gentle for small children, and the resorts are self-contained — though it's the farthest base from Honolulu's restaurants and sights.",
      },
    ],
    body: `Most first-time visitors should stay in **Waikiki** — it has the widest choice of hotels, the easiest beach and dining access, and the shortest airport transfer. But "best" depends on the trip you're taking. Here's how Oahu's main bases actually differ, so you can match one to your plans instead of guessing from a map.

## Waikiki — the easy default

Waikiki is the dense strip of hotels along Honolulu's south shore, and it's where most people stay for good reason. You can walk to the beach, to dozens of restaurants, and to shopping, and you don't need a car to enjoy a trip built around the sand. It's also the best-connected base: the airport is close, and the public bus reaches most of the island from here.

The trade-off is that Waikiki is busy and built-up. If your picture of Hawaii is an empty beach at dawn, you'll find calmer water early, but you won't find solitude. For a first visit, the convenience usually wins.

**Best for:** first-timers, no-car trips, nightlife and dining, shorter stays.

## Ko Olina — calm lagoons for families

About 40 minutes west of the airport, Ko Olina is a planned resort area built around four calm, man-made lagoons. The water is gentle and sheltered, which makes it the standout choice for families with small children. The resorts here are self-contained, so you can settle in and barely leave.

The cost of that calm is distance. Ko Olina is far from Honolulu's restaurants, the North Shore and most of the island's sights, so you'll either rent a car or accept longer drives for day trips.

**Best for:** families with young kids, resort-focused stays, travelers who want quiet over convenience.

## The North Shore — surf and slow living

The North Shore is the Oahu of postcards: long beaches, food trucks, sea turtles, and in winter, some of the biggest surf in the world. The pace is noticeably slower than Honolulu, and lodging leans toward vacation rentals and small inns rather than big hotels.

You'll want a car here, and you should know that the famous winter waves mean strong currents — beautiful to watch, not always safe to swim. In summer the same beaches turn calm and swimmable.

**Best for:** surfers, couples wanting quiet, travelers who'll rent a car and don't need nightlife.

## Kailua and the Windward side — beaches without the strip

Over the mountains on the east side, Kailua and Lanikai have some of the island's most photographed beaches — soft sand, turquoise water, offshore islets. The area is residential and low-key, with cafes and a town center but no resort strip. Lodging is mostly vacation rentals.

It's a 30-minute drive to Waikiki, so a car is close to essential, but you trade convenience for beaches that many people consider the best on the island.

**Best for:** beach purists, return visitors, anyone renting a home rather than a hotel room.

## Downtown Honolulu and Ala Moana — city and shopping

Just west of Waikiki, the Ala Moana and downtown areas put you next to the island's largest shopping center and a more local, business-district feel. It's a practical base if you're mixing a city trip with the beach, and it's typically a touch quieter than Waikiki proper while staying just as connected.

**Best for:** shoppers, longer or work-mixed stays, travelers who want Waikiki's access with a bit more breathing room.

## At a glance

| Area | Vibe | Best for | Car needed? |
|---|---|---|---|
| Waikiki | Busy, walkable, lively | First-timers, no-car trips | No |
| Ko Olina | Calm, resort, sheltered | Families with young kids | Yes |
| North Shore | Slow, surf, rural | Surfers, quiet seekers | Yes |
| Kailua / Windward | Residential, beachy | Beach purists, rentals | Yes |
| Ala Moana / Downtown | City, shopping | Shoppers, longer stays | No |

## How we price the stays you find here

When you search Oahu hotels with us, the number you see is the rate plus one small, flat fee — [the same for everyone](/#how), never shaped by your device, location or browsing history. No fake discounts, no "1 room left" pressure. Just the honest number, so comparing areas is comparing like for like.

If you only do one thing with this guide: pick the base that matches your trip, then [search Oahu stays](/search?destination=Oahu&adults=2) and sort by what actually matters to you.`,
  },
];

export function getAllPosts(): Post[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}

// Rough reading time from the markdown body (~200 wpm).
export function readingMinutes(body: string): number {
  const words = body.replace(/[#>*_`|-]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
