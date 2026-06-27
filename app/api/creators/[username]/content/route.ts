import { NextResponse } from "next/server";

import { listContentByUserId } from "@/lib/appwrite/content";
import { getProfileByUsername } from "@/lib/appwrite/profile";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { getEntitlement } from "@/lib/subscriptions/entitlement";
import { buildFanVaultItems } from "@/lib/subscriptions/vault";

/**
 * A creator's fan-facing vault, gated by the viewer's subscription. Locked items
 * are returned without a file URL so the client can render a teaser; unlocked
 * items carry a proxied `src`. Logged-out viewers see everything as locked.
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

  const viewer = await getLoggedInUser();
  const [rows, entitlement] = await Promise.all([
    listContentByUserId(profile.userId),
    getEntitlement(viewer?.$id ?? null, profile.userId),
  ]);

  const items = buildFanVaultItems(rows, entitlement, username);
  return NextResponse.json({ items, subscribed: entitlement.subscribed });
}
