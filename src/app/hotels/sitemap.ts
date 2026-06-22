import type { MetadataRoute } from "next";
import { directoryCount, directoryIdsRange } from "@/lib/directory";
import { abs, SITEMAP_SHARD } from "@/lib/site";

// Sharded sitemap for the full 274k-hotel directory. Next serves these at
// /hotels/sitemap/[id].xml (one shard per SITEMAP_SHARD URLs). robots.txt advertises every shard.
// Daily ISR: each shard is generated once and cached/revalidated, not rebuilt per request.
export const revalidate = 86400;

export async function generateSitemaps() {
  const count = await directoryCount("us");
  const shards = Math.max(1, Math.ceil(count / SITEMAP_SHARD));
  return Array.from({ length: shards }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  // Next 16 passes the shard id as a Promise; await defensively (handles number or Promise<number>).
  const shardId = Number(await Promise.resolve(id as unknown as number | Promise<number>));
  const ids = await directoryIdsRange(shardId * SITEMAP_SHARD, SITEMAP_SHARD, "us");
  return ids.map((hid) => ({
    url: abs(`/hotel/${hid}`),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));
}
