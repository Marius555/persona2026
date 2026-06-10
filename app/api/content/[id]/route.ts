import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import { deleteContentRow, getContentById } from "@/lib/appwrite/content";
import { getLoggedInUser } from "@/lib/appwrite/server";

/**
 * Delete one of the caller's offerings. Only the row is removed — the underlying
 * storage file stays in the media pool (it may be reused by other offerings or
 * have come from onboarding).
 */
export async function DELETE(
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

  try {
    await deleteContentRow(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Couldn't delete content" }, { status: 500 });
  }
}
