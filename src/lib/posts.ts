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

export interface PostTldr {
  /** 35–60 word direct answer — must NOT duplicate the excerpt or the first body paragraph */
  answer: string;
  /** 3–5 bold-led real takeaways (each should start with **bold**) */
  points: string[];
}

export interface Post {
  slug: string;
  title: string;
  /** ≤60 chars — SEO <title> when it should differ from the on-page H1 (optional) */
  seoTitle?: string;
  /** ≤160 chars — meta description */
  description: string;
  /** one-line teaser for the index card */
  excerpt: string;
  /** quick-answer box rendered above the body (featured-snippet ready) */
  tldr?: PostTldr;
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
    slug: "surveillance-pricing",
    title: "Surveillance Pricing: What It Is, and Why We Refuse to Use It",
    seoTitle: "Surveillance Pricing: What It Is & Why We Refuse It",
    description:
      "Surveillance pricing sets your price from your data — device, location, history. How it works in travel, whether it's legal in 2026, and the one-price fix.",
    excerpt:
      "Why two people can search the same hotel and see two different prices — and how to tell if it's happening to you.",
    tldr: {
      answer:
        "Surveillance pricing is when a seller uses your personal data — device, location, and browsing history — to decide the price you see, so two shoppers can pay different amounts for the same thing. It's common in travel, mostly legal in 2026, and hard to dodge from your end.",
      points: [
        "**It's personalized, not posted** — the price is calculated for you from your data, not shown to everyone.",
        "**Travel is ground zero** — from Mac users steered to pricier hotels to AI-set airline fares.",
        "**Mostly legal in 2026** — the FTC is investigating and 40+ state bills are in play, but there's no broad ban yet.",
        "**You can blunt it, not beat it** — compare across devices and browsers; the real fix is a seller that doesn't price you.",
        "**The alternative is deterministic pricing** — one price for everyone, the same on any device, that you can verify.",
      ],
    },
    date: "2026-06-23",
    updated: "2026-06-23",
    author: "The travelpluscost team",
    category: "Pricing & transparency",
    cover: {
      src: "https://images.unsplash.com/photo-1758598307153-f1c53d9db23e?fm=webp&fit=crop&w=1200&h=675&q=80",
      alt: "Traveler checking hotel prices on a phone and laptop, the kind of cross-device shopping surveillance pricing tracks",
      credit: { name: "Vitaly Gariev", url: "https://unsplash.com/@silverkblack" },
    },
    faqs: [
      {
        q: "Does Amazon use surveillance pricing?",
        a: "Amazon was among the eight companies the FTC ordered to hand over information for its surveillance pricing study, and it has long used algorithmic pricing that changes often. Whether a specific price is personalized to you is exactly the black box regulators are examining.",
      },
      {
        q: "Does incognito mode stop surveillance pricing?",
        a: "It helps but doesn't stop it. A private window drops cookies and your login, which removes the easiest ways to recognize you — but sites can still fingerprint your device or match you once you sign in to book. Treat it as friction, not a force field.",
      },
      {
        q: "Is dynamic pricing the same as surveillance pricing?",
        a: "No, and the difference matters. Dynamic pricing moves a price for everyone based on demand or timing — a room costs more on a busy weekend. Surveillance pricing moves the price for you based on your data, so two people see different numbers at the same moment.",
      },
      {
        q: "Can I tell if I'm being shown a personalized price?",
        a: "Rarely with certainty, because the pricing is hidden by design. The practical test is to compare the same item across a logged-out browser, a different device, and a different network. A consistent gap is the closest thing to proof you'll get.",
      },
      {
        q: "Is surveillance pricing the same as price gouging?",
        a: "Not quite. Price gouging is charging everyone an unfairly high price, usually in an emergency. Surveillance pricing charges different people different prices from their data. They can overlap, but surveillance pricing is about who you are, not just what the market is doing.",
      },
    ],
    body: `Surveillance pricing is **a price set from your personal data** — your device, your location, your browsing history — so two people can search the identical room and see two different numbers. It's the price tag that checks your ID before it answers.

This guide covers what surveillance pricing is, how it works, where it hides in travel, whether it's legal, and what you can do about it, as of 2026. If you've ever watched a fare creep up on the second search, this is the why.

## What surveillance pricing actually is

**Surveillance pricing is personalized pricing built on personal data.** Instead of one published price everyone sees, a company estimates the most you're likely to pay and shows you that number.

The Federal Trade Commission (FTC) uses the term for exactly this: prices based on the consumer data a business has quietly collected about a specific shopper.

It helps to name what it isn't. A normal price is a number on a shelf that everyone sees.

Surveillance pricing is a number calculated for you, behind glass, from signals you never handed over on purpose. It's the difference between a menu and a mind reader.

The data feeding it is broad. The FTC's review pointed to a [wide range of personal information](https://www.ftc.gov/news-events/features/surveillance-pricing) — location, the device in your hand, what you browsed, what you bought before, even how long you lingered on a page.

None of that has anything to do with what the thing costs to provide. It only describes you.

That's the part worth sitting with. The room, the flight, the pair of shoes costs the seller the same whether you're on an old Android or a new laptop. Surveillance pricing charges the difference anyway, because it can.

### Everyday examples of surveillance pricing

Retailers do it too, not just travel sites. In one documented case, an office supply website showed customers different online prices depending on how close they were to a rival store — same product, same screen, a different number for each shopper. Once a business can recognize who's asking, the published price becomes a starting point it can quietly move.

## How surveillance pricing works

**It works by turning your behavior into a guess about your wallet.** A company collects signals, feeds them to a pricing model, and the model outputs an individualized price aimed at you. You see one number, the person beside you sees another, and neither of you sees the math.

The signals are mundane on their own. Stacked together, they sketch a profile:

| Signal | What a pricing model may read into it |
|---|---|
| Your device | A newer or pricier phone can read as "less price sensitive" |
| Location / ZIP | A higher income area can read as "can pay more" |
| Browsing history | Repeat visits can read as "wants it, will pay" |
| Time and urgency | A last minute search can read as "out of options" |

Location information and rough demographics matter most of all — a shopper in a wealthy ZIP code can quietly see higher prices, or just different consumer prices, than someone across town.

### How companies collect the data

So where do the signals come from? The same places the rest of the online economy mines them — cookies and tracking tools that follow you between sites, the account you signed in with, your purchase history, and third parties like data brokers that collect information and sell consumer habits in bulk.

Businesses don't have to ask permission for most of it. The digital exhaust of ordinary browsing is enough for the technology to build a working profile of you.

The catch is the black box. Most surveillance pricing happens with no notice — you don't know a personalized price is being shown, or which of your data drove it. That opacity is the design, not a bug, and it sits at the root of the ethical concerns: if you could see the data used and argue with the inputs, the whole trick would stop working.

It's worth being precise here, because these pricing models are genuinely good at this. They don't set prices once and walk away — they adjust prices in real time, and the pricing decisions are made for you, based on data, before the page finishes loading. Your phone has, in its quiet way, told them more about your budget than you'd tell a friend.

## Surveillance pricing in travel

**Travel is where surveillance pricing earned its reputation.** Over a decade ago, the booking site Orbitz was found to be steering Mac users toward pricier hotel options, on the theory that Mac owners spend more. Apparently owning a laptop was read as a willingness to pay extra for the room with the view.

It didn't stop there. The pressure now is on airlines: researchers and regulators warn that carriers are moving toward [fares set by artificial intelligence](https://www.colorado.edu/today/2025/08/20/your-next-airline-ticket-could-be-priced-ai) — pricing algorithms built from your shopping behavior and browsing history, not just supply and demand.

The fare that jumps between your first and second search is the folklore version of this. The documented version is worse.

| Reported in travel | What it looked like |
|---|---|
| Mac vs. PC hotels | Pricier hotels surfaced to Mac users |
| Repeat searches | Fares that climb on the second look |
| Device gaps | Friends seeing different prices on different phones |

Online travel agencies sit in the perfect spot for this. They see your device, your past trips, your dwelling time, your account — every signal a pricing model wants. The result is an industry where "the price" quietly became "your price," and almost nobody was told.

Hotels can play the same game from the other direction. A chain might post one public rate, then slip a quieter "member" price to a guest it recognizes — so the traveler who never signed up pays the sticker, while the regular pays less for the identical room. The rate looks public; the real discount is private, handed out by who you are rather than what you booked.

This is the part that made us build a travel company the other way. More on that below.

## Is surveillance pricing legal?

**Mostly, today, yes — and that's exactly why it spread.** There's no broad federal ban on charging different people different prices from their data, as long as the reason isn't an explicitly protected trait like race. That gap is what regulators are now circling.

### The current legal landscape

The Federal Trade Commission opened an inquiry into surveillance pricing in 2024 — ordering eight companies to hand over details on their pricing practices — and, in January 2025, shared [early findings](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-surveillance-pricing-study-indicates-wide-range-personal-data-used-set-individualized-consumer) that companies use a wide range of personal data to set individualized prices. States moved too: New York began requiring disclosure of personalized algorithmic pricing in 2025, Maryland moved to restrict it in 2026, and more than 40 state bills on algorithmic or surveillance pricing were filed across the United States in 2026.

So the trend line is clear, even if the law isn't finished. Regulators move at the speed of regulators, and the models ship weekly.

For consumers, the real issue is transparency: you can't contest a price you don't know is personalized. That's why the newest laws and regulations lean on disclosure — making a business tell shoppers when an algorithm set their price — and why consumer rights groups call disclosure alone weak medicine.

A law that only forces a company to admit it's happening doesn't force it to stop. Until the legal protections have teeth, the burden of noticing stays on you.

The honest read: the current legal landscape is a patchwork.

Most surveillance pricing is legal, lightly disclosed, and under growing scrutiny, with louder calls for accountability every year. "Legal for now" is not the same as "fine" — and unlike price gouging, no broad law yet treats charging you more for being you as off limits.

## How to protect yourself from surveillance pricing

**You can blunt it, but you can't fully beat it from your end.** The tactics work by starving the model of signals, and they help more often in retail than in travel, where your account ties everything together.

| Tactic | What it does | The catch |
|---|---|---|
| Compare across devices and browsers | Surfaces a price gap as your evidence | Only tells you after the fact |
| Browse logged out, in a private window | Strips cookies, your account and history | Device fingerprinting still works |
| Clear cookies between searches | Kills the "you came back" urgency signal | Resets your saved convenience too |
| Mask your location with a VPN | Tests whether your ZIP code moves the price | Some sites quietly block VPNs |

A couple of habits help at the margins too. Book from a device that isn't signed in to your shopping accounts, so there's no profile to match you against.

And shop before you're desperate — a model reads a frantic, last day search very differently from a relaxed one three weeks out. Urgency is one of the strongest signals a pricing system has, and one of the few you actually control.

Now the honest part, twice over. First, these are band aids: a determined model can still fingerprint your device or match you by login, so a clean private window is no guarantee.

Second, you shouldn't have to do any of this. Stripping your own data, opening incognito, and routing through a VPN turns booking a hotel into a low budget heist — and most people, reasonably, won't bother.

The real fix isn't a browser trick. It's buying from a seller that doesn't price you in the first place.

## The alternative: one price for everyone

**Our whole model is the opposite of surveillance pricing: what the hotel charges us, plus one small flat fee — the same price for everyone, never based on your data.**

The price is deterministic. The same hotel, the same dates, from any browser, phone, or state, returns the identical number.

That's a principle, not a slogan: a price should answer to the room, not to the shopper. We don't read your device, we don't weigh your ZIP code, and we don't run tests on what you'll tolerate. The fee is the same one your neighbor pays.

::infographic how-pricing-works

You can check our work, which is the point. Open a stay on your laptop, then open it on your phone on another network — same price. Try it across any of the [66,235 hotels in our directory](/search?destination=Oahu&adults=2) and the number won't flinch.

::infographic honest-vs-surveillance

We're not promising the lowest headline rate on the internet — the hotel sets its own base rate, and that still moves with demand for everyone. What we promise is the part we control: one honest, all in number, shown up front, identical for every shopper. That's [how our pricing works](/#how), and [why we built it this way](/about).

Planning a real trip rather than a principle? Our guide to [where to stay in Oahu](/blog/where-to-stay-in-oahu) runs on the same honest pricing.

And if you change one habit after reading this: before you book anything, check the price on a second device. If it matches, you've found a seller worth keeping.`,
  },
  {
    slug: "where-to-stay-in-oahu",
    title: "Where to Stay in Oahu: A Neighborhood Guide",
    description:
      "Where to stay in Oahu by neighborhood — Waikiki, Ko Olina, the North Shore, Kailua and Downtown — matched to the kind of trip you're taking.",
    excerpt:
      "Waikiki, Ko Olina, the North Shore or Kailua? A plain-English guide to picking the right Oahu base for your trip.",
    tldr: {
      answer:
        "For a first visit, base yourself in Waikiki — it's the most walkable, best-connected part of the island, so you spend less time driving and more time on the sand. Choose Ko Olina for young kids, the North Shore for winter surf, or Kailua if great beaches matter more than nightlife.",
      points: [
        "**Waikiki** — most hotels, walkable, no car needed; the easy default for first-timers.",
        "**Ko Olina** — calm lagoons 40 minutes west; the pick for families with young kids.",
        "**North Shore** — big winter surf and a slow pace; rent a car and skip the nightlife.",
        "**Kailua** — the island's best beaches, residential and low-key; a car is close to essential.",
      ],
    },
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

::hotel lp1e13c

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

When you search Oahu hotels with us, the number you see is the rate plus one small, flat fee — [the same for everyone](/#how), never shaped by your device, location or browsing history. That's the opposite of the [surveillance pricing](/blog/surveillance-pricing) other sites quietly run. No fake discounts, no "1 room left" pressure. Just the honest number, so comparing areas is comparing like for like.

::infographic how-pricing-works

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
