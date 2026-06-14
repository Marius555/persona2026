import { redirect } from "next/navigation";

import { ContentLibrary } from "@/components/dashboard/content/content-library";
import type { OfferType, VaultItem } from "@/components/dashboard/content/content-meta";
import { listContentByUserId } from "@/lib/appwrite/content";
import { getMediaPool } from "@/lib/appwrite/media";
import { getLoggedInUser } from "@/lib/appwrite/server";

export default async function ContentPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  // The vault is every uploaded file (onboarding + later) plus published offers.
  const [files, rows] = await Promise.all([
    getMediaPool(user.$id),
    listContentByUserId(user.$id),
  ]);

  const offerItems: VaultItem[] = rows
    .filter((r) => r.contentType !== "file")
    .map((r) => ({
      kind: "offer",
      id: r.$id,
      contentType: r.contentType as OfferType,
      tier: r.tier,
      rarity: r.rarity,
      tokenValue: r.tokenValue,
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
      title: row?.title ?? null,
      description: row?.description ?? null,
    };
  });

  return <ContentLibrary initialItems={[...offerItems, ...fileItems]} />;
}
