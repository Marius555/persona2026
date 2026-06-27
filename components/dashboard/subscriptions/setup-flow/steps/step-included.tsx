"use client";

import { Description, Label, Switch } from "@heroui/react";

import type { CollectionOption } from "@/components/dashboard/games/game-meta";
import type { TierDraft } from "../../subscription-meta";
import { CollectionMultiPicker } from "../fields/collection-multi-picker";
import { SettingCard } from "../fields/setting-card";

interface StepIncludedProps {
  draft: TierDraft;
  onChange: (patch: Partial<TierDraft>) => void;
  /** Collections (with content) the creator can gate behind this tier. */
  collections: CollectionOption[];
  error?: string;
}

/** Step 3: what subscribing unlocks — all exclusive content and/or collections. */
export function StepIncluded({
  draft,
  onChange,
  collections,
  error,
}: StepIncludedProps) {
  const hasCollections = collections.length > 0;

  return (
    <div className="flex flex-col gap-3 text-left">
      {/* Shortcut — unlock everything in the exclusive vault. */}
      <SettingCard>
        <Switch
          isSelected={draft.unlocksAllExclusive}
          onChange={(unlocksAllExclusive) => onChange({ unlocksAllExclusive })}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label className="text-sm font-semibold text-foreground">
              Unlock all exclusive content
            </Label>
            <Description>
              Subscribers get every exclusive item, including anything you add
              later.
            </Description>
          </Switch.Content>
        </Switch>
      </SettingCard>

      {/* Collections list — always shown; locked + fully checked while "all" is on. */}
      <SettingCard>
        {hasCollections ? (
          <CollectionMultiPicker
            collections={collections}
            value={draft.includedCollectionIds}
            onChange={(includedCollectionIds) =>
              onChange({ includedCollectionIds })
            }
            lockedAll={draft.unlocksAllExclusive}
          />
        ) : (
          <p className="text-sm text-muted">
            No collections with content yet. Flip on “Unlock all exclusive
            content” above, or add perks on the next step.
          </p>
        )}
      </SettingCard>

      {error ? <p className="px-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
