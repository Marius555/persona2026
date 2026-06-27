import "server-only";

import type { ContentRow } from "@/lib/appwrite/content";
import type { MediaType } from "@/lib/validation/content";
import { canAccessContent, type Entitlement } from "./entitlement";

/**
 * One media item in a creator's fan-facing vault. `locked` items expose only their
 * shape (no `src`) so the UI can render a teaser; unlocked items carry a URL to the
 * entitlement-checked file proxy.
 */
export interface FanVaultItem {
  id: string;
  mediaType: MediaType;
  title: string | null;
  collectionId: string | null;
  locked: boolean;
  src: string | null;
}

/**
 * Project a creator's content rows into the fan vault, gated by `entitlement`.
 * Only exclusive media files are surfaced (the subscription-gated content); each
 * is marked locked/unlocked and given a proxied `src` when accessible.
 */
export function buildFanVaultItems(
  rows: ContentRow[],
  entitlement: Entitlement,
  username: string,
): FanVaultItem[] {
  return rows
    .filter(
      (r) => r.contentType === "file" && r.tier === "exclusive" && !!r.fileId,
    )
    .map((r) => {
      const locked = !canAccessContent(entitlement, r);
      return {
        id: r.$id,
        mediaType: (r.mediaType ?? "image") as MediaType,
        title: r.title,
        collectionId: r.collectionId,
        locked,
        src: locked
          ? null
          : `/api/creators/${encodeURIComponent(username)}/content/${r.$id}/file`,
      };
    });
}
