"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface AddTileProps {
  onAdd: () => void;
}

/** The last tile in the vault grid: a dashed "add" field that opens the wizard. */
export function AddTile({ onAdd }: AddTileProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-surface-secondary/40 text-muted outline-none transition-colors hover:border-accent/50 hover:text-accent focus-visible:ring-2 focus-visible:ring-focus"
    >
      <HugeiconsIcon icon={PlusSignIcon} className="size-5 text-accent" />
      <span className="text-[11px]">Add</span>
    </button>
  );
}
