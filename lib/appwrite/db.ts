import "server-only";

import { Storage, TablesDB } from "node-appwrite";

import { createAuthClient } from "./server";
import {
  COLLECTIONS_TABLE_ID,
  CONTENT_TABLE_ID,
  PROFILES_TABLE_ID,
  SUBSCRIPTION_TIERS_TABLE_ID,
  SUBSCRIPTIONS_TABLE_ID,
} from "./schema";

/**
 * Server-only Appwrite database/storage configuration. These IDs are NOT
 * `NEXT_PUBLIC_*`, so they must never be imported into client components — keep
 * all access behind REST route handlers.
 */
export const DATABASE_ID = process.env.DATABASE_ID!;
export const STORAGE_ID = process.env.STORAGE_ID!;

/**
 * Custom (stable) table ids, sourced from `appwrite.schema.json` (the single
 * source of truth, applied by scripts/setup-appwrite.mjs).
 */
export {
  PROFILES_TABLE_ID,
  CONTENT_TABLE_ID,
  COLLECTIONS_TABLE_ID,
  SUBSCRIPTION_TIERS_TABLE_ID,
  SUBSCRIPTIONS_TABLE_ID,
};

/**
 * Admin-scoped TablesDB. `createAuthClient()` attaches the API key when
 * `APPWRITE_API_KEY` is set, so these bypass per-row permissions; route
 * handlers are responsible for scoping every read/write to the logged-in user.
 */
export function createAdminTablesDB(): TablesDB {
  return new TablesDB(createAuthClient());
}

/** Admin-scoped Storage for uploading onboarding media. */
export function createAdminStorage(): Storage {
  return new Storage(createAuthClient());
}
