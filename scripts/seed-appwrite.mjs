/**
 * Seeds the `profiles` table with a few realistic sample creators for local /
 * dev testing.
 *
 *   node scripts/seed-appwrite.mjs   (or: npm run seed:appwrite)
 *
 * Reads config from `.env` (APPWRITE_API_KEY must be a valid admin key) and the
 * target table id from `appwrite.schema.json`. Idempotent: rows whose username
 * already exists are skipped, so it is safe to re-run.
 *
 * NOTE: the media ids below (avatarFileId/bannerFileId/contentFileIds) are
 * placeholders — they satisfy the schema but do not resolve to real Storage
 * files, so seeded profiles render without working images.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { Client, TablesDB, ID, Query } from "node-appwrite";

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
  console.error("Missing APPWRITE_API_KEY in .env — cannot seed the database.");
  process.exit(1);
}

const schema = JSON.parse(
  readFileSync(join(root, "appwrite.schema.json"), "utf8"),
);
const PROFILES_TABLE_ID =
  schema.tables.find((t) => t.id === "profiles")?.id ?? "profiles";

const client = new Client()
  .setEndpoint(NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);
const tablesDB = new TablesDB(client);

/** Sample creators — one per niche. */
const SAMPLE_PROFILES = [
  {
    userId: "seed_glamour_user",
    username: "ava_glow",
    niche: "glamour",
    avatarFileId: "seed_avatar_ava",
    bannerFileId: "seed_banner_ava",
    contentFileIds: ["seed_content_ava_1", "seed_content_ava_2"],
    bgGradient: "linear-gradient(135deg, #f9a8d4 0%, #a78bfa 100%)",
    botGoal: "drive_subscriptions",
    onboardingComplete: true,
  },
  {
    userId: "seed_fitness_user",
    username: "max_lifts",
    niche: "fitness",
    avatarFileId: "seed_avatar_max",
    bannerFileId: "seed_banner_max",
    contentFileIds: ["seed_content_max_1"],
    bgGradient: "linear-gradient(135deg, #34d399 0%, #06b6d4 100%)",
    botGoal: "maximize_tokens",
    onboardingComplete: true,
  },
  {
    userId: "seed_cosplay_user",
    username: "rin_cosplays",
    niche: "cosplay",
    avatarFileId: "seed_avatar_rin",
    bannerFileId: null,
    contentFileIds: ["seed_content_rin_1", "seed_content_rin_2", "seed_content_rin_3"],
    bgGradient: "linear-gradient(135deg, #818cf8 0%, #f472b6 100%)",
    botGoal: "warm_fanbase",
    onboardingComplete: true,
  },
  {
    userId: "seed_sensual_user",
    username: "luna_velvet",
    niche: "sensual",
    avatarFileId: "seed_avatar_luna",
    bannerFileId: "seed_banner_luna",
    contentFileIds: ["seed_content_luna_1"],
    bgGradient: "linear-gradient(135deg, #fb7185 0%, #7c3aed 100%)",
    botGoal: "drive_subscriptions",
    onboardingComplete: true,
  },
];

/** True when a profile with this username already exists. */
async function usernameExists(username) {
  const { rows } = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: PROFILES_TABLE_ID,
    queries: [Query.equal("username", username), Query.limit(1)],
  });
  return rows.length > 0;
}

async function main() {
  console.log("Seeding sample profiles…");
  for (const profile of SAMPLE_PROFILES) {
    if (await usernameExists(profile.username)) {
      console.log(`  • ${profile.username} (already exists)`);
      continue;
    }
    await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: PROFILES_TABLE_ID,
      rowId: ID.unique(),
      data: profile,
    });
    console.log(`  ✓ ${profile.username}`);
  }
  console.log("Done. Sample profiles seeded.");
}

main().catch((err) => {
  console.error("Seeding failed:", err?.message ?? err);
  process.exit(1);
});
