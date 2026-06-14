"use client";

import { Drawer } from "@heroui/react";

import { OFFER_META, type FileItem, type VaultItem } from "../content-meta";
import { ItemEditForm } from "./item-edit-form";
import { useIsMobile } from "./use-is-mobile";

interface ItemDrawerProps {
  /** The item to view/edit, or null when the drawer is closed. */
  item: VaultItem | null;
  onClose: () => void;
  onUpdated: (item: VaultItem) => void;
}

function headingFor(item: VaultItem): string {
  if (item.kind === "offer") return `Edit ${OFFER_META[item.contentType].label}`;
  return item.rowId ? "Edit media" : "Media details";
}

/**
 * The item detail drawer — right edge on desktop, bottom sheet on mobile. Every
 * item gets the full edit form: offers and published files PATCH their row, while
 * raw onboarding files create one on first save. Deleting happens from the card.
 */
export function ItemDrawer({ item, onClose, onUpdated }: ItemDrawerProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer.Backdrop
      isOpen={!!item}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog>
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>{item ? headingFor(item) : ""}</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body className="scrollbar-hide">
            {item ? (
              <div className="flex flex-col gap-5">
                {item.kind === "file" ? <FilePreview item={item} /> : null}
                <ItemEditForm item={item} onSaved={onUpdated} onClose={onClose} />
              </div>
            ) : null}
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}

function FilePreview({ item }: { item: FileItem }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-secondary/40">
      {item.mediaType === "video" ? (
        <video
          src={item.src}
          className="h-auto max-h-[70vh] w-full"
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.src} alt="" className="block h-auto w-full" />
      )}
    </div>
  );
}
