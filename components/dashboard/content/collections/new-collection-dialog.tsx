"use client";

import { FolderAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Button,
  Drawer,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
  toast,
} from "@heroui/react";
import { useState } from "react";

import type { Collection } from "../content-meta";
import { useIsMobile } from "../item-drawer/use-is-mobile";
import { createCollectionRequest } from "./collection-api";
import type { ContentTier } from "@/lib/validation/content";

interface NewCollectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** The tier the new collection is created under. */
  tier: ContentTier;
  onCreated: (collection: Collection) => void;
}

/**
 * Name and create a collection within the active tier. Renders as a bottom-sheet
 * drawer on mobile and a centered modal on desktop, mirroring the responsive
 * treatment used by the add-content wizard's FlowShell.
 */
export function NewCollectionDialog({
  isOpen,
  onOpenChange,
  tier,
  onCreated,
}: NewCollectionDialogProps) {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  function close() {
    if (busy) return;
    setName("");
    onOpenChange(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const collection = await createCollectionRequest(tier, name);
      onCreated(collection);
      setName("");
      onOpenChange(false);
    } catch (err) {
      toast.danger(
        err instanceof Error ? err.message : "Couldn't create collection.",
      );
    } finally {
      setBusy(false);
    }
  }

  // Shared inner content — a centered icon + heading, the name field, then the
  // action buttons. Identical across the drawer and modal shells.
  const content = (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-accent/12 text-accent ring-1 ring-inset ring-accent/15">
          <HugeiconsIcon icon={FolderAddIcon} className="size-7" />
        </span>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          New collection
        </h2>
      </div>

      <form id="new-collection-form" onSubmit={submit}>
        <TextField className="w-full" variant="secondary" isRequired>
          <Label>Name</Label>
          <Input
            autoFocus
            placeholder="e.g. Beach shoot"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
          />
        </TextField>
      </form>

      <div className="flex items-center gap-3">
        <Button
          variant="tertiary"
          className="flex-1 cursor-pointer"
          isDisabled={busy}
          onPress={close}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="new-collection-form"
          className="flex-1 cursor-pointer"
          isDisabled={!name.trim() || busy}
        >
          {busy ? <Spinner size="sm" color="current" /> : "Create"}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog
            aria-label="New collection"
            className="overflow-hidden p-0!"
          >
            <Drawer.Handle />
            {content}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    );
  }

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Modal.Container placement="auto">
        <Modal.Dialog
          aria-label="New collection"
          className="rounded-3xl! p-0! sm:max-w-[420px]"
        >
          {content}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
