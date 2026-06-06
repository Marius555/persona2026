import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import { getLoggedInUser } from "@/lib/appwrite/server";
import {
  getProfileByUserId,
  isUsernameTaken,
  upsertProfile,
} from "@/lib/appwrite/profile";
import { flattenFieldErrors } from "@/lib/validation/auth";
import { completeOnboardingSchema } from "@/lib/validation/onboarding";

/** Return the caller's onboarding progress (null if not started). */
export async function GET() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByUserId(user.$id);
  return NextResponse.json({ profile });
}

/** Persist the entire onboarding submission in one request (final step). */
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

  const parsed = completeOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const {
    username,
    niche,
    avatarFileId,
    bannerFileId,
    bgGradient,
    contentFileIds,
    botGoal,
  } = parsed.data;

  if (await isUsernameTaken(username, user.$id)) {
    return NextResponse.json(
      { fieldErrors: { username: "That username is already taken" } },
      { status: 409 },
    );
  }

  try {
    const profile = await upsertProfile(user.$id, {
      username,
      niche,
      avatarFileId: avatarFileId ?? null,
      bannerFileId: bannerFileId ?? null,
      bgGradient: bgGradient ?? null,
      contentFileIds,
      botGoal,
      onboardingComplete: true,
    });
    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    if (err instanceof AppwriteException) {
      // Unique-index violation on username (race between check and write).
      if (err.code === 409) {
        return NextResponse.json(
          { fieldErrors: { username: "That username is already taken" } },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
