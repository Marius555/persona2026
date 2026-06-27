"use client";

import { Drawer } from "@heroui/react";
import { useState } from "react";

import type { Collection } from "../content-meta";
import { useIsMobile } from "../item-drawer/use-is-mobile";
import { ManageCollectionForm } from "./manage-collection-form";

interface ManageCollectionDrawerProps {
  /** The collection to manage, or null when the drawer is closed. */
  collection: Collection | null;
  onClose: () => void;
  onUpdated: (collection: Collection) => void;
  onDeleted: (id: string) => void;
}

/**
 * Manage the active collection — right edge on desktop, bottom sheet on mobile,
 * mirroring the item drawer. The form is keyed by the collection id so it always
 * seeds from the collection it's editing.
 */
export function ManageCollectionDrawer({
  collection,
  onClose,
  onUpdated,
  onDeleted,
}: ManageCollectionDrawerProps) {
  const isMobile = useIsMobile();

  // Keep the last collection on screen while the drawer slides closed — nulling
  // the body the instant `collection` goes null collapses the sheet so the
  // slide-out is invisible. Adjusting state during render (not in an effect) is
  // the supported way to retain a value across a prop change.
  const [shown, setShown] = useState(collection);
  if (collection && collection !== shown) setShown(collection);
  const current = collection ?? shown;

  return (
    <Drawer.Backdrop
      isOpen={!!collection}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Content placement={isMobile ? "bottom" : "right"}>
        <Drawer.Dialog>
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>Manage collection</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body className="scrollbar-hide">
            {current ? (
              <ManageCollectionForm
                key={current.id}
                collection={current}
                onUpdated={onUpdated}
                onDeleted={onDeleted}
                onClose={onClose}
              />
            ) : null}
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
