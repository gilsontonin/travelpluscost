// US state code ↔ name ↔ url-slug. Used by the browse index (/hotels), state hubs
// (/destinations/<state>), and city-hub cross-links. The directory stores 2-letter codes in
// hotels.state; we display full names and route on slugs (e.g. "TX" → "Texas" → "texas").

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  // territories that appear in LiteAPI US data
  PR: "Puerto Rico", VI: "U.S. Virgin Islands", GU: "Guam",
};

const SLUG_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAMES).map(([code, name]) => [stateSlug(name), code]),
);

export function stateName(code: string | null | undefined): string | null {
  return code ? STATE_NAMES[code.toUpperCase()] ?? null : null;
}

export function stateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export function stateCodeFromSlug(slug: string): string | null {
  return SLUG_TO_CODE[slug.toLowerCase()] ?? null;
}

export function stateSlugFromCode(code: string): string | null {
  const name = stateName(code);
  return name ? stateSlug(name) : null;
}
