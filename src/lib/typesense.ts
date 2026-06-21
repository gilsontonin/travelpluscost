// Typesense — search index for destination autocomplete + faceted hotel search.
// Two surfaces: an admin client (server, indexing) and a search-only config (browser).
import Typesense from "typesense";
import { serverEnv } from "./env";

/** Admin client — server-side ONLY (indexing, collection management). */
export function typesenseAdmin() {
  return new Typesense.Client({
    nodes: [
      {
        host: serverEnv.TYPESENSE_HOST,
        port: serverEnv.TYPESENSE_PORT,
        protocol: serverEnv.TYPESENSE_PROTOCOL,
      },
    ],
    apiKey: serverEnv.TYPESENSE_ADMIN_API_KEY,
    connectionTimeoutSeconds: 10,
  });
}

/** Search-only config for the browser (uses the public search-only key — safe to expose). */
export const typesenseSearchConfig = {
  host: process.env.NEXT_PUBLIC_TYPESENSE_HOST ?? "",
  port: Number(process.env.NEXT_PUBLIC_TYPESENSE_PORT ?? 443),
  protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL ?? "https",
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_KEY ?? "",
} as const;
