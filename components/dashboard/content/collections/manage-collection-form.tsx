"use client";

import {
  AlertDialog,
  Button,
  Description,
  Input,
  Label,
  Separator,
  Spinner,
  Switch,
  TextField,
  toast,
} from "@heroui/react";
import { useState } from "react";

import type { Collection } from "../content-meta";
import {
  deleteCollectionRequest,
  updateCollectionRequest,
} from "./collection-api";

interface ManageCollectionFormProps {
  /** The collection being managed — seeds the form's initial state. */
  collection: Collection;
  onUpdated: (collection: Collection) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}

/**
 * The body of the manage drawer: rename, a visibility toggle, and a destructive
 * delete (behind a confirm). Mounted with a `key` of the collection id so its
 * local state always seeds from the collection it's editing.
 */
export function ManageCollectionForm({
  collection,
  onUpdated,
  onDeleted,
  onClose,
}: ManageCollectionFormProps) {
  const [name, setName] = useState(collection.name);
  const [visible, setVisible] = useState(collection.visible);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const trimmed = name.trim();
  const nameChanged = !!trimmed && trimmed !== collection.name;
  const visibleChanged = visible !== collection.visible;
  const hasChanges = nameChanged || visibleChanged;

  async function save() {
    if (!hasChanges || saving) return;
    setSaving(true);
    try {
      const updated = await updateCollectionRequest(collection.id, {
        ...(nameChanged ? { name: trimmed } : {}),
        ...(visibleChanged ? { visible } : {}),
      });
      onUpdated(updated);
      toast.success("Saved.");
      onClose();
    } catch (err) {
      toast.danger(
        err instanceof Error ? err.message : "Couldn't save changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteCollectionRequest(collection.id);
      onDeleted(collection.id);
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      toast.danger(
        err instanceof Error ? err.message : "Couldn't delete collection.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-6">
      {/* Rename */}
      <TextField className="w-full" variant="secondary" isRequired>
        <Label>Name</Label>
        <Input
          placeholder="e.g. Beach shoot"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
        />
      </TextField>

      <Separator />

      {/* Visibility */}
      <Switch isSelected={visible} onChange={setVisible}>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Visible to fans</Label>
          <Description>
            Turn this off to hide the collection from everyone but you.
          </Description>
        </Switch.Content>
      </Switch>

      <Separator />

      <Button
        className="w-full cursor-pointer"
        isDisabled={!hasChanges || saving}
        onPress={save}
      >
        {saving ? <Spinner size="sm" color="current" /> : "Save"}
      </Button>

      {/* Destructive action pinned to the bottom of the drawer, with margin. */}
      <div className="mt-auto pb-2 pt-8">
        <Separator className="mb-6" />
        <Button
          variant="danger"
          className="w-full cursor-pointer"
          onPress={() => setConfirmOpen(true)}
        >
          Delete collection
        </Button>
      </div>

      <AlertDialog.Backdrop
        isOpen={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) setConfirmOpen(false);
        }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Delete this collection?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                This deletes <strong>{collection.name}</strong>. The content
                inside stays in your vault. This can&apos;t be undone.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" isPending={deleting} onPress={confirmDelete}>
                {({ isPending }) =>
                  isPending ? <Spinner size="sm" color="current" /> : "Delete"
                }
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  );
}
