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
  "how-pricing-works": {
    kind: "steps",
    title: "How your price is built",
    steps: [
      { title: "The hotel's rate", detail: "What the hotel charges us for the room." },
      { title: "One small flat fee", detail: "The same fee for everyone — never set from your data." },
      { title: "The price you see", detail: "All-in and shown up front. No surprises at the last screen." },
    ],
  },
};

export function getInfographic(key: string): Infographic | null {
  return INFOGRAPHICS[key] ?? null;
}
