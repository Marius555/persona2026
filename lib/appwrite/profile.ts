import "server-only";

import { ID, Query } from "node-appwrite";

import {
  createAdminTablesDB,
  DATABASE_ID,
  PROFILES_TABLE_ID,
} from "./db";
import type { BotGoal, Niche } from "@/lib/validation/onboarding";

/** A creator profile row as stored in the `profiles` table. */
export interface ProfileRow {
  $id: string;
  userId: string;
  username: string | null;
  niche: Niche | null;
  avatarFileId: string | null;
  bannerFileId: string | null;
  contentFileIds: string[] | null;
  bgGradient: string | null;
  botGoal: BotGoal | null;
  onboardingComplete: boolean;
}

/** Columns a route is allowed to write. */
export type ProfileData = Partial<Omit<ProfileRow, "$id" | "userId">>;

/** The caller's profile row, or null if onboarding hasn't started yet. */
export async function getProfileByUserId(
  userId: string,
): Promise<ProfileRow | null> {
  const db = createAdminTablesDB();
  const { rows } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: PROFILES_TABLE_ID,
    queries: [Query.equal("userId", userId), Query.limit(1)],
  });
  return (rows[0] as unknown as ProfileRow) ?? null;
}

/**
 * True when `username` is owned by a *different* user. Pass the current user's
 * id so they can keep their own handle when revisiting step 1.
 */
export async function isUsernameTaken(
  username: string,
  exceptUserId?: string,
): Promise<boolean> {
  const db = createAdminTablesDB();
  const { rows } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: PROFILES_TABLE_ID,
    queries: [Query.equal("username", username), Query.limit(1)],
  });
  const owner = rows[0] as unknown as ProfileRow | undefined;
  return !!owner && owner.userId !== exceptUserId;
}

/** Create the caller's profile row if absent, otherwise patch it. */
export async function upsertProfile(
  userId: string,
  data: ProfileData,
): Promise<ProfileRow> {
  const db = createAdminTablesDB();
  const existing = await getProfileByUserId(userId);

  if (!existing) {
    const row = await db.createRow({
      databaseId: DATABASE_ID,
      tableId: PROFILES_TABLE_ID,
      rowId: ID.unique(),
      data: { userId, onboardingComplete: false, ...data },
    });
    return row as unknown as ProfileRow;
  }

  const row = await db.updateRow({
    databaseId: DATABASE_ID,
    tableId: PROFILES_TABLE_ID,
    rowId: existing.$id,
    data,
  });
  return row as unknown as ProfileRow;
}
