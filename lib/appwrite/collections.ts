import "server-only";

import { ID, Permission, Query, Role } from "node-appwrite";

import { COLLECTIONS_TABLE_ID, createAdminTablesDB, DATABASE_ID } from "./db";
import type {
  CreateCollection,
  UpdateCollection,
} from "@/lib/validation/collection";
import type { ContentTier } from "@/lib/validation/content";

/** A collection row as stored in the `collections` table. */
export interface CollectionRow {
  $id: string;
  $createdAt: string;
  userId: string;
  tier: ContentTier;
  name: string;
  // Rows created before the `visible` column was added read back as undefined;
  // treat that as visible (the column default).
  visible?: boolean;
}

/** The caller's collections, newest first. */
export async function listCollectionsByUserId(
  userId: string,
): Promise<CollectionRow[]> {
  const db = createAdminTablesDB();
  const { rows } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: COLLECTIONS_TABLE_ID,
    queries: [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ],
  });
  return rows as unknown as CollectionRow[];
}

/** Create a collection scoped to the caller. */
export async function createCollection(
  userId: string,
  payload: CreateCollection,
): Promise<CollectionRow> {
  const db = createAdminTablesDB();
  const row = await db.createRow({
    databaseId: DATABASE_ID,
    tableId: COLLECTIONS_TABLE_ID,
    rowId: ID.unique(),
    data: { userId, tier: payload.tier, name: payload.name },
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });
  return row as unknown as CollectionRow;
}

/**
 * Apply a partial edit (rename and/or visibility) to a collection. Only the
 * provided keys are written, so a rename never clobbers the visibility flag.
 */
export async function updateCollection(
  id: string,
  payload: UpdateCollection,
): Promise<CollectionRow> {
  const db = createAdminTablesDB();
  const data: Record<string, unknown> = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.visible !== undefined) data.visible = payload.visible;

  const row = await db.updateRow({
    databaseId: DATABASE_ID,
    tableId: COLLECTIONS_TABLE_ID,
    rowId: id,
    data,
  });
  return row as unknown as CollectionRow;
}

/** A single collection row by id, or null if it doesn't exist. */
export async function getCollectionById(
  id: string,
): Promise<CollectionRow | null> {
  const db = createAdminTablesDB();
  try {
    const row = await db.getRow({
      databaseId: DATABASE_ID,
      tableId: COLLECTIONS_TABLE_ID,
      rowId: id,
    });
    return row as unknown as CollectionRow;
  } catch {
    return null;
  }
}

/**
 * Delete a collection. Content rows that referenced it keep their (now dangling)
 * `collectionId` and simply fall back to the tier's "All" view.
 */
export async function deleteCollection(id: string): Promise<void> {
  const db = createAdminTablesDB();
  await db.deleteRow({
    databaseId: DATABASE_ID,
    tableId: COLLECTIONS_TABLE_ID,
    rowId: id,
  });
}
