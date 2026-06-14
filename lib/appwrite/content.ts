import "server-only";

import { ID, Permission, Query, Role } from "node-appwrite";

import { CONTENT_TABLE_ID, createAdminTablesDB, DATABASE_ID } from "./db";
import type { CreateContent, UpdateContent } from "@/lib/validation/content";
import type {
  ContentRarity,
  ContentTier,
  ContentType,
  MediaType,
} from "@/lib/validation/content";

/** A content row as stored in the `content` table. */
export interface ContentRow {
  $id: string;
  $createdAt: string;
  userId: string;
  contentType: ContentType;
  tier: ContentTier;
  rarity: ContentRarity | null;
  tokenValue: number | null;
  title: string | null;
  description: string | null;
  fileId: string | null;
  mediaType: MediaType | null;
  discountPercent: number | null;
  eventAt: string | null;
  eventLocation: string | null;
}

/** Every type-specific column, defaulted to null so each insert sets them all. */
function blankTypeColumns() {
  return {
    title: null as string | null,
    description: null as string | null,
    fileId: null as string | null,
    mediaType: null as MediaType | null,
    discountPercent: null as number | null,
    eventAt: null as string | null,
    eventLocation: null as string | null,
  };
}

/** The caller's vault, newest first. */
export async function listContentByUserId(
  userId: string,
): Promise<ContentRow[]> {
  const db = createAdminTablesDB();
  const { rows } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: CONTENT_TABLE_ID,
    queries: [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ],
  });
  return rows as unknown as ContentRow[];
}

/** A single content row by id, or null if it doesn't exist. */
export async function getContentById(id: string): Promise<ContentRow | null> {
  const db = createAdminTablesDB();
  try {
    const row = await db.getRow({
      databaseId: DATABASE_ID,
      tableId: CONTENT_TABLE_ID,
      rowId: id,
    });
    return row as unknown as ContentRow;
  } catch {
    return null;
  }
}

/** All `fileId`s the caller already references via file-type content rows. */
export async function listContentFileIds(userId: string): Promise<string[]> {
  const rows = await listContentByUserId(userId);
  return rows
    .filter((r) => r.contentType === "file" && r.fileId)
    .map((r) => r.fileId as string);
}

/**
 * Persist one publish action. File batches create a row per file; every other
 * type creates a single offering. Returns the created rows (newest first).
 */
export async function createContent(
  userId: string,
  payload: CreateContent,
): Promise<ContentRow[]> {
  const db = createAdminTablesDB();
  const { tier, rarity, tokenValue } = payload;

  const terms = {
    userId,
    tier,
    // Rarity only applies to gamble drops.
    rarity: tier === "gamble" ? rarity ?? null : null,
    tokenValue: tokenValue ?? null,
  };
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];

  /** Build the per-type column payload for one row. */
  const dataFor = (): Record<string, unknown>[] => {
    switch (payload.contentType) {
      case "file":
        return payload.items.map((item) => ({
          ...blankTypeColumns(),
          contentType: "file",
          fileId: item.fileId,
          mediaType: item.mediaType,
          // Shared batch title/description, falling back to any per-item title.
          title: payload.title?.trim() || item.title?.trim() || null,
          description: payload.description?.trim() || null,
        }));
      case "discount":
        return [
          {
            ...blankTypeColumns(),
            contentType: "discount",
            title: payload.title,
            description: payload.description?.trim() || null,
            discountPercent: payload.discountPercent,
          },
        ];
      case "event":
        return [
          {
            ...blankTypeColumns(),
            contentType: "event",
            title: payload.title,
            description: payload.description?.trim() || null,
            eventAt: payload.eventAt,
            eventLocation: payload.eventLocation?.trim() || null,
          },
        ];
      case "perk":
        return [
          {
            ...blankTypeColumns(),
            contentType: "perk",
            title: payload.title,
            description: payload.description,
          },
        ];
    }
  };

  const created: ContentRow[] = [];
  for (const data of dataFor()) {
    const row = await db.createRow({
      databaseId: DATABASE_ID,
      tableId: CONTENT_TABLE_ID,
      rowId: ID.unique(),
      data: { ...terms, ...data },
      permissions,
    });
    created.push(row as unknown as ContentRow);
  }
  return created;
}

/**
 * Apply an edit to an existing offering. `contentType`, `fileId`, and `mediaType`
 * are immutable, so only the terms and type-specific columns are written. Rarity
 * is cleared unless the row is a gamble drop, mirroring `createContent`.
 */
export async function updateContent(
  id: string,
  payload: UpdateContent,
): Promise<ContentRow> {
  const db = createAdminTablesDB();
  const { tier, rarity, tokenValue } = payload;

  const data: Record<string, unknown> = {
    tier,
    rarity: tier === "gamble" ? rarity ?? null : null,
    tokenValue: tokenValue ?? null,
    title: payload.title?.trim() || null,
    description: payload.description?.trim() || null,
  };
  if (payload.contentType === "discount") {
    data.discountPercent = payload.discountPercent;
  } else if (payload.contentType === "event") {
    data.eventAt = payload.eventAt;
    data.eventLocation = payload.eventLocation?.trim() || null;
  }

  const row = await db.updateRow({
    databaseId: DATABASE_ID,
    tableId: CONTENT_TABLE_ID,
    rowId: id,
    data,
  });
  return row as unknown as ContentRow;
}

/** Delete every one of the caller's content rows that references `fileId`. */
export async function deleteContentRowsByFileId(
  userId: string,
  fileId: string,
): Promise<void> {
  const rows = await listContentByUserId(userId);
  for (const row of rows) {
    if (row.fileId === fileId) {
      await deleteContentRow(row.$id);
    }
  }
}

/**
 * Delete a content row. The underlying storage file is intentionally left in the
 * pool — it may be reused by other offerings or have come from onboarding.
 */
export async function deleteContentRow(id: string): Promise<void> {
  const db = createAdminTablesDB();
  await db.deleteRow({
    databaseId: DATABASE_ID,
    tableId: CONTENT_TABLE_ID,
    rowId: id,
  });
}
