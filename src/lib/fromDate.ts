// A representative "from" date for the blog's price chips: a midweek night ~3 weeks out, where nearly
// every hotel has availability. Pricing for *tomorrow* left lots of hotels sold out (no rate → patchy
// "See your price" cards); a near-future Tuesday gives uniform coverage. Used by the blog price fetches
// only — does NOT touch the global defaultDates() (search/property/home keep their near-term "from").
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fromDate(): { checkin: string; checkout: string } {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 21);
  d.setDate(d.getDate() + ((2 - d.getDay() + 7) % 7)); // nudge to the next Tuesday (high midweek availability, lower rate)
  const checkin = ymd(d);
  d.setDate(d.getDate() + 1);
  return { checkin, checkout: ymd(d) };
}
