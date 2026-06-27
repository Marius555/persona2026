import "server-only";

import { ID, Permission, Query, Role } from "node-appwrite";

import {
  createAdminTablesDB,
  DATABASE_ID,
  SUBSCRIPTION_TIERS_TABLE_ID,
  SUBSCRIPTIONS_TABLE_ID,
} from "./db";
import type { CreateTier, UpdateTier } from "@/lib/validation/subscription";
import type {
  BillingPeriod,
  SubscriptionCurrency,
  SubscriptionStatus,
} from "@/lib/validation/subscription";
import { ACTIVE_SUBSCRIPTION_STATUSES } from "@/lib/validation/subscription";

// --- subscription tiers -----------------------------------------------------

/** A subscription tier row as stored in the `subscription_tiers` table. */
export interface TierRow {
  $id: string;
  $createdAt: string;
  userId: string;
  name: string;
  tagline: string | null;
  description: string | null;
  priceCents: number;
  currency: SubscriptionCurrency | null;
  billingPeriod: BillingPeriod | null;
  includedCollectionIds: string[] | null;
  unlocksAllExclusive: boolean;
  benefits: string[] | null;
  coverFileId: string | null;
  trialDays: number | null;
  introDiscountPercent: number | null;
  introLabel: string | null;
  subscriberCap: number | null;
  visible: boolean;
  sortOrder: number | null;
}

/** Flatten a validated draft into the column set both create and update write. */
function toTierData(payload: CreateTier | UpdateTier) {
  return {
    name: payload.name,
    tagline: payload.tagline ?? null,
    description: payload.description ?? null,
    priceCents: payload.priceCents,
    currency: payload.currency,
    billingPeriod: payload.billingPeriod,
    includedCollectionIds: payload.includedCollectionIds,
    unlocksAllExclusive: payload.unlocksAllExclusive,
    benefits: payload.benefits,
    coverFileId: payload.coverFileId ?? null,
    trialDays: payload.trialDays,
    introDiscountPercent: payload.introDiscountPercent ?? null,
    introLabel: payload.introLabel ?? null,
    subscriberCap: payload.subscriberCap,
    visible: payload.visible,
    sortOrder: payload.sortOrder,
  };
}

/** The creator's tiers, ordered for display (sortOrder, then newest first). */
export async function listTiersByCreator(userId: string): Promise<TierRow[]> {
  const db = createAdminTablesDB();
  const { rows } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTION_TIERS_TABLE_ID,
    queries: [
      Query.equal("userId", userId),
      Query.orderAsc("sortOrder"),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ],
  });
  return rows as unknown as TierRow[];
}

/** Only the creator's published (fan-facing) tiers — used by the public view. */
export async function listVisibleTiersByCreator(
  userId: string,
): Promise<TierRow[]> {
  const db = createAdminTablesDB();
  const { rows } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTION_TIERS_TABLE_ID,
    queries: [
      Query.equal("userId", userId),
      Query.equal("visible", true),
      Query.orderAsc("sortOrder"),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ],
  });
  return rows as unknown as TierRow[];
}

/** A single tier row by id, or null if it doesn't exist. */
export async function getTierById(id: string): Promise<TierRow | null> {
  const db = createAdminTablesDB();
  try {
    const row = await db.getRow({
      databaseId: DATABASE_ID,
      tableId: SUBSCRIPTION_TIERS_TABLE_ID,
      rowId: id,
    });
    return row as unknown as TierRow;
  } catch {
    return null;
  }
}

/** Create a subscription tier scoped to the creator. */
export async function createTier(
  userId: string,
  payload: CreateTier,
): Promise<TierRow> {
  const db = createAdminTablesDB();
  const row = await db.createRow({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTION_TIERS_TABLE_ID,
    rowId: ID.unique(),
    data: { userId, ...toTierData(payload) },
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });
  return row as unknown as TierRow;
}

/** Overwrite an existing tier with a fresh draft (the whole form is re-sent). */
export async function updateTier(
  id: string,
  payload: UpdateTier,
): Promise<TierRow> {
  const db = createAdminTablesDB();
  const row = await db.updateRow({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTION_TIERS_TABLE_ID,
    rowId: id,
    data: toTierData(payload),
  });
  return row as unknown as TierRow;
}

/** Delete a tier. Existing subscriptions keep their (now dangling) tierId. */
export async function deleteTier(id: string): Promise<void> {
  const db = createAdminTablesDB();
  await db.deleteRow({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTION_TIERS_TABLE_ID,
    rowId: id,
  });
}

// --- subscriptions ----------------------------------------------------------

/** A fan↔creator subscription record as stored in the `subscriptions` table. */
export interface SubscriptionRow {
  $id: string;
  $createdAt: string;
  fanUserId: string;
  creatorUserId: string;
  tierId: string;
  status: SubscriptionStatus;
  startedAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  providerSubscriptionId: string | null;
  providerCustomerId: string | null;
}

/** Fields a route supplies when opening a subscription. */
export interface CreateSubscriptionInput {
  fanUserId: string;
  creatorUserId: string;
  tierId: string;
  status: SubscriptionStatus;
  startedAt: string;
  currentPeriodEnd: string;
  providerSubscriptionId?: string | null;
  providerCustomerId?: string | null;
}

/** Open a subscription, readable by both the fan and the creator. */
export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<SubscriptionRow> {
  const db = createAdminTablesDB();
  const row = await db.createRow({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTIONS_TABLE_ID,
    rowId: ID.unique(),
    data: {
      fanUserId: input.fanUserId,
      creatorUserId: input.creatorUserId,
      tierId: input.tierId,
      status: input.status,
      startedAt: input.startedAt,
      currentPeriodEnd: input.currentPeriodEnd,
      cancelAtPeriodEnd: false,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      providerCustomerId: input.providerCustomerId ?? null,
    },
    permissions: [
      Permission.read(Role.user(input.fanUserId)),
      Permission.read(Role.user(input.creatorUserId)),
      Permission.update(Role.user(input.fanUserId)),
      Permission.delete(Role.user(input.fanUserId)),
    ],
  });
  return row as unknown as SubscriptionRow;
}

/** The fan's most recent subscription to a given creator, or null. */
export async function getFanSubscription(
  fanUserId: string,
  creatorUserId: string,
): Promise<SubscriptionRow | null> {
  const db = createAdminTablesDB();
  const { rows } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTIONS_TABLE_ID,
    queries: [
      Query.equal("fanUserId", fanUserId),
      Query.equal("creatorUserId", creatorUserId),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ],
  });
  return (rows[0] as unknown as SubscriptionRow) ?? null;
}

/** All of a fan's subscriptions across creators, newest first. */
export async function listSubscriptionsByFan(
  fanUserId: string,
): Promise<SubscriptionRow[]> {
  const db = createAdminTablesDB();
  const { rows } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTIONS_TABLE_ID,
    queries: [
      Query.equal("fanUserId", fanUserId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ],
  });
  return rows as unknown as SubscriptionRow[];
}

/** A creator's active/trialing subscribers, newest first. */
export async function listSubscribersByCreator(
  creatorUserId: string,
): Promise<SubscriptionRow[]> {
  const db = createAdminTablesDB();
  const { rows } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTIONS_TABLE_ID,
    queries: [
      Query.equal("creatorUserId", creatorUserId),
      Query.equal("status", [...ACTIVE_SUBSCRIPTION_STATUSES]),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ],
  });
  return rows as unknown as SubscriptionRow[];
}

/** Count active/trialing subscribers on a tier — enforces `subscriberCap`. */
export async function countActiveSubscribers(tierId: string): Promise<number> {
  const db = createAdminTablesDB();
  const { total } = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTIONS_TABLE_ID,
    queries: [
      Query.equal("tierId", tierId),
      Query.equal("status", [...ACTIVE_SUBSCRIPTION_STATUSES]),
      Query.limit(1),
    ],
  });
  return total;
}

/** Patch a subscription's lifecycle fields (used by cancel + the Stripe seam). */
export async function updateSubscription(
  id: string,
  data: Partial<
    Pick<
      SubscriptionRow,
      | "status"
      | "currentPeriodEnd"
      | "cancelAtPeriodEnd"
      | "providerSubscriptionId"
      | "providerCustomerId"
    >
  >,
): Promise<SubscriptionRow> {
  const db = createAdminTablesDB();
  const row = await db.updateRow({
    databaseId: DATABASE_ID,
    tableId: SUBSCRIPTIONS_TABLE_ID,
    rowId: id,
    data,
  });
  return row as unknown as SubscriptionRow;
}
