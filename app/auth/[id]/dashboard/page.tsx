import { redirect } from "next/navigation";

import { FeaturedCard } from "@/components/dashboard/home/featured-card";
import { StatCard } from "@/components/dashboard/home/stat-card";
import { WelcomeBanner } from "@/components/dashboard/home/welcome-banner";
import type { CollectionOption } from "@/components/dashboard/games/game-meta";
import { listCollectionsByUserId } from "@/lib/appwrite/collections";
import { listContentByUserId } from "@/lib/appwrite/content";
import { getProfileByUserId } from "@/lib/appwrite/profile";
import { getLoggedInUser } from "@/lib/appwrite/server";

const STATS = [
  {
    label: "Total active users",
    value: "18,765",
    trend: "+2.6%",
    trendDir: "up" as const,
    chart: "area" as const,
    data: [12, 14, 13, 16, 15, 18, 17, 20, 19, 22],
  },
  {
    label: "Total installed",
    value: "4,876",
    trend: "+0.2%",
    trendDir: "up" as const,
    chart: "bar" as const,
    data: [8, 10, 9, 11, 10, 12, 11, 13, 12, 14],
  },
  {
    label: "Total downloads",
    value: "678",
    trend: "-0.1%",
    trendDir: "down" as const,
    chart: "area" as const,
    data: [22, 20, 21, 18, 19, 16, 17, 15, 16, 14],
  },
];

export default async function DashboardPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const [profile, collectionRows, contentRows] = await Promise.all([
    getProfileByUserId(user.$id),
    listCollectionsByUserId(user.$id),
    listContentByUserId(user.$id),
  ]);
  const displayName =
    user.name || profile?.username || user.email.split("@")[0] || "there";

  // Count content rows per collection once, then split by tier — the game setup
  // flow folds exclusive collections into the prize pool and sets odds per
  // Games-tier collection.
  const itemCountByCollection = new Map<string, number>();
  for (const row of contentRows) {
    if (row.collectionId) {
      itemCountByCollection.set(
        row.collectionId,
        (itemCountByCollection.get(row.collectionId) ?? 0) + 1,
      );
    }
  }
  const toOption = (c: (typeof collectionRows)[number]): CollectionOption => ({
    id: c.$id,
    name: c.name,
    itemCount: itemCountByCollection.get(c.$id) ?? 0,
    createdAt: c.$createdAt,
  });
  const exclusiveCollections = collectionRows
    .filter((c) => c.tier === "exclusive")
    .map(toOption);
  const gameCollections = collectionRows
    .filter((c) => c.tier === "gamble")
    .map(toOption);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <WelcomeBanner
          className="lg:col-span-2"
          displayName={displayName}
          exclusiveCollections={exclusiveCollections}
          gameCollections={gameCollections}
        />
        <FeaturedCard />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
