// Server-only environment access + validation.
// Do NOT import this from client components — it reads server secrets.
//
// Values default to "" so `next build` / typecheck succeed BEFORE the accounts are
// provisioned (Phase 0). Call requireEnv() at runtime to fail loudly the moment a
// needed secret is actually used but missing.
import { z } from "zod";

const serverSchema = z.object({
  // LiteAPI
  LITEAPI_KEY: z.string().default(""),
  LITEAPI_SANDBOX: z.string().default(""), // safe test bookings (no real charge)
  LITEAPI_ENV: z.enum(["sandbox", "production"]).default("production"),
  LITEAPI_BASE_URL: z.string().default("https://api.liteapi.travel/v3.0"), // search + static content
  LITEAPI_BOOK_BASE_URL: z.string().default("https://book.liteapi.travel/v3.0"), // prebook/book/manage — DIFFERENT host
  LITEAPI_WEBHOOK_SECRET: z.string().default(""), // shared secret to verify inbound LiteAPI webhook calls

  // Supabase (new key format: sb_secret_… server-only; sb_publishable_… is the NEXT_PUBLIC anon key)
  SUPABASE_SECRET_KEY: z.string().default(""),

  // Typesense (admin / indexing)
  TYPESENSE_HOST: z.string().default(""),
  TYPESENSE_PORT: z.coerce.number().default(443),
  TYPESENSE_PROTOCOL: z.enum(["http", "https"]).default("https"),
  TYPESENSE_ADMIN_API_KEY: z.string().default(""),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().default(""),

  // Travelpayouts (affiliate)
  TRAVELPAYOUTS_MARKER: z.string().default(""),
  TRAVELPAYOUTS_TOKEN: z.string().default(""),

  // Duffel (flights — later)
  DUFFEL_API_TOKEN: z.string().default(""),
});

export const serverEnv = serverSchema.parse(process.env);
export type ServerEnv = typeof serverEnv;

/** Return the value or throw a clear error if it's unset. Use at call time, not import time. */
export function requireEnv<K extends keyof ServerEnv>(key: K): ServerEnv[K] {
  const value = serverEnv[key];
  if (value === "" || value === undefined || value === null) {
    throw new Error(
      `Missing required env var ${String(key)}. Add it to .env.local (see .env.example).`,
    );
  }
  return value;
}
