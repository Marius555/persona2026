"use client";

import type { ContentRarity } from "@/lib/validation/content";

import type { CollectionOption } from "../../game-meta";
import { CollectionOddsPicker } from "../fields/collection-odds-picker";

interface StepOddsProps {
  /** All eligible Games-tier collections (with content). */
  collections: CollectionOption[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  rarityById: Record<string, ContentRarity>;
  onRarityChange: (id: string, rarity: ContentRarity) => void;
  error?: string;
}

/**
 * Step 2 ("Set the odds"), shown only in manual mode (auto-design off). Each
 * Games-tier collection is a full-width radio field; selecting one puts it in
 * play and reveals its rarity → win chance inline.
 */
export function StepOdds({
  collections,
  selectedIds,
  onSelectedIdsChange,
  rarityById,
  onRarityChange,
  error,
}: StepOddsProps) {
  if (!collections.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/40 p-6 text-center text-sm text-muted">
        You don&apos;t have any Games-tier collections with content yet. Add some
        in your vault to set their odds.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-left">
      <p className="text-xs font-medium text-muted">Collections in play</p>
      <CollectionOddsPicker
        collections={collections}
        value={selectedIds}
        onChange={onSelectedIdsChange}
        rarityById={rarityById}
        onRarityChange={onRarityChange}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
