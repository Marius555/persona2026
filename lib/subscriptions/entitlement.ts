import "server-only";

import type { ContentRow } from "@/lib/appwrite/content";
import {
  getFanSubscription,
  getTierById,
} from "@/lib/appwrite/subscriptions";
import { ACTIVE_SUBSCRIPTION_STATUSES } from "@/lib/validation/subscription";

const ACTIVE = ACTIVE_SUBSCRIPTION_STATUSES as readonly string[];

/**
 * What a viewer is allowed to unlock from a creator, derived from their active
 * subscription's tier: either all exclusive content or a specific set of
 * collections.
 */
export interface Entitlement {
  subscribed: boolean;
  tierId: string | null;
  unlocksAllExclusive: boolean;
  collectionIds: Set<string>;
}

const NO_ACCESS: Entitlement = {
  subscribed: false,
  tierId: null,
  unlocksAllExclusive: false,
  collectionIds: new Set(),
};

/**
 * Resolve a viewer's entitlement to a creator's content. The creator is always
 * fully entitled to their own vault; otherwise access comes from an active or
 * trialing subscription's tier. Logged-out viewers get nothing.
 */
export async function getEntitlement(
  viewerId: string | null,
  creatorUserId: string,
): Promise<Entitlement> {
  if (!viewerId) return NO_ACCESS;
  if (viewerId === creatorUserId) {
    return {
      subscribed: true,
      tierId: null,
      unlocksAllExclusive: true,
      collectionIds: new Set(),
    };
  }

  const sub = await getFanSubscription(viewerId, creatorUserId);
  if (!sub || !ACTIVE.includes(sub.status)) return NO_ACCESS;

  const tier = await getTierById(sub.tierId);
  if (!tier) return NO_ACCESS;

  return {
    subscribed: true,
    tierId: tier.$id,
    unlocksAllExclusive: tier.unlocksAllExclusive ?? false,
    collectionIds: new Set(tier.includedCollectionIds ?? []),
  };
}

/**
 * Whether an entitlement unlocks a given content row. Only `exclusive` content is
 * subscription-gated — `gamble` drops belong to the game layer, not memberships.
 */
export function canAccessContent(
  entitlement: Entitlement,
  row: Pick<ContentRow, "tier" | "collectionId">,
): boolean {
  if (row.tier !== "exclusive") return false;
  if (entitlement.unlocksAllExclusive) return true;
  return !!row.collectionId && entitlement.collectionIds.has(row.collectionId);
}
