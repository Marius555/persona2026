"use client";

import { Description, Label, Switch } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { DateRange, CollectionOption } from "../../game-meta";
import { CampaignDatesField } from "../fields/campaign-dates-field";
import { ExclusiveCollectionPicker } from "../fields/exclusive-collection-picker";

interface StepBasicsProps {
  /** Exclusive collections holding at least one item (drives Switch A). */
  exclusiveCollections: CollectionOption[];
  includeExclusive: boolean;
  onIncludeExclusiveChange: (next: boolean) => void;
  exclusiveCollectionIds: string[];
  onExclusiveCollectionIdsChange: (ids: string[]) => void;
  collectionError?: string;
  autoDesignOdds: boolean;
  onAutoDesignOddsChange: (next: boolean) => void;
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
  dateError?: string;
}

/** A bordered container that frames one setting (a switch or the date picker). */
function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-secondary/40 p-4">
      {children}
    </div>
  );
}

/**
 * Step 1 of the game setup flow. Collects the basics: whether to fold exclusive
 * content into the prize pool (and which collections), whether the agent should
 * auto-design the odds, and the campaign's date range.
 */
export function StepBasics({
  exclusiveCollections,
  includeExclusive,
  onIncludeExclusiveChange,
  exclusiveCollectionIds,
  onExclusiveCollectionIdsChange,
  collectionError,
  autoDesignOdds,
  onAutoDesignOddsChange,
  dateRange,
  onDateRangeChange,
  dateError,
}: StepBasicsProps) {
  const reduceMotion = useReducedMotion();
  const hasExclusive = exclusiveCollections.length > 0;

  return (
    <div className="flex flex-col gap-3 text-left">
      

      {/* Switch B — let the agent design the odds. */}
      <SettingCard>
        <Switch isSelected={autoDesignOdds} onChange={onAutoDesignOddsChange}>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label className="text-sm font-semibold text-foreground">
              Auto Design 
            </Label>
            <Description>
              Let your agent tune the odds for the best follower growth and
              monetization. Turn off to set them yourself.
            </Description>
          </Switch.Content>
        </Switch>
      </SettingCard>

      {/* Switch A — only when the creator actually has exclusive content. */}
      {hasExclusive ? (
        <SettingCard>
          <Switch
            isSelected={includeExclusive}
            onChange={onIncludeExclusiveChange}
          >
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Content>
              <Label className="text-sm font-semibold text-foreground">
                Include exclusive content
              </Label>
              <Description>
                Stake your exclusive collections as prizes fans can win.
              </Description>
            </Switch.Content>
          </Switch>

          <AnimatePresence initial={false}>
            {includeExclusive ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
                }
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <ExclusiveCollectionPicker
                    collections={exclusiveCollections}
                    value={exclusiveCollectionIds}
                    onChange={onExclusiveCollectionIdsChange}
                  />
                  {collectionError ? (
                    <p className="pt-2 text-xs text-danger">{collectionError}</p>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </SettingCard>
      ) : null}

      {/* Campaign window. */}
      <SettingCard>
        <CampaignDatesField
          value={dateRange}
          onChange={onDateRangeChange}
          error={dateError}
        />
      </SettingCard>
    </div>
  );
}
