"use client";

import {
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  PlayCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Dropdown, Label } from "@heroui/react";

import {
  OFFER_META,
  type FileItem,
  type OfferItem,
  type VaultItem,
} from "./content-meta";
import { OfferSummary } from "./offer-summary";

interface VaultCardProps {
  item: VaultItem;
  onView: (item: VaultItem) => void;
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
}

/**
 * A single masonry vault card. File cards size to their media (full width, no
 * crop); offer cards keep a tidy 3/4 shape. The body opens the full-size viewer
 * (files) or the editor (offers); the corner "…" menu holds edit + delete. The
 * menu and body are siblings (not nested buttons) so the markup stays valid.
 */
export function VaultCard({ item, onView, onEdit, onDelete }: VaultCardProps) {
  const isFile = item.kind === "file";
  return (
    <div
      className={`relative mb-3 w-full break-inside-avoid overflow-hidden rounded-2xl border border-border bg-surface-secondary/40 ${
        isFile ? "" : "aspect-[3/4]"
      }`}
    >
      <button
        type="button"
        onClick={() => (isFile ? onView(item) : onEdit(item))}
        aria-label={isFile ? "View" : "View details"}
        className="block size-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99]"
      >
        {item.kind === "file" ? (
          <FilePreview item={item} />
        ) : (
          <OfferPreview item={item} />
        )}
      </button>

      <Dropdown>
        <Button
          isIconOnly
          size="sm"
          variant="secondary"
          aria-label="More options"
          className="absolute right-2 top-2 size-7 rounded-full shadow-sm"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
        </Button>
        <Dropdown.Popover className="min-w-[10rem]">
          <Dropdown.Menu
            onAction={(key) => {
              if (key === "edit") onEdit(item);
              else if (key === "delete") onDelete(item);
            }}
          >
            <Dropdown.Item id="edit" textValue="Edit">
              <div className="flex w-full items-center justify-between gap-2">
                <Label>Edit</Label>
                <HugeiconsIcon
                  icon={PencilEdit02Icon}
                  className="size-3.5 text-muted"
                />
              </div>
            </Dropdown.Item>
            <Dropdown.Item id="delete" textValue="Delete" variant="danger">
              <div className="flex w-full items-center justify-between gap-2">
                <Label>Delete</Label>
                <HugeiconsIcon
                  icon={Delete02Icon}
                  className="size-3.5 text-danger"
                />
              </div>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}

function FilePreview({ item }: { item: FileItem }) {
  if (item.mediaType === "video") {
    return (
      <>
        <video
          src={item.src}
          className="block w-full h-auto"
          muted
          playsInline
          preload="metadata"
        />
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-overlay-foreground/90">
          <HugeiconsIcon icon={PlayCircleIcon} className="size-8" />
        </span>
      </>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.src} alt="" className="block w-full h-auto" />
  );
}

function OfferPreview({ item }: { item: OfferItem }) {
  const meta = OFFER_META[item.contentType];
  return (
    <span className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/10 to-surface-secondary/40 p-3 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-accent/12 text-accent">
        <HugeiconsIcon icon={meta.icon} className="size-5" />
      </span>
      <span className="line-clamp-2 text-sm font-semibold text-foreground">
        {item.title || meta.label}
      </span>
      <span className="line-clamp-1 text-xs text-muted">
        <OfferSummary item={item} />
      </span>
    </span>
  );
}
