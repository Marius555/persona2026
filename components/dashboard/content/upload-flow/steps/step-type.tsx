"use client";

import { HugeiconsIcon } from "@hugeicons/react";

import {
  CATEGORY_META,
  CATEGORY_ORDER,
  type ContentCategory,
} from "../../content-meta";

interface StepTypeProps {
  onSelect: (category: ContentCategory) => void;
}

/** Short labels for the compact tiles (the long blurb lives in the header). */
const SHORT_LABEL: Record<ContentCategory, string> = {
  media: "Media",
  discount: "Discount",
  event: "Event",
  perk: "Perk",
};

/** Step 1: pick what you're adding — a row of small square tiles. */
export function StepType({ onSelect }: StepTypeProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CATEGORY_ORDER.map((category) => {
        const meta = CATEGORY_META[category];
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary/40 p-2 outline-none transition-colors hover:border-accent/60 hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-focus"
          >
            <HugeiconsIcon
              icon={meta.icon}
              className="size-5 text-muted transition-colors group-hover:text-accent"
            />
            <span className="text-[11px] font-medium text-foreground">
              {SHORT_LABEL[category]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
