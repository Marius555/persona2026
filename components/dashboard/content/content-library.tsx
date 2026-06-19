"use client";

import type { Key } from "@heroui/react";
import { ListBox, Select } from "@heroui/react";
import { useMemo, useState } from "react";

import { CollectionBar } from "./collections/collection-bar";
import { CollectionEmpty } from "./collections/collection-empty";
import { ManageCollectionDrawer } from "./collections/manage-collection-drawer";
import { NewCollectionDialog } from "./collections/new-collection-dialog";
import {
  TIER_META,
  TIER_ORDER,
  type Collection,
  type ContentCategory,
  type FileItem,
  type VaultItem,
} from "./content-meta";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { ItemDrawer } from "./item-drawer/item-drawer";
import { ItemViewer } from "./item-viewer/item-viewer";
import { VaultGrid } from "./vault-grid";
import { AddContentFlow } from "./upload-flow/add-content-flow";
import type { ContentTier } from "@/lib/validation/content";

/** Stable identity for a vault item — files key by storage id, offers by row id. */
function sameItem(a: VaultItem, b: VaultItem): boolean {
  if (a.kind === "file" && b.kind === "file") return a.fileId === b.fileId;
  if (a.kind === "offer" && b.kind === "offer") return a.id === b.id;
  return false;
}

/** The newest collection id for a tier (list is newest-first), or null. */
function firstCollectionIdForTier(
  collections: Collection[],
  tier: ContentTier,
): string | null {
  return collections.find((c) => c.tier === tier)?.id ?? null;
}

export function ContentLibrary({
  initialItems,
  collections: initialCollections,
  initialTier,
}: {
  initialItems: VaultItem[];
  collections: Collection[];
  initialTier: ContentTier;
}) {
  const [items, setItems] = useState<VaultItem[]>(initialItems);
  const [collections, setCollections] =
    useState<Collection[]>(initialCollections);
  const [selectedTier, setSelectedTier] = useState<ContentTier>(initialTier);
  // A collection id, or null when the tier has no collections yet. Defaults to
  // the tier's newest collection.
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    () => firstCollectionIdForTier(initialCollections, initialTier),
  );
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [manageCollection, setManageCollection] = useState<Collection | null>(
    null,
  );
  const [flowOpen, setFlowOpen] = useState(false);
  const [initialCategory, setInitialCategory] =
    useState<ContentCategory | null>(null);
  const [drawerItem, setDrawerItem] = useState<VaultItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<VaultItem | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // The media-only list the full-size viewer carousels through.
  const fileItems = useMemo(
    () => items.filter((i): i is FileItem => i.kind === "file"),
    [items],
  );

  // Items in the selected tier — raw onboarding uploads (no tier) sit under
  // Exclusive. The collection tabs filter within this set.
  const tierItems = useMemo(
    () => items.filter((i) => (i.tier ?? "exclusive") === selectedTier),
    [items, selectedTier],
  );
  const tierCollections = useMemo(
    () => collections.filter((c) => c.tier === selectedTier),
    [collections, selectedTier],
  );
  // Only the active collection's content shows — items without a collection
  // (e.g. legacy onboarding uploads) are intentionally hidden.
  const shownItems = useMemo(
    () => tierItems.filter((i) => i.collectionId === activeCollectionId),
    [tierItems, activeCollectionId],
  );

  function changeTier(tier: ContentTier) {
    setSelectedTier(tier);
    setActiveCollectionId(firstCollectionIdForTier(collections, tier));
    // Persist so the server renders the right tier on the next load.
    document.cookie = `content_tier=${tier}; path=/; max-age=31536000; SameSite=Lax`;
  }

  function handleCollectionCreated(collection: Collection) {
    setCollections((prev) => [collection, ...prev]);
    if (collection.tier === selectedTier) setActiveCollectionId(collection.id);
  }

  /** Open the manage drawer for the active collection in the current tier. */
  function openManageCollection() {
    const active = tierCollections.find((c) => c.id === activeCollectionId);
    if (active) setManageCollection(active);
  }

  function handleCollectionUpdated(updated: Collection) {
    setCollections((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
    setManageCollection((prev) => (prev?.id === updated.id ? updated : prev));
  }

  function handleCollectionDeleted(id: string) {
    const next = collections.filter((c) => c.id !== id);
    setCollections(next);
    if (activeCollectionId === id) {
      setActiveCollectionId(firstCollectionIdForTier(next, selectedTier));
    }
  }

  /** Open the full-size viewer on a given file (offers have no media to view). */
  function openViewer(item: VaultItem) {
    if (item.kind !== "file") return;
    const idx = fileItems.findIndex((f) => f.fileId === item.fileId);
    if (idx >= 0) setViewerIndex(idx);
  }

  function openFlow(category: ContentCategory | null = null) {
    setInitialCategory(category);
    setFlowOpen(true);
  }

  /** Open the confirm dialog, closing the drawer if the request came from it. */
  function requestDelete(item: VaultItem) {
    setDrawerItem(null);
    setPendingDelete(item);
  }

  function handleDeleted(item: VaultItem) {
    setItems((prev) => prev.filter((i) => !sameItem(i, item)));
  }

  function handleUpdated(updated: VaultItem) {
    setItems((prev) => prev.map((i) => (sameItem(i, updated) ? updated : i)));
  }

  /** Prepend freshly published items, de-duping files by their storage id. */
  function handlePublished(newItems: VaultItem[]) {
    setItems((prev) => {
      const seenFiles = new Set(
        prev.filter((i) => i.kind === "file").map((i) => i.fileId),
      );
      const fresh = newItems.filter(
        (i) => i.kind !== "file" || !seenFiles.has(i.fileId),
      );
      return [...fresh, ...prev];
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Header — "Content vault" with the tier select sitting right beside it. */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Content vault
          </h1>

          <Select
            aria-label="Content type"
            className="w-36 shrink-0"
            value={selectedTier}
            onChange={(value: Key | null) => {
              if (value) changeTier(value as ContentTier);
            }}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {TIER_ORDER.map((t) => (
                  <ListBox.Item key={t} id={t} textValue={TIER_META[t].label}>
                    {TIER_META[t].label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <p className="text-sm text-muted">
          Everything you&apos;ve uploaded and the offers you&apos;ve made.
        </p>
      </div>

      {/* Body — content lives in collections, so the layout keys off whether the
          tier has any. No collections: an empty state that creates the first
          one. Collections: the tabs + the active collection's grid. */}
      {tierCollections.length === 0 ? (
        <CollectionEmpty
          tier={selectedTier}
          tierLabel={TIER_META[selectedTier].label}
          onNewCollection={() => setNewCollectionOpen(true)}
        />
      ) : (
        <>
          <CollectionBar
            collections={tierCollections}
            activeId={activeCollectionId ?? ""}
            onActiveChange={setActiveCollectionId}
            onNewCollection={() => setNewCollectionOpen(true)}
            onManageCollection={openManageCollection}
          />
          <VaultGrid
            items={shownItems}
            onAdd={() => openFlow()}
            onView={openViewer}
            onEdit={setDrawerItem}
            onDelete={requestDelete}
          />
        </>
      )}

      <ItemViewer
        files={fileItems}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onIndexChange={setViewerIndex}
      />

      <ItemDrawer
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        onUpdated={handleUpdated}
      />

      <DeleteConfirmDialog
        item={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onDeleted={handleDeleted}
      />

      <NewCollectionDialog
        isOpen={newCollectionOpen}
        onOpenChange={setNewCollectionOpen}
        tier={selectedTier}
        onCreated={handleCollectionCreated}
      />

      <ManageCollectionDrawer
        collection={manageCollection}
        onClose={() => setManageCollection(null)}
        onUpdated={handleCollectionUpdated}
        onDeleted={handleCollectionDeleted}
      />

      {flowOpen ? (
        <AddContentFlow
          initialCategory={initialCategory}
          defaultTier={selectedTier}
          defaultCollectionId={activeCollectionId}
          onPublished={handlePublished}
          onClose={() => setFlowOpen(false)}
        />
      ) : null}
    </div>
  );
}
