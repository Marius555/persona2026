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

/** Step 1: pick what you're adding — all four options on one line. */
export function StepType({ onSelect }: StepTypeProps) {
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {CATEGORY_ORDER.map((category) => {
        const meta = CATEGORY_META[category];
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border bg-gradient-to-b from-surface-secondary/60 to-surface-secondary/30 px-1 py-4 shadow-sm outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-accent/12 text-accent ring-1 ring-inset ring-accent/15">
              <HugeiconsIcon icon={meta.icon} className="size-5" />
            </span>
            <span className="text-xs font-semibold text-foreground">
              {SHORT_LABEL[category]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
