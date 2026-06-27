import { NextResponse } from "next/server";

import { getProfileByUsername } from "@/lib/appwrite/profile";
import { listVisibleTiersByCreator } from "@/lib/appwrite/subscriptions";

/**
 * Public list of a creator's published subscription tiers, by username. No auth —
 * this powers the fan-facing pricing view. Only `visible` tiers are returned.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const profile = await getProfileByUsername(username);
  if (!profile) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const tiers = await listVisibleTiersByCreator(profile.userId);
  return NextResponse.json({ tiers });
}
