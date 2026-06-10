"use client";

import { useState } from "react";

import type { ContentCategory, VaultItem } from "./content-meta";
import { LibraryEmpty } from "./library-empty";
import { VaultGrid } from "./vault-grid";
import { AddContentFlow } from "./upload-flow/add-content-flow";

export function ContentLibrary({
  initialItems,
}: {
  initialItems: VaultItem[];
}) {
  const [items, setItems] = useState<VaultItem[]>(initialItems);
  const [flowOpen, setFlowOpen] = useState(false);
  const [initialCategory, setInitialCategory] =
    useState<ContentCategory | null>(null);

  function openFlow(category: ContentCategory | null = null) {
    setInitialCategory(category);
    setFlowOpen(true);
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
        <VaultGrid items={items} onAdd={() => openFlow()} />
      )}

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
