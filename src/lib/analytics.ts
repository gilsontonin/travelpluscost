// GA4 event tracking. gtag.js is loaded by <GoogleAnalytics> (src/app/layout.tsx) in PRODUCTION only, so
// every call here is a silent no-op in dev or anywhere GA isn't present (no console noise). One place for
// the booking funnel so events read consistently in GA4. The GA4 ecommerce event names (view_item /
// begin_checkout / purchase) are used where they map, so GA4's built-in funnel + revenue (Monetization)
// reports light up for free — i.e. we measure the things page_view alone can't: search terms, the
// "see rooms" intent click, sign-ups, and real booking revenue.
type Params = Record<string, unknown>;

export function track(name: string, params?: Params): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  if (!w.dataLayer || typeof w.gtag !== "function") return; // GA not loaded (e.g. local dev) — no-op
  w.gtag("event", name, params ?? {});
}

const items = (hotelId?: string, hotelName?: string) =>
  hotelId ? [{ item_id: hotelId, item_name: hotelName, item_category: "hotel" }] : undefined;

// Funnel: search → view_item → view_rooms → begin_checkout → purchase (+ sign_up off to the side).
export const analytics = {
  search: (p: { destination?: string; vibe?: string; checkin?: string; checkout?: string; adults?: number }) =>
    track("search", {
      search_term: p.destination || p.vibe || "",
      checkin: p.checkin || undefined,
      checkout: p.checkout || undefined,
      adults: p.adults,
    }),
  viewHotel: (p: { hotelId: string; hotelName?: string; city?: string }) =>
    track("view_item", { items: items(p.hotelId, p.hotelName), city: p.city }),
  viewRooms: (p: { hotelId: string; hotelName?: string }) =>
    track("view_rooms", { items: items(p.hotelId, p.hotelName) }),
  beginCheckout: (p: { hotelId?: string; hotelName?: string; value?: number; currency?: string }) =>
    track("begin_checkout", { value: p.value, currency: p.currency, items: items(p.hotelId, p.hotelName) }),
  purchase: (p: { transactionId: string; value: number; currency: string; hotelId?: string; hotelName?: string }) =>
    track("purchase", {
      transaction_id: p.transactionId,
      value: p.value,
      currency: p.currency,
      items: items(p.hotelId, p.hotelName),
    }),
  signUp: (p?: { method?: string }) => track("sign_up", { method: p?.method ?? "email" }),
};
