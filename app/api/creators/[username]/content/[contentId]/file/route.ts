import { NextResponse } from "next/server";

import { getContentById } from "@/lib/appwrite/content";
import { createAdminStorage, STORAGE_ID } from "@/lib/appwrite/db";
import { getProfileByUsername } from "@/lib/appwrite/profile";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { canAccessContent, getEntitlement } from "@/lib/subscriptions/entitlement";

/**
 * Streams a creator's exclusive file to an entitled subscriber. Mirrors the
 * owner-only media proxy, but the gate is the viewer's active subscription tier
 * (or being the creator) rather than file ownership.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string; contentId: string }> },
) {
  const { username, contentId } = await params;

  const viewer = await getLoggedInUser();
  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByUsername(username);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = await getContentById(contentId);
  if (
    !row ||
    row.userId !== profile.userId ||
    row.contentType !== "file" ||
    !row.fileId
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const entitlement = await getEntitlement(viewer.$id, profile.userId);
  if (!canAccessContent(entitlement, row)) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  try {
    const storage = createAdminStorage();
    const [meta, bytes] = await Promise.all([
      storage.getFile({ bucketId: STORAGE_ID, fileId: row.fileId }),
      storage.getFileView({ bucketId: STORAGE_ID, fileId: row.fileId }),
    ]);

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": meta.mimeType || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }
}
