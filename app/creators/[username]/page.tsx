import { notFound } from "next/navigation";

import { CreatorSubscribePanel } from "@/components/public/subscribe/creator-subscribe-panel";
import { CreatorVault } from "@/components/public/vault/creator-vault";
import { toTier } from "@/components/dashboard/subscriptions/subscription-meta";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/appwrite/config";
import { listContentByUserId } from "@/lib/appwrite/content";
import { STORAGE_ID } from "@/lib/appwrite/db";
import { getProfileByUsername } from "@/lib/appwrite/profile";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { listVisibleTiersByCreator } from "@/lib/appwrite/subscriptions";
import { getEntitlement } from "@/lib/subscriptions/entitlement";
import { buildFanVaultItems } from "@/lib/subscriptions/vault";

/** Public storage view URL — profile imagery is uploaded public-read. */
function fileViewUrl(fileId: string | null | undefined): string | null {
  if (!fileId) return null;
  return `${APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const profile = await getProfileByUsername(username);
  if (!profile || !profile.username) notFound();

  const viewer = await getLoggedInUser();
  const isOwnProfile = viewer?.$id === profile.userId;

  const [tierRows, contentRows, entitlement] = await Promise.all([
    listVisibleTiersByCreator(profile.userId),
    listContentByUserId(profile.userId),
    getEntitlement(viewer?.$id ?? null, profile.userId),
  ]);

  const tiers = tierRows.map(toTier);
  const vaultItems = buildFanVaultItems(contentRows, entitlement, username);
  const initialSubscribedTierId = isOwnProfile ? null : entitlement.tierId;

  const bannerUrl = fileViewUrl(profile.bannerFileId);
  const avatarUrl = fileViewUrl(profile.avatarFileId);
  const initial = profile.username.charAt(0).toUpperCase();

  return (
    <main className="min-h-dvh bg-background">
      {/* Header — banner image (or the profile's gradient) with the avatar. */}
      <header className="relative">
        <div
          className="h-40 w-full bg-surface-secondary sm:h-56"
          style={
            bannerUrl
              ? {
                  backgroundImage: `url(${bannerUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  backgroundImage:
                    profile.bgGradient ||
                    "radial-gradient(ellipse 90% 120% at 50% 0%, oklch(57.74% 0.2091 273.85 / 0.25), transparent 70%)",
                }
          }
        />
        <div className="mx-auto -mt-12 flex max-w-5xl flex-col items-center px-4 text-center sm:-mt-14">
          <div className="size-24 overflow-hidden rounded-full border-4 border-background bg-surface-tertiary">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={profile.username}
                className="size-full object-cover"
              />
            ) : (
              <span className="grid size-full place-items-center text-3xl font-bold text-muted">
                {initial}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            @{profile.username}
          </h1>
          {profile.niche ? (
            <p className="mt-0.5 text-sm capitalize text-muted">
              {profile.niche}
            </p>
          ) : null}
        </div>
      </header>

      {/* Pricing. */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Choose your membership
          </h2>
          <p className="text-sm text-muted">
            Subscribe for recurring access to exclusive content and perks.
          </p>
        </div>

        <CreatorSubscribePanel
          tiers={tiers}
          isAuthed={!!viewer}
          isOwnProfile={isOwnProfile}
          initialSubscribedTierId={initialSubscribedTierId}
          loginHref="/login"
        />
      </section>

      {/* Gated exclusive content. */}
      <CreatorVault items={vaultItems} subscribed={entitlement.subscribed} />
    </main>
  );
}
