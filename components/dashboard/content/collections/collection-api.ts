import type { Collection } from "../content-meta";
import type { ContentTier } from "@/lib/validation/content";

/** The collection shape the REST routes return (an Appwrite row subset). */
interface CollectionDto {
  $id: string;
  tier: ContentTier;
  name: string;
  visible?: boolean;
}

/** Map a REST collection row to the client-side `Collection` shape. */
function toCollection(dto: CollectionDto): Collection {
  return {
    id: dto.$id,
    tier: dto.tier,
    name: dto.name,
    visible: dto.visible ?? true,
  };
}

/** Pull a human-readable message out of a failed collection response. */
async function errorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  const firstFieldError = body?.fieldErrors
    ? Object.values(body.fieldErrors)[0]
    : null;
  return body?.error ?? firstFieldError ?? fallback;
}

/** Create a collection via the REST route, returning the new client-side shape. */
export async function createCollectionRequest(
  tier: ContentTier,
  name: string,
): Promise<Collection> {
  const res = await fetch("/api/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier, name: name.trim() }),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Couldn't create collection"));
  }
  const data = (await res.json()) as { collection: CollectionDto };
  return toCollection(data.collection);
}

/** Rename and/or toggle the visibility of a collection, returning the updated shape. */
export async function updateCollectionRequest(
  id: string,
  patch: { name?: string; visible?: boolean },
): Promise<Collection> {
  const res = await fetch(`/api/collections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Couldn't update collection"));
  }
  const data = (await res.json()) as { collection: CollectionDto };
  return toCollection(data.collection);
}

/** Delete a collection. Throws on failure. */
export async function deleteCollectionRequest(id: string): Promise<void> {
  const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Couldn't delete collection"));
  }
}
