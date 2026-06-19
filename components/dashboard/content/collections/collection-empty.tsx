"use client";

import { FolderLibraryIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { NewCollectionButton } from "./new-collection-button";
import type { ContentTier } from "@/lib/validation/content";

interface CollectionEmptyProps {
  tier: ContentTier;
  tierLabel: string;
  /** Open the new-collection overlay. */
  onNewCollection: () => void;
}

/**
 * Shown when the selected tier has no collections yet. Content lives inside
 * collections, so the first step is to create one — using the same grey
 * "+ New collection" button as the bar.
 */
export function CollectionEmpty({
  tier,
  tierLabel,
  onNewCollection,
}: CollectionEmptyProps) {
  const blurb =
    tier === "gamble"
      ? "Collections group the content fans can win in a game. Create your first one to start adding drops."
      : "Collections group the content fans can unlock for tokens. Create your first one to start adding content.";

  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <span
        aria-hidden
        className="grid size-20 place-items-center rounded-2xl bg-surface-secondary text-muted"
      >
        <HugeiconsIcon icon={FolderLibraryIcon} className="size-9" />
      </span>

      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-foreground">
          No {tierLabel.toLowerCase()} collections yet
        </h2>
        <p className="text-sm text-muted">{blurb}</p>
      </div>

      <NewCollectionButton onPress={onNewCollection} />
    </div>
  );
}
