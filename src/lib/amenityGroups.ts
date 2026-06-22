// Categorize LiteAPI's flat amenity lists into Expedia-style groups by keyword (Internet, Parking,
// Bedroom, Bathroom, …). Pure — safe to run in a server component.

export interface AmenityGroup {
  title: string;
  icon: string;
  items: string[];
}

type Cat = { title: string; icon: string; match: RegExp };

const PROPERTY: Cat[] = [
  { title: "Internet", icon: "wifi", match: /wi-?fi|internet|wireless/i },
  { title: "Parking & transportation", icon: "parking", match: /parking|valet|shuttle|transfer|transport|car rental|garage/i },
  { title: "Pools, spa & fitness", icon: "pool", match: /pool|spa|sauna|hot tub|jacuzzi|fitness|gym|swimming|shallow end|massage|wellness|steam/i },
  { title: "Food & drink", icon: "food", match: /restaurant|\bbar\b|breakfast|coffee|caf[eé]|room service|dining|snack|lounge|buffet|minibar/i },
  { title: "Family", icon: "family", match: /child|kid|babysitt|cribs?|family|playground|game room/i },
  { title: "Accessibility", icon: "access", match: /disab|wheelchair|accessible|braille|grab rail|roll-in/i },
  { title: "Things to do", icon: "activity", match: /darts|golf|tennis|beach|bicycle|bike|games?|library|garden|terrace|water ?sport|snorkel|dive|entertainment|nightclub|casino|billiard/i },
  { title: "Services & conveniences", icon: "service", match: /concierge|luggage|laundry|dry clean|safe|deposit box|elevator|lift|front desk|tour desk|fax|photocop|currency|atm|24-hour|reception|housekeep|newspaper|wake-up|multilingual|ticket/i },
  { title: "Climate & comfort", icon: "climate", match: /air ?condition|heating|\bfan\b|smoking/i },
];

const ROOM: Cat[] = [
  { title: "Bedroom", icon: "bed", match: /bed|drape|curtain|blackout|pillow|linen|iron|closet|wardrobe|safe|cribs?|sofa|sheet/i },
  { title: "Bathroom", icon: "bath", match: /bath|shower|toilet|hair ?dryer|towel|toiletr|robe|slipper|bidet|amenit/i },
  { title: "Entertainment", icon: "tv", match: /\btv\b|television|cable|satellite|stream|netflix|video|music|radio|console/i },
  { title: "Food & drink", icon: "food", match: /coffee|tea|refriger|fridge|microwave|minibar|mini-bar|kitchen|kettle|stove|dishwasher|room service|snack|bottled water|cookware/i },
  { title: "Internet & phone", icon: "wifi", match: /wi-?fi|internet|telephone|phone|\bcalls?\b/i },
  { title: "Comfort", icon: "climate", match: /air ?condition|heating|\bfan\b|climate|soundproof/i },
  { title: "Outdoor & view", icon: "view", match: /lanai|balcon|patio|terrace|view|garden|ocean|courtyard|deck/i },
];

function categorize(items: string[], cats: Cat[]): AmenityGroup[] {
  const seen = new Set<string>();
  const groups = new Map<string, AmenityGroup>();
  const other: string[] = [];
  for (const raw of items) {
    const item = (raw || "").trim();
    if (!item || seen.has(item.toLowerCase())) continue;
    seen.add(item.toLowerCase());
    const cat = cats.find((c) => c.match.test(item));
    if (cat) {
      const g = groups.get(cat.title) ?? { title: cat.title, icon: cat.icon, items: [] };
      g.items.push(item);
      groups.set(cat.title, g);
    } else {
      other.push(item);
    }
  }
  const ordered: AmenityGroup[] = [];
  for (const c of cats) {
    const g = groups.get(c.title);
    if (g) ordered.push(g);
  }
  if (other.length) ordered.push({ title: "More", icon: "check", items: other });
  return ordered;
}

export const categorizeProperty = (items: string[]) => categorize(items, PROPERTY);
export const categorizeRoom = (items: string[]) => categorize(items, ROOM);
