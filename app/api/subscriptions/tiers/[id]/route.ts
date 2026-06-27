import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import { getLoggedInUser } from "@/lib/appwrite/server";
import {
  deleteTier,
  getTierById,
  updateTier,
} from "@/lib/appwrite/subscriptions";
import { flattenFieldErrors } from "@/lib/validation/auth";
import { updateTierSchema } from "@/lib/validation/subscription";

/** Overwrite one of the caller's subscription tiers with a fresh draft. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const row = await getTierById(id);
  if (!row || row.userId !== user.$id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateTierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const tier = await updateTier(id, parsed.data);
    return NextResponse.json({ tier });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Couldn't update tier" }, { status: 500 });
  }
}

/** Delete one of the caller's subscription tiers. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const row = await getTierById(id);
  if (!row || row.userId !== user.$id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await deleteTier(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Couldn't delete tier" }, { status: 500 });
  }
}
