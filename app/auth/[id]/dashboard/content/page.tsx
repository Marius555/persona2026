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
      title: r.title,
      description: r.description,
      discountPercent: r.discountPercent,
      eventAt: r.eventAt,
      eventLocation: r.eventLocation,
    }));

  const fileItems: VaultItem[] = files.map((f) => ({
    kind: "file",
    fileId: f.fileId,
    mediaType: f.mediaType,
    src: `/api/media/${f.fileId}/file`,
  }));

  return <ContentLibrary initialItems={[...offerItems, ...fileItems]} />;
}
