"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface NewCollectionButtonProps {
  onPress: () => void;
  /** Hide the label below the `sm` breakpoint (used in the compact bar). */
  hideLabelOnMobile?: boolean;
}

/**
 * The grey "+ New collection" pill, shared by the collection bar and the
 * empty-tier state so both look identical. Neutral (not accent) so it never
 * reads as the primary action, and foreground text so it never looks disabled.
 */
export function NewCollectionButton({
  onPress,
  hideLabelOnMobile = false,
}: NewCollectionButtonProps) {
  return (
    <button
      type="button"
      aria-label="New collection"
      onClick={onPress}
      className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface-secondary px-3.5 py-1.5 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <HugeiconsIcon icon={PlusSignIcon} className="size-4 text-foreground" />
      <span className={hideLabelOnMobile ? "hidden sm:inline" : undefined}>
        New collection
      </span>
    </button>
  );
}
