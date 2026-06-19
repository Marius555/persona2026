import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import {
  createCollection,
  listCollectionsByUserId,
} from "@/lib/appwrite/collections";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { flattenFieldErrors } from "@/lib/validation/auth";
import { createCollectionSchema } from "@/lib/validation/collection";

/** List the caller's collections, newest first. */
export async function GET() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = await listCollectionsByUserId(user.$id);
  return NextResponse.json({ collections });
}

/** Create a new collection within a tier. */
export async function POST(request: Request) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const collection = await createCollection(user.$id, parsed.data);
    return NextResponse.json({ collection }, { status: 201 });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json(
      { error: "Couldn't create collection" },
      { status: 500 },
    );
  }
}
