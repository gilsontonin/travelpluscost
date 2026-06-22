// Seasonal home collection — pure date logic, no cost. Swaps the featured rail by month, pointing
// at season-appropriate US states (we have `state` on every hotel now). Discovery only, not pricing.
export interface SeasonCollection {
  key: string;
  title: string;
  subtitle: string;
  states: string[]; // USPS codes — fed to hotelsByStates()
}

export function currentSeasonCollection(date = new Date()): SeasonCollection {
  const m = date.getMonth(); // 0 = January
  if (m === 11 || m <= 1) {
    return { key: "winter", title: "Warm winter escapes", subtitle: "Sun while it's cold out", states: ["HI", "FL", "AZ", "CA", "NV", "TX", "LA", "SC", "GA"] };
  }
  if (m <= 4) {
    return { key: "spring", title: "Spring getaways", subtitle: "Mild weather, fewer crowds", states: ["AZ", "UT", "NV", "CA", "SC", "NC", "TN", "GA"] };
  }
  if (m <= 7) {
    return { key: "summer", title: "Summer by the beach", subtitle: "Sand, surf, and long days", states: ["HI", "CA", "FL", "SC", "NC", "OR", "ME", "NJ", "MA"] };
  }
  return { key: "fall", title: "Fall escapes", subtitle: "Crisp air and autumn color", states: ["VT", "NH", "ME", "CO", "NC", "TN", "NY", "MI"] };
}
