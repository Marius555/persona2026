"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface CreateTierCardProps {
  onCreate: () => void;
}

/**
 * The trailing tile in the tier grid: a dashed "create" card (mirrors the vault's
 * AddTile) that opens the setup flow. Stretches to match the height of the tier
 * cards beside it, with a min height so it still reads as a card when alone in a row.
 */
export function CreateTierCard({ onCreate }: CreateTierCardProps) {
  return (
    <button
      type="button"
      onClick={onCreate}
      className="flex h-full min-h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface-secondary/40 text-muted outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus"
    >
      <HugeiconsIcon icon={PlusSignIcon} className="size-6 text-accent" />
      <span className="text-sm font-medium">Create New Subscription</span>
    </button>
  );
}
