import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import { deletePoolFile, userOwnsFile } from "@/lib/appwrite/media";
import { getLoggedInUser } from "@/lib/appwrite/server";

/**
 * Permanently delete a pool file owned by the caller. Removes any content rows
 * that reference it, drops it from the profile's onboarding list, and deletes the
 * stored file — so the card disappears from the vault everywhere.
 */
export async function DELETE(
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
    await deletePoolFile(user.$id, fileId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Couldn't delete file" }, { status: 500 });
  }
}
