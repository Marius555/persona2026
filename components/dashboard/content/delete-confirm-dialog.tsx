"use client";

import { AlertDialog, Button, Spinner, toast } from "@heroui/react";
import { useState } from "react";

import { OFFER_META, type VaultItem } from "./content-meta";

interface DeleteConfirmDialogProps {
  /** The item awaiting confirmation, or null when the dialog is closed. */
  item: VaultItem | null;
  onClose: () => void;
  onDeleted: (item: VaultItem) => void;
}

/** A readable name for the item in the confirmation copy. */
function itemLabel(item: VaultItem): string {
  if (item.kind === "offer") {
    return item.title || OFFER_META[item.contentType].label;
  }
  return item.title || (item.mediaType === "video" ? "this clip" : "this photo");
}

/**
 * Destructive confirm for a vault item. Files delete through the media route
 * (storage + rows), offers through the content route (row only).
 */
export function DeleteConfirmDialog({
  item,
  onClose,
  onDeleted,
}: DeleteConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    if (!item) return;
    setBusy(true);
    const url =
      item.kind === "file"
        ? `/api/media/${item.fileId}`
        : `/api/content/${item.id}`;
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleted(item);
      onClose();
    } catch {
      toast.danger("Couldn't delete that. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog.Backdrop
      isOpen={!!item}
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-[400px]">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Heading>Delete this content?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              This permanently removes{" "}
              <strong>{item ? itemLabel(item) : "this item"}</strong> from your
              vault
              {item?.kind === "file" ? " and deletes the file" : ""}. This can&apos;t
              be undone.
            </p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" isPending={busy} onPress={confirmDelete}>
              {({ isPending }) =>
                isPending ? <Spinner size="sm" color="current" /> : "Delete"
              }
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
