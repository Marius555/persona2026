import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import { createContent, listContentByUserId } from "@/lib/appwrite/content";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { flattenFieldErrors } from "@/lib/validation/auth";
import { createContentSchema } from "@/lib/validation/content";

/** List the caller's vault. */
export async function GET() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await listContentByUserId(user.$id);
  return NextResponse.json({ content });
}

/**
 * Publish a new offering. For file offerings, the files must first be pushed to
 * storage via `POST /api/upload` (kind=content) — this endpoint only stores the
 * returned ids. Discounts/events/perks carry their data inline.
 */
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

  const parsed = createContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const content = await createContent(user.$id, parsed.data);
    return NextResponse.json({ content }, { status: 201 });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Couldn't publish content" }, { status: 500 });
  }
}
