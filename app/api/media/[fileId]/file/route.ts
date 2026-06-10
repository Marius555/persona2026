import { NextResponse } from "next/server";

import { createAdminStorage, STORAGE_ID } from "@/lib/appwrite/db";
import { userOwnsFile } from "@/lib/appwrite/media";
import { getLoggedInUser } from "@/lib/appwrite/server";

/**
 * Streams a pool file back to its owner, keyed by storage file id. Pool files
 * are private, so the browser can't fetch them from Appwrite directly — this
 * proxy re-checks ownership and pipes the bytes through.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await params;
  if (!(await userOwnsFile(user.$id, fileId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const storage = createAdminStorage();
    const [meta, bytes] = await Promise.all([
      storage.getFile({ bucketId: STORAGE_ID, fileId }),
      storage.getFileView({ bucketId: STORAGE_ID, fileId }),
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
