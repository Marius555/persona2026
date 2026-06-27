import {
  CircleIcon,
  CrownIcon,
  Diamond02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";

import type { ContentRarity } from "@/lib/validation/content";

/**
 * One collection the creator can fold into a game — either an exclusive
 * collection (Step 1 prize pool) or a Games-tier collection (Step 2 odds).
 * Sourced from the `collections` table with a count of the content rows filed
 * under it, so pickers can show how much each collection contributes.
 */
export interface CollectionOption {
  id: string;
  name: string;
  itemCount: number;
  /** ISO timestamp the collection was created (`$createdAt`). */
  createdAt: string;
}

/**
 * A start→end date range from the campaign-dates picker. Structurally identical to
 * react-aria's `RangeValue<DateValue>`, declared locally so consumers don't depend
 * on `@react-types/shared`.
 */
export interface DateRange {
  start: DateValue;
  end: DateValue;
}

/**
 * Campaign window bounds: from today through one month out. A single source of truth
 * shared by the date-range picker (min/max to disable out-of-range days) and the step
 * validator, so the calendar UI and the Continue gate stay in agreement.
 */
export function campaignDateBounds(): { min: DateValue; max: DateValue } {
  const min = today(getLocalTimeZone());
  return { min, max: min.add({ months: 1 }) };
}

/**
 * The chance (percent) a fan wins a drop from a collection assigned each rarity.
 * Rarer = harder to win, so a legendary collection feels like a jackpot. Used in
 * manual-odds mode; the agent overrides these when auto-design is on.
 */
export const RARITY_WIN_CHANCE: Record<ContentRarity, number> = {
  common: 50,
  rare: 25,
  epic: 10,
  legendary: 4,
};

/**
 * Per-rarity Tailwind treatment for the selected state of a rarity chip. A single
 * accent-hue ramp so the palette stays on-theme: the fill grows bolder as rarity
 * rises (common = faint tint → legendary = solid accent), keeping rarity readable
 * without introducing off-theme colors.
 */
export const RARITY_STYLE: Record<ContentRarity, string> = {
  common: "border-accent/30 bg-accent/10 text-accent",
  rare: "border-accent/50 bg-accent/20 text-accent",
  epic: "border-accent/70 bg-accent/35 text-accent",
  legendary: "border-accent bg-accent text-accent-foreground",
};

/**
 * Per-rarity icon, escalating in "prestige" so the four tiers are recognizable
 * at a glance even as compact icon-buttons (label revealed on hover):
 * common → plain circle, rare → diamond, epic → star, legendary → crown.
 */
export const RARITY_ICON: Record<ContentRarity, IconSvgElement> = {
  common: CircleIcon,
  rare: Diamond02Icon,
  epic: StarIcon,
  legendary: CrownIcon,
};

/**
 * The in-progress game configuration, accumulated across the setup stepper and held
 * client-side until the full flow is finished (mirrors onboarding's staging model —
 * nothing is persisted until the final step).
 */
export interface GameDraft {
  /** Whether exclusive-tier content feeds the game's prize pool. */
  includeExclusive: boolean;
  /** Which exclusive collections to draw from (only when `includeExclusive`). */
  exclusiveCollectionIds: string[];
  /** Let the agent tune winning chances/odds for growth + monetization. */
  autoDesignOdds: boolean;
  /** Games-tier collections in play (manual-odds mode only). */
  gameCollectionIds: string[];
  /** Per game collection, its chosen rarity → win chance (manual-odds mode only). */
  collectionRarity: Record<string, ContentRarity>;
  /** Campaign window, ISO date strings (serialized from the date-range picker). */
  startsAt: string | null;
  endsAt: string | null;
}
