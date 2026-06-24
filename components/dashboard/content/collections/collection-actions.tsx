"use client";

import { PlusSignIcon, Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface CollectionActionsProps {
  /** Open the new-collection overlay. */
  onNewCollection: () => void;
  /** Open the manage drawer for the active collection. */
  onManageCollection: () => void;
}

/**
 * The control cluster pinned right of the collection bar: a "+ New collection"
 * segment tied to a "…" segment that manages the active collection. Rendered as
 * one rounded pill (a divider between the two) so they read as a single group,
 * reusing the bar's neutral pill styling.
 */
export function CollectionActions({
  onNewCollection,
  onManageCollection,
}: CollectionActionsProps) {
  return (
    <div className="flex shrink-0 items-center divide-x divide-border overflow-hidden rounded-full border border-border bg-surface-secondary text-sm font-medium text-foreground">
      <button
        type="button"
        aria-label="New collection"
        onClick={onNewCollection}
        className="flex cursor-pointer items-center gap-1.5 px-3.5 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
      >
        <HugeiconsIcon icon={PlusSignIcon} className="size-4 text-foreground" />
        <span className="hidden sm:inline">New collection</span>
      </button>
      <button
        type="button"
        aria-label="Manage collection"
        onClick={onManageCollection}
        className="flex cursor-pointer items-center px-2.5 py-1.5 text-muted outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
      >
        <HugeiconsIcon icon={Settings01Icon} className="size-4" />
      </button>
    </div>
  );
}
