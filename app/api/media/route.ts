import { NextResponse } from "next/server";

import { getMediaPool } from "@/lib/appwrite/media";
import { getLoggedInUser } from "@/lib/appwrite/server";

/**
 * The caller's reusable media pool — every file they've uploaded, with a
 * same-origin proxy URL the browser can render.
 */
export async function GET() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = await getMediaPool(user.$id);
  const pool = files.map((f) => ({
    fileId: f.fileId,
    mediaType: f.mediaType,
    src: `/api/media/${f.fileId}/file`,
  }));

  return NextResponse.json({ pool });
}
