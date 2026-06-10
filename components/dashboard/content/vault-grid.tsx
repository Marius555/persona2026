"use client";

import { PlayCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { AddTile } from "./add-tile";
import { OFFER_META, offerSummary, type VaultItem } from "./content-meta";

interface VaultGridProps {
  items: VaultItem[];
  onAdd: () => void;
}

export function VaultGrid({ items, onAdd }: VaultGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
      {items.map((item) =>
        item.kind === "file" ? (
          <div
            key={item.fileId}
            className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-secondary/40"
          >
            {item.mediaType === "video" ? (
              <>
                <video
                  src={item.src}
                  className="size-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <span className="pointer-events-none absolute inset-0 grid place-items-center text-overlay-foreground/90">
                  <HugeiconsIcon icon={PlayCircleIcon} className="size-6" />
                </span>
              </>
            ) : (
              <span
                className="block size-full bg-cover bg-center"
                style={{ backgroundImage: `url(${item.src})` }}
              />
            )}
          </div>
        ) : (
          <div
            key={item.id}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-gradient-to-br from-accent/10 to-surface-secondary/40 p-2 text-center"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-accent/12 text-accent">
              <HugeiconsIcon icon={OFFER_META[item.contentType].icon} className="size-4" />
            </span>
            <span className="line-clamp-1 text-[11px] font-semibold text-foreground">
              {item.title || OFFER_META[item.contentType].label}
            </span>
            <span className="line-clamp-1 text-[10px] text-muted">
              {offerSummary(item)}
            </span>
          </div>
        ),
      )}

      <AddTile onAdd={onAdd} />
    </div>
  );
}
