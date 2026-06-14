import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import {
  deleteContentRow,
  getContentById,
  updateContent,
} from "@/lib/appwrite/content";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { flattenFieldErrors } from "@/lib/validation/auth";
import { updateContentSchema } from "@/lib/validation/content";

/**
 * Edit one of the caller's offerings. The media file, `contentType`, and owner are
 * immutable — only the terms (tier/rarity/price) and type-specific copy change.
 */
export async function PATCH(
  request: Request,
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }
  // The content type is fixed at creation; editing can't morph the row.
  if (parsed.data.contentType !== row.contentType) {
    return NextResponse.json(
      { error: "Content type can't be changed" },
      { status: 422 },
    );
  }

  try {
    const content = await updateContent(id, parsed.data);
    return NextResponse.json({ content });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Couldn't update content" }, { status: 500 });
  }
}

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
