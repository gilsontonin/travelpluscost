// Provider adapter interface — the seam that makes the platform multi-vertical.
// Every supplier implements this; adding a vertical = a new adapter, not a new app.
//   hotels        -> LiteAPI   (live; see lib/oahu.ts content + lib/rates.ts pricing)
//   flights, cars -> Duffel    (scaffold; Duffel does both on one integration)
//   things-to-do  -> Viator    (scaffold; see lib/viator.ts)
import type { Vertical } from "../verticals";

export interface ListingSummary {
  id: string;
  vertical: Vertical;
  name: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
}

export interface RateOption {
  rateId: string;
  netCost: number; // supplier cost; our cost-plus engine (lib/pricing.ts) marks it up
  currency: string;
  label?: string;
}

export interface ProviderAdapter {
  id: string;
  vertical: Vertical;
  /** Browse/search listings (content). */
  search(params: Record<string, unknown>): Promise<ListingSummary[]>;
  /** Full content for one listing. */
  getDetails(id: string): Promise<unknown>;
  /** Live, per-date rates/availability. */
  getRates(query: Record<string, unknown>): Promise<RateOption[]>;
  /** Merchant phase only. */
  prebook?(rateId: string): Promise<unknown>;
  book?(prebookId: string, payment: unknown): Promise<unknown>;
}
