"use client";

import { Drawer } from "@heroui/react";
import { useState } from "react";

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

/** Stable identity for an item — re-seeds the edit form when a new one opens. */
function itemKey(item: VaultItem): string {
  return item.kind === "file" ? item.fileId : item.id;
}

/**
 * The item detail drawer — right edge on desktop, bottom sheet on mobile. Every
 * item gets the full edit form: offers and published files PATCH their row, while
 * raw onboarding files create one on first save. Deleting happens from the card.
 */
export function ItemDrawer({ item, onClose, onUpdated }: ItemDrawerProps) {
  const isMobile = useIsMobile();

  // Keep the last item on screen while the drawer slides closed — nulling the
  // body the instant `item` goes null collapses the sheet so the slide-out is
  // invisible. Adjusting state during render (not in an effect) is the supported
  // way to retain a value across a prop change.
  const [shown, setShown] = useState(item);
  if (item && item !== shown) setShown(item);
  const current = item ?? shown;

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
            <Drawer.Heading>{current ? headingFor(current) : ""}</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body className="scrollbar-hide">
            {current ? (
              <div className="flex flex-col gap-5">
                {current.kind === "file" ? <FilePreview item={current} /> : null}
                <ItemEditForm
                  key={itemKey(current)}
                  item={current}
                  onSaved={onUpdated}
                  onClose={onClose}
                />
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
    <div className="mx-auto w-fit overflow-hidden rounded-xl border border-border bg-surface-secondary/40">
      {item.mediaType === "video" ? (
        <video
          src={item.src}
          className="max-h-48 w-auto object-contain"
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          alt=""
          className="block max-h-48 w-auto object-contain"
        />
      )}
    </div>
  );
}
