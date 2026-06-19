import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import {
  deleteCollection,
  getCollectionById,
  updateCollection,
} from "@/lib/appwrite/collections";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { flattenFieldErrors } from "@/lib/validation/auth";
import { updateCollectionSchema } from "@/lib/validation/collection";

/** Rename and/or toggle the visibility of one of the caller's collections. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const row = await getCollectionById(id);
  if (!row || row.userId !== user.$id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const collection = await updateCollection(id, parsed.data);
    return NextResponse.json({ collection });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json(
      { error: "Couldn't update collection" },
      { status: 500 },
    );
  }
}

/**
 * Delete one of the caller's collections. Content rows that referenced it keep
 * their (now dangling) `collectionId` and fall back to the tier's "All" view.
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
  const row = await getCollectionById(id);
  if (!row || row.userId !== user.$id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await deleteCollection(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json(
      { error: "Couldn't delete collection" },
      { status: 500 },
    );
  }
}
