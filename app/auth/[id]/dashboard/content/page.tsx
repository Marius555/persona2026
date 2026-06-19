import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ContentLibrary } from "@/components/dashboard/content/content-library";
import type {
  Collection,
  OfferType,
  VaultItem,
} from "@/components/dashboard/content/content-meta";
import { listCollectionsByUserId } from "@/lib/appwrite/collections";
import { listContentByUserId } from "@/lib/appwrite/content";
import { getMediaPool } from "@/lib/appwrite/media";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { CONTENT_TIERS, type ContentTier } from "@/lib/validation/content";

export default async function ContentPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  // Remember the creator's last tier choice across reloads (set client-side).
  const tierCookie = (await cookies()).get("content_tier")?.value;
  const initialTier: ContentTier = CONTENT_TIERS.includes(
    tierCookie as ContentTier,
  )
    ? (tierCookie as ContentTier)
    : "exclusive";

  // The vault is every uploaded file (onboarding + later) plus published offers.
  const [files, rows, collectionRows] = await Promise.all([
    getMediaPool(user.$id),
    listContentByUserId(user.$id),
    listCollectionsByUserId(user.$id),
  ]);

  const collections: Collection[] = collectionRows.map((c) => ({
    id: c.$id,
    tier: c.tier,
    name: c.name,
    visible: c.visible ?? true,
  }));

  const offerItems: VaultItem[] = rows
    .filter((r) => r.contentType !== "file")
    .map((r) => ({
      kind: "offer",
      id: r.$id,
      contentType: r.contentType as OfferType,
      tier: r.tier,
      rarity: r.rarity,
      tokenValue: r.tokenValue,
      collectionId: r.collectionId,
      title: r.title,
      description: r.description,
      discountPercent: r.discountPercent,
      eventAt: r.eventAt,
      eventLocation: r.eventLocation,
    }));

  // Map each pool file to its backing content row (if any) so file cards can be
  // edited. Raw onboarding uploads have no row → delete-only.
  const fileRowByFileId = new Map(
    rows.filter((r) => r.contentType === "file" && r.fileId).map((r) => [r.fileId, r]),
  );

  const fileItems: VaultItem[] = files.map((f) => {
    const row = fileRowByFileId.get(f.fileId);
    return {
      kind: "file",
      fileId: f.fileId,
      mediaType: f.mediaType,
      src: `/api/media/${f.fileId}/file`,
      rowId: row?.$id ?? null,
      tier: row?.tier,
      rarity: row?.rarity ?? null,
      tokenValue: row?.tokenValue ?? null,
      collectionId: row?.collectionId ?? null,
      title: row?.title ?? null,
      description: row?.description ?? null,
    };
  });

  return (
    <ContentLibrary
      initialItems={[...offerItems, ...fileItems]}
      collections={collections}
      initialTier={initialTier}
    />
  );
}
