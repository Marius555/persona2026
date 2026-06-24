"use client";

import {
  Calendar03Icon,
  Cancel01Icon,
  DiscountTag01Icon,
  GiftIcon,
  Image01Icon,
  PlayCircleIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import type { StagedContent } from "@/components/dashboard/content/content-meta";

/** Per-category icon + short label for a staged row. */
const ROW_META: Record<
  StagedContent["category"],
  { label: string; icon: IconSvgElement }
> = {
  media: { label: "Media", icon: Image01Icon },
  discount: { label: "Discount", icon: DiscountTag01Icon },
  event: { label: "Event", icon: Calendar03Icon },
  perk: { label: "Perk", icon: GiftIcon },
};

/** One-line summary shown under the type label. */
function summarize(item: StagedContent): string {
  const title = item.title.trim();
  if (item.category === "media") {
    if (title) return title;
    return `${item.files.length} ${item.files.length === 1 ? "file" : "files"}`;
  }
  if (item.category === "discount") {
    return title || `${item.discountPercent}% off`;
  }
  return title || ROW_META[item.category].label;
}

interface StepContentPoolProps {
  items: StagedContent[];
  error?: string;
  /** Open the add-content wizard to stage another item. */
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function StepContentPool({
  items,
  error,
  onAdd,
  onRemove,
}: StepContentPoolProps) {
  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Fixed-height scroll area so the card never grows as items pile up. */}
      {items.length ? (
        <div className="flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1">
          {items.map((item, index) => {
            const meta = ROW_META[item.category];
            const thumb =
              item.category === "media" ? item.previews[0] : undefined;
            return (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface-secondary/40 p-3"
              >
                {thumb ? (
                  <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface-tertiary">
                    <span
                      className="block size-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${thumb.url})` }}
                    />
                    {thumb.mediaType === "video" ? (
                      <span className="pointer-events-none absolute inset-0 grid place-items-center text-overlay-foreground/90">
                        <HugeiconsIcon
                          icon={PlayCircleIcon}
                          className="size-5"
                        />
                      </span>
                    ) : null}
                    {item.category === "media" && item.files.length > 1 ? (
                      <span className="absolute bottom-0.5 right-0.5 rounded-md bg-overlay/80 px-1 text-[10px] font-semibold text-overlay-foreground">
                        +{item.files.length - 1}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
                    <HugeiconsIcon icon={meta.icon} className="size-5" />
                  </span>
                )}

                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {meta.label}
                  </span>
                  <span className="truncate text-xs text-muted">
                    {summarize(item)}
                  </span>
                </span>

                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => onRemove(index)}
                  className="ml-auto grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onAdd}
        className={[
          "flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 outline-none transition-colors",
          "cursor-pointer focus-visible:ring-2 focus-visible:ring-focus",
          error
            ? "border-danger/60 bg-danger/5"
            : "border-border bg-surface-secondary/40",
        ].join(" ")}
      >
        <HugeiconsIcon icon={PlusSignIcon} className="size-5 text-accent" />
        <span className="text-sm font-medium text-foreground">
          {items.length ? "Add more content" : "Add content"}
        </span>
      </button>

      {/* Fixed-height message slot so showing an error never resizes the card. */}
      <p className="min-h-[1.25rem] text-xs text-danger">{error ?? ""}</p>
    </div>
  );
}
