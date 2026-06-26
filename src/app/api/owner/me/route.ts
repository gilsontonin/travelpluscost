import { NextResponse } from "next/server";
import { getOwner } from "@/lib/authServer";

// Lightweight owner check for the /owner page UI (show dashboard vs "not authorized"). The real security is
// /api/owner/rates also gating on getOwner — net is never returned to a non-owner.
export const dynamic = "force-dynamic";

export async function GET() {
  const owner = await getOwner();
  return NextResponse.json({ owner: !!owner, email: owner?.email ?? null });
}
