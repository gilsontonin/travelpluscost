// Back-compat shim. The store is now multi-region — see hotels.ts + regions.ts.
// Existing imports (`@/lib/oahu`, `OahuHotel`, `getAllOahu`, …) keep working; new code
// should import from "@/lib/hotels".
export * from "./hotels";
export {
  getAllHotels as getAllOahu,
  getHotel as getOahuHotel,
  searchHotels as searchOahu,
} from "./hotels";
export type { Hotel as OahuHotel } from "./hotels";
