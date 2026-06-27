import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import { getLoggedInUser } from "@/lib/appwrite/server";
import {
  createTier,
  listTiersByCreator,
} from "@/lib/appwrite/subscriptions";
import { flattenFieldErrors } from "@/lib/validation/auth";
import { createTierSchema } from "@/lib/validation/subscription";

/** List the caller's subscription tiers, ordered for display. */
export async function GET() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tiers = await listTiersByCreator(user.$id);
  return NextResponse.json({ tiers });
}

/** Create a new subscription tier scoped to the caller. */
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

  const parsed = createTierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const tier = await createTier(user.$id, parsed.data);
    return NextResponse.json({ tier }, { status: 201 });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Couldn't create tier" }, { status: 500 });
  }
}
