"use client";

import { Label, Tag, TagGroup } from "@heroui/react";

import type { CollectionOption } from "@/components/dashboard/games/game-meta";

interface CollectionMultiPickerProps {
  /** Collections the creator can gate behind this tier. */
  collections: CollectionOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  /**
   * When true, every collection shows as selected but locked (can't be toggled).
   * The underlying `value` is left untouched, so unlocking restores the real
   * selection. Used while "unlock all exclusive content" is on.
   */
  lockedAll?: boolean;
}

/**
 * A multi-select of the creator's collections, rendered as compact tags that wrap
 * and scroll within a capped height (mirrors the game flow's collection picker).
 * Selection is the tag's own highlighted state.
 */
export function CollectionMultiPicker({
  collections,
  value,
  onChange,
  lockedAll = false,
}: CollectionMultiPickerProps) {
  const allIds = collections.map((c) => c.id);
  const selectedKeys = lockedAll ? new Set(allIds) : new Set(value);

  return (
    <TagGroup
      aria-label="Collections to unlock"
      size="sm"
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      disabledKeys={lockedAll ? allIds : undefined}
      onSelectionChange={(keys) => {
        if (lockedAll) return;
        onChange(
          keys === "all"
            ? allIds
            : (Array.from(keys) as string[]),
        );
      }}
    >
      <Label className="text-xs font-medium text-muted">
        Collections to unlock
      </Label>
      <TagGroup.List
        items={collections}
        className="mt-1.5 max-h-36 overflow-y-auto"
      >
        {(collection) => (
          <Tag
            key={collection.id}
            id={collection.id}
            textValue={collection.name}
            className="cursor-pointer"
          >
            {collection.name}
          </Tag>
        )}
      </TagGroup.List>
    </TagGroup>
  );
}
