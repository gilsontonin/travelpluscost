// Feature flags — safe to import on client OR server (NEXT_PUBLIC_* only).
// The "parked engine" pattern: ship the code, gate it behind a flag, flip it on later.
export type BookingMode = "affiliate" | "merchant";

const mode = (process.env.NEXT_PUBLIC_BOOKING_MODE as BookingMode) || "affiliate";

export const flags = {
  /** "affiliate" = redirect to partner (no checkout/liability). "merchant" = own checkout (later phase). */
  bookingMode: mode,
  /** Flights vertical (Duffel). Off until the merchant phase. */
  flightsEnabled: process.env.NEXT_PUBLIC_FLIGHTS_ENABLED === "true",
} as const;

export const isAffiliate = flags.bookingMode === "affiliate";
export const isMerchant = flags.bookingMode === "merchant";
