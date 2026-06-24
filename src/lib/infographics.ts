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
  "branson-by-numbers": {
    kind: "stat",
    title: "Branson by the numbers",
    stats: [
      { value: "16,500+", label: "hotel rooms in one small town" },
      { value: "100+", label: "live shows on and off the Strip" },
      { value: "800 mi", label: "of Table Rock Lake shoreline" },
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
