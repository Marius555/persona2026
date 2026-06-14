"use client";

import { useMemo, useState } from "react";

import type { ContentCategory, FileItem, VaultItem } from "./content-meta";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { ItemDrawer } from "./item-drawer/item-drawer";
import { ItemViewer } from "./item-viewer/item-viewer";
import { LibraryEmpty } from "./library-empty";
import { VaultGrid } from "./vault-grid";
import { AddContentFlow } from "./upload-flow/add-content-flow";

/** Stable identity for a vault item — files key by storage id, offers by row id. */
function sameItem(a: VaultItem, b: VaultItem): boolean {
  if (a.kind === "file" && b.kind === "file") return a.fileId === b.fileId;
  if (a.kind === "offer" && b.kind === "offer") return a.id === b.id;
  return false;
}

export function ContentLibrary({
  initialItems,
}: {
  initialItems: VaultItem[];
}) {
  const [items, setItems] = useState<VaultItem[]>(initialItems);
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
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Content vault
        </h1>
        <p className="text-sm text-muted">
          Everything you&apos;ve uploaded and the offers you&apos;ve made.
        </p>
      </div>

      {/* Body */}
      {items.length === 0 ? (
        <LibraryEmpty onAdd={() => openFlow()} />
      ) : (
        <VaultGrid
          items={items}
          onAdd={() => openFlow()}
          onView={openViewer}
          onEdit={setDrawerItem}
          onDelete={requestDelete}
        />
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

      {flowOpen ? (
        <AddContentFlow
          initialCategory={initialCategory}
          onPublished={handlePublished}
          onClose={() => setFlowOpen(false)}
        />
      ) : null}
    </div>
  );
}
