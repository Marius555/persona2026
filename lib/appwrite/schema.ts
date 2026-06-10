import schema from "@/appwrite.schema.json";

/**
 * Typed bridge to `appwrite.schema.json` — the single source of truth for the
 * Appwrite database structure (also consumed by scripts/setup-appwrite.mjs and
 * scripts/seed-appwrite.mjs). Importable from server or client; table ids are
 * not secrets. The database id itself lives in `.env` (DATABASE_ID).
 */

/** Look up a table id by its schema key, failing loudly if the schema drifts. */
function tableId(id: string): string {
  const table = schema.tables.find((t) => t.id === id);
  if (!table) throw new Error(`Table "${id}" missing from appwrite.schema.json`);
  return table.id;
}

/** Custom (stable) table id for creator profiles. */
export const PROFILES_TABLE_ID = tableId("profiles");

/** Custom (stable) table id for published content (the creator's vault). */
export const CONTENT_TABLE_ID = tableId("content");
