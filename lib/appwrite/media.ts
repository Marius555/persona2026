import "server-only";

import { listContentFileIds } from "./content";
import { createAdminStorage, STORAGE_ID } from "./db";
import { getProfileByUserId } from "./profile";
import type { MediaType } from "@/lib/validation/content";

/** One reusable file in the creator's media pool. */
export interface PoolFile {
  fileId: string;
  mediaType: MediaType;
}

/** The full set of file ids the caller has ever uploaded (deduped). */
async function ownedFileIds(userId: string): Promise<string[]> {
  const [profile, contentFileIds] = await Promise.all([
    getProfileByUserId(userId),
    listContentFileIds(userId),
  ]);
  const ids = new Set<string>([
    ...(profile?.contentFileIds ?? []),
    ...contentFileIds,
  ]);
  return [...ids];
}

/**
 * The caller's reusable media pool: every file they've uploaded (onboarding +
 * prior offerings), with its `mediaType` resolved from storage metadata.
 */
export async function getMediaPool(userId: string): Promise<PoolFile[]> {
  const ids = await ownedFileIds(userId);
  const storage = createAdminStorage();

  const files = await Promise.all(
    ids.map(async (fileId): Promise<PoolFile | null> => {
      try {
        const meta = await storage.getFile({
          bucketId: STORAGE_ID,
          fileId,
        });
        return {
          fileId,
          mediaType: meta.mimeType?.startsWith("video/") ? "video" : "image",
        };
      } catch {
        // File was deleted out from under us — skip it.
        return null;
      }
    }),
  );

  return files.filter((f): f is PoolFile => f !== null);
}

/** True when `fileId` belongs to the caller (so the file proxy may serve it). */
export async function userOwnsFile(
  userId: string,
  fileId: string,
): Promise<boolean> {
  const ids = await ownedFileIds(userId);
  return ids.includes(fileId);
}
