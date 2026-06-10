"use client";

import { Image01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@heroui/react";

interface LibraryEmptyProps {
  onAdd: () => void;
}

export function LibraryEmpty({ onAdd }: LibraryEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <span
        aria-hidden
        className="grid size-20 place-items-center rounded-2xl bg-accent/12 text-accent"
      >
        <HugeiconsIcon icon={Image01Icon} className="size-9" />
      </span>

      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-foreground">
          Your vault is empty
        </h2>
        <p className="text-sm text-muted">
          Upload photos and clips, or add a discount, event or perk — everything
          you make shows up here.
        </p>
      </div>

      <Button className="cursor-pointer" onPress={onAdd}>
        <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
        Add content
      </Button>
    </div>
  );
}
