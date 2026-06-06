/**
 * Idempotently provisions the Appwrite database from `appwrite.schema.json`
 * (tables + columns + indexes) — the single source of truth for the structure.
 *
 *   node scripts/setup-appwrite.mjs   (or: npm run setup:appwrite)
 *
 * Reads config from `.env` (APPWRITE_API_KEY must be a valid admin key).
 * Safe to re-run: anything that already exists is skipped.
 *
 * NOTE: enum `elements` in the schema must stay aligned with the matching Zod
 * enums in `lib/validation/onboarding.ts` (NICHES, BOT_GOALS).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { Client, TablesDB, TablesDBIndexType } from "node-appwrite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// --- minimal .env loader (handles `KEY = "value"` with spaces/quotes) ---
for (const line of readFileSync(join(root, ".env"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  const key = m[1];
  const value = m[2].trim().replace(/^["']|["']$/g, "");
  if (!(key in process.env)) process.env[key] = value;
}

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  DATABASE_ID,
} = process.env;

if (!APPWRITE_API_KEY) {
  console.error("Missing APPWRITE_API_KEY in .env — cannot provision the database.");
  process.exit(1);
}

/** Declarative structure, shared with the app and the seed script. */
const schema = JSON.parse(
  readFileSync(join(root, "appwrite.schema.json"), "utf8"),
);

const client = new Client()
  .setEndpoint(NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);
const tablesDB = new TablesDB(client);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const INDEX_TYPES = {
  unique: TablesDBIndexType.Unique,
  key: TablesDBIndexType.Key,
  fulltext: TablesDBIndexType.Fulltext,
};

/** Run an Appwrite call, treating "already exists" (409) as success. */
async function ensure(label, fn) {
  try {
    await fn();
    console.log(`  ✓ ${label}`);
  } catch (err) {
    if (err?.code === 409) {
      console.log(`  • ${label} (already exists)`);
    } else {
      throw err;
    }
  }
}

/** Poll until a column finishes processing so indexes can be built on it. */
async function waitForColumn(tableId, key) {
  for (let i = 0; i < 30; i++) {
    try {
      const col = await tablesDB.getColumn({
        databaseId: DATABASE_ID,
        tableId,
        key,
      });
      if (col.status === "available") return;
    } catch {
      /* not visible yet */
    }
    await sleep(500);
  }
  console.warn(`  ! column "${key}" not available after timeout — index may fail`);
}

/** Create a single column, dispatching on its declared `type`. */
function createColumn(tableId, col) {
  const base = { databaseId: DATABASE_ID, tableId, key: col.key };
  switch (col.type) {
    case "varchar":
      return tablesDB.createVarcharColumn({
        ...base,
        size: col.size,
        required: col.required ?? false,
        array: col.array ?? false,
      });
    case "enum":
      return tablesDB.createEnumColumn({
        ...base,
        elements: col.elements,
        required: col.required ?? false,
        array: col.array ?? false,
      });
    case "boolean":
      return tablesDB.createBooleanColumn({
        ...base,
        required: col.required ?? false,
        xdefault: col.default,
      });
    default:
      throw new Error(`Unsupported column type "${col.type}" for "${col.key}"`);
  }
}

async function provisionTable(table) {
  console.log(`Provisioning \`${table.id}\` table…`);

  await ensure("create table", () =>
    tablesDB.createTable({
      databaseId: DATABASE_ID,
      tableId: table.id,
      name: table.name ?? table.id,
    }),
  );

  for (const col of table.columns) {
    await ensure(`column ${col.key}`, () => createColumn(table.id, col));
  }

  const indexes = table.indexes ?? [];
  if (indexes.length) {
    console.log("Waiting for indexed columns to finish processing…");
    const indexedColumns = new Set(indexes.flatMap((idx) => idx.columns));
    for (const key of indexedColumns) {
      await waitForColumn(table.id, key);
    }

    for (const idx of indexes) {
      const type = INDEX_TYPES[idx.type];
      if (!type) throw new Error(`Unsupported index type "${idx.type}"`);
      await ensure(`${idx.type} index ${idx.key}`, () =>
        tablesDB.createIndex({
          databaseId: DATABASE_ID,
          tableId: table.id,
          key: idx.key,
          type,
          columns: idx.columns,
        }),
      );
    }
  }
}

async function main() {
  for (const table of schema.tables) {
    await provisionTable(table);
  }
  console.log("Done. Database is ready.");
}

main().catch((err) => {
  console.error("Setup failed:", err?.message ?? err);
  process.exit(1);
});
