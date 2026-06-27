import { redirect } from "next/navigation";

import type { CollectionOption } from "@/components/dashboard/games/game-meta";
import { SubscriptionsManager } from "@/components/dashboard/subscriptions/subscriptions-manager";
import { toTier } from "@/components/dashboard/subscriptions/subscription-meta";
import { listCollectionsByUserId } from "@/lib/appwrite/collections";
import { listContentByUserId } from "@/lib/appwrite/content";
import { getLoggedInUser } from "@/lib/appwrite/server";
import {
  listSubscribersByCreator,
  listTiersByCreator,
} from "@/lib/appwrite/subscriptions";

export default async function SubscriptionsPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const [tierRows, collectionRows, contentRows, subscribers] = await Promise.all(
    [
      listTiersByCreator(user.$id),
      listCollectionsByUserId(user.$id),
      listContentByUserId(user.$id),
      listSubscribersByCreator(user.$id),
    ],
  );

  // Count content rows per collection so the picker can show how full each is.
  const itemCountByCollection = new Map<string, number>();
  for (const row of contentRows) {
    if (row.collectionId) {
      itemCountByCollection.set(
        row.collectionId,
        (itemCountByCollection.get(row.collectionId) ?? 0) + 1,
      );
    }
  }

  // Subscription tiers gate exclusive content, so offer the exclusive collections.
  const collections: CollectionOption[] = collectionRows
    .filter((c) => c.tier === "exclusive")
    .map((c) => ({
      id: c.$id,
      name: c.name,
      itemCount: itemCountByCollection.get(c.$id) ?? 0,
      createdAt: c.$createdAt,
    }));

  const subscriberCounts: Record<string, number> = {};
  for (const sub of subscribers) {
    subscriberCounts[sub.tierId] = (subscriberCounts[sub.tierId] ?? 0) + 1;
  }

  return (
    <SubscriptionsManager
      collections={collections}
      initialTiers={tierRows.map(toTier)}
      subscriberCounts={subscriberCounts}
    />
  );
}
