"use client";

import { Button, Spinner, toast } from "@heroui/react";
import { parseDateTime, type DateValue } from "@internationalized/date";
import { useState } from "react";

import type { FileItem, OfferItem, VaultItem } from "../content-meta";
import { EventDateStep } from "../upload-flow/fields/event-date-step";
import { NumberFieldStep } from "../upload-flow/fields/number-field-step";
import { RarityStep } from "../upload-flow/fields/rarity-step";
import { TextAreaStep } from "../upload-flow/fields/textarea-step";
import { TextFieldStep } from "../upload-flow/fields/text-field-step";
import { TierStep } from "../upload-flow/fields/tier-step";
import type { ContentRarity, ContentTier } from "@/lib/validation/content";

/** Parse a stored `eventAt` ("2026-06-15T20:00") back into a calendar value. */
function parseEventAt(iso: string | null | undefined): DateValue | null {
  if (!iso) return null;
  try {
    // Trim any trailing seconds/zone the picker doesn't carry at minute granularity.
    return parseDateTime(iso.slice(0, 16));
  } catch {
    return null;
  }
}

/** First server-side field error, falling back to a top-level error message. */
function firstError(data: unknown): string | null {
  if (data && typeof data === "object") {
    const fe = (data as { fieldErrors?: Record<string, string> }).fieldErrors;
    if (fe) {
      const first = Object.values(fe)[0];
      if (first) return first;
    }
    const err = (data as { error?: string }).error;
    if (err) return err;
  }
  return null;
}

interface ItemEditFormProps {
  /** An offer, or a file backed by a content row (raw files don't reach here). */
  item: OfferItem | FileItem;
  onSaved: (item: VaultItem) => void;
  onClose: () => void;
}

export function ItemEditForm({ item, onSaved, onClose }: ItemEditFormProps) {
  const contentType = item.kind === "file" ? "file" : item.contentType;
  // Files may not be backed by a row yet (raw onboarding uploads); offers always
  // are. A null rowId means the first save creates the row instead of patching.
  const rowId = item.kind === "file" ? item.rowId : item.id;

  const [title, setTitle] = useState(item.title ?? "");
  const [description, setDescription] = useState(item.description ?? "");
  const [tier, setTier] = useState<ContentTier>(item.tier ?? "exclusive");
  const [rarity, setRarity] = useState<ContentRarity>(item.rarity ?? "common");
  const [tokenValue, setTokenValue] = useState(item.tokenValue ?? 0);
  const [discountPercent, setDiscountPercent] = useState(
    item.kind === "offer" ? item.discountPercent ?? 20 : 20,
  );
  const [eventDate, setEventDate] = useState<DateValue | null>(
    item.kind === "offer" ? parseEventAt(item.eventAt) : null,
  );
  const [eventLocation, setEventLocation] = useState(
    item.kind === "offer" ? item.eventLocation ?? "" : "",
  );

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function validate(): string | null {
    if (contentType !== "file" && !title.trim()) return "Add a title.";
    if (contentType === "perk" && !description.trim()) return "Describe the perk.";
    if (contentType === "event" && !eventDate) return "Pick a date and time.";
    if (
      contentType === "discount" &&
      (discountPercent < 1 || discountPercent > 100)
    ) {
      return "Set a discount between 1 and 100%.";
    }
    if (tier === "gamble" && !rarity) return "Pick a rarity.";
    return null;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setBusy(true);

    // A drop is won, not bought: gamble carries a rarity, exclusive carries a price.
    const normRarity = tier === "gamble" ? rarity : null;
    const normToken = tier === "gamble" ? null : tokenValue;

    const body: Record<string, unknown> = {
      contentType,
      tier,
      rarity: normRarity,
      tokenValue: normToken,
      title: title.trim() || null,
      description: description.trim() || null,
    };
    if (contentType === "discount") body.discountPercent = discountPercent;
    if (contentType === "event") {
      body.eventAt = eventDate?.toString() ?? "";
      body.eventLocation = eventLocation.trim() || null;
    }

    // A raw file (no row yet) creates one; everything else patches in place.
    const creatingFile = item.kind === "file" && rowId === null;

    try {
      let res: Response;
      if (creatingFile) {
        res = await fetch(`/api/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            items: [
              {
                fileId: item.fileId,
                mediaType: item.mediaType,
                title: title.trim() || null,
              },
            ],
          }),
        });
      } else {
        res = await fetch(`/api/content/${rowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(firstError(data) ?? "Couldn't save changes.");
      }

      // A create returns the new row; capture its id so the next save patches it.
      const newRowId = creatingFile
        ? (await res.json().catch(() => null))?.content?.[0]?.$id ?? null
        : null;

      // Reflect the saved terms on the card without a refetch.
      const shared = {
        tier,
        rarity: normRarity,
        tokenValue: normToken,
        title: title.trim() || null,
        description: description.trim() || null,
      };
      const updated: VaultItem =
        item.kind === "file"
          ? { ...item, ...shared, rowId: newRowId ?? item.rowId }
          : {
              ...item,
              ...shared,
              discountPercent:
                contentType === "discount" ? discountPercent : item.discountPercent,
              eventAt:
                contentType === "event"
                  ? eventDate?.toString() ?? null
                  : item.eventAt,
              eventLocation:
                contentType === "event"
                  ? eventLocation.trim() || null
                  : item.eventLocation,
            };
      onSaved(updated);
      onClose();
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <TextFieldStep
        label={contentType === "file" ? "Title (optional)" : "Title"}
        value={title}
        onChange={setTitle}
        error={error && contentType !== "file" && !title.trim() ? error : undefined}
      />

      {contentType === "discount" ? (
        <NumberFieldStep
          label="Discount (%)"
          value={discountPercent}
          onChange={setDiscountPercent}
          minValue={1}
          maxValue={100}
          step={5}
        />
      ) : null}

      {contentType === "event" ? (
        <>
          <EventDateStep
            value={eventDate}
            onChange={setEventDate}
            error={error && !eventDate ? error : undefined}
          />
          <TextFieldStep
            label="Location (optional)"
            placeholder="A link or place"
            value={eventLocation}
            onChange={setEventLocation}
          />
        </>
      ) : null}

      <TextAreaStep
        label={contentType === "perk" ? "What fans get" : "Description (optional)"}
        value={description}
        onChange={setDescription}
        error={
          error && contentType === "perk" && !description.trim() ? error : undefined
        }
      />

      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-medium text-foreground">
          How do fans get this?
        </span>
        <TierStep tier={tier} onChange={setTier} />
      </div>

      {tier === "gamble" ? (
        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-medium text-foreground">Rarity</span>
          <RarityStep rarity={rarity} onChange={setRarity} />
        </div>
      ) : (
        <NumberFieldStep
          label="Price (tokens)"
          value={tokenValue}
          onChange={setTokenValue}
          minValue={0}
          maxValue={1_000_000}
          step={10}
          description="The starting price — your agent fine-tunes it per fan."
        />
      )}

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="tertiary" onPress={onClose} isDisabled={busy}>
          Cancel
        </Button>
        <Button type="submit" isPending={busy}>
          {({ isPending }) =>
            isPending ? <Spinner size="sm" color="current" /> : "Save changes"
          }
        </Button>
      </div>
    </form>
  );
}
