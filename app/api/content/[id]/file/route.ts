import { NextResponse } from "next/server";

import { getContentById } from "@/lib/appwrite/content";
import { createAdminStorage, STORAGE_ID } from "@/lib/appwrite/db";
import { getLoggedInUser } from "@/lib/appwrite/server";

/**
 * Streams a content file back to its owner. Vault files are uploaded privately
 * (read-scoped to the owner), so the browser can't fetch them from Appwrite
 * directly — this proxy re-checks ownership and pipes the bytes through.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const row = await getContentById(id);
  if (!row || row.userId !== user.$id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!row.fileId) {
    // Non-file offerings (discount/event/perk) have no stored file.
    return NextResponse.json({ error: "Not a file" }, { status: 404 });
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
