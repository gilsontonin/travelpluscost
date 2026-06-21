// Upstash Redis — short-TTL cache for live rate responses (server-side only).
import { Redis } from "@upstash/redis";
import { requireEnv } from "./env";

let client: Redis | null = null;

export function redis(): Redis {
  if (!client) {
    client = new Redis({
      url: requireEnv("UPSTASH_REDIS_REST_URL"),
      token: requireEnv("UPSTASH_REDIS_REST_TOKEN"),
    });
  }
  return client;
}

/** Cache-aside: return the cached value, or compute it, store with TTL, and return it. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const hit = await redis().get<T>(key);
  if (hit !== null && hit !== undefined) return hit;
  const value = await compute();
  await redis().set(key, value, { ex: ttlSeconds });
  return value;
}
