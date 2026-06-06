import { NextResponse } from "next/server";

import { getLoggedInUser } from "@/lib/appwrite/server";
import { isUsernameTaken } from "@/lib/appwrite/profile";
import { usernameSchema } from "@/lib/validation/onboarding";

/**
 * Live availability check for the handle step.
 * `GET /api/onboarding/username?value=foo` -> `{ available, reason? }`.
 */
export async function GET(request: Request) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const value = new URL(request.url).searchParams.get("value") ?? "";
  const parsed = usernameSchema.safeParse(value);
  if (!parsed.success) {
    return NextResponse.json({
      available: false,
      reason: parsed.error.issues[0]?.message ?? "Invalid username",
    });
  }

  const taken = await isUsernameTaken(parsed.data, user.$id);
  return NextResponse.json({
    available: !taken,
    reason: taken ? "That username is already taken" : undefined,
  });
}
