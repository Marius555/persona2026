"use client";

import { Label, Tag, TagGroup } from "@heroui/react";

import type { CollectionOption } from "../../game-meta";

interface ExclusiveCollectionPickerProps {
  /** Exclusive collections that hold at least one item. */
  collections: CollectionOption[];
  /** Currently-selected collection ids. */
  value: string[];
  onChange: (ids: string[]) => void;
}

/**
 * A multi-select of the creator's exclusive collections, rendered as compact
 * tags that wrap and scroll within a capped height — so the section stays small
 * whether there are two collections or fifty. Selection is the tag's own
 * highlighted state.
 */
export function ExclusiveCollectionPicker({
  collections,
  value,
  onChange,
}: ExclusiveCollectionPickerProps) {
  return (
    <TagGroup
      aria-label="Exclusive collections"
      size="sm"
      selectionMode="multiple"
      selectedKeys={new Set(value)}
      onSelectionChange={(keys) =>
        onChange(
          keys === "all"
            ? collections.map((c) => c.id)
            : (Array.from(keys) as string[]),
        )
      }
    >
      <Label className="text-xs font-medium text-muted">
        Collections to include
      </Label>
      <TagGroup.List
        items={collections}
        className="mt-1.5 max-h-36 overflow-y-auto"
      >
        {(collection) => (
          <Tag key={collection.id} id={collection.id} textValue={collection.name}>
            {collection.name}
          </Tag>
        )}
      </TagGroup.List>
    </TagGroup>
  );
}
