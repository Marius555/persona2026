import type {
  BillingPeriod,
  SubscriptionCurrency,
} from "@/lib/validation/subscription";

/**
 * A subscription tier as the client renders it — a flat, client-safe mirror of
 * the `subscription_tiers` row (the server `TierRow` lives behind the API). Nulls
 * from the table are normalized to concrete defaults here so the UI never branches.
 */
export interface Tier {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  priceCents: number;
  currency: SubscriptionCurrency;
  billingPeriod: BillingPeriod;
  includedCollectionIds: string[];
  unlocksAllExclusive: boolean;
  benefits: string[];
  coverFileId: string | null;
  trialDays: number;
  introDiscountPercent: number | null;
  introLabel: string | null;
  subscriberCap: number;
  visible: boolean;
  sortOrder: number;
}

/**
 * The in-progress tier configuration, accumulated across the setup stepper and
 * held client-side until the final step persists it (mirrors the GameDraft model).
 * Optional copy is a plain string ("" = unset) and 0 means "none" for the numeric
 * extras, so every field is always defined while editing.
 */
export interface TierDraft {
  name: string;
  tagline: string;
  description: string;
  priceCents: number;
  currency: SubscriptionCurrency;
  billingPeriod: BillingPeriod;
  includedCollectionIds: string[];
  unlocksAllExclusive: boolean;
  benefits: string[];
  trialDays: number;
  introDiscountPercent: number;
  introLabel: string;
  subscriberCap: number;
  visible: boolean;
}

/** Symbol + short label per supported currency. */
export const CURRENCY_META: Record<
  SubscriptionCurrency,
  { symbol: string; label: string }
> = {
  usd: { symbol: "$", label: "USD" },
  eur: { symbol: "€", label: "EUR" },
  gbp: { symbol: "£", label: "GBP" },
};

/** Display label, price suffix, and singular noun per billing interval. */
export const BILLING_PERIOD_META: Record<
  BillingPeriod,
  { label: string; suffix: string; noun: string }
> = {
  monthly: { label: "Monthly", suffix: "/mo", noun: "month" },
  quarterly: { label: "Quarterly", suffix: "/qtr", noun: "quarter" },
  yearly: { label: "Yearly", suffix: "/yr", noun: "year" },
};

/** Tap-to-add perk suggestions, so a creator isn't staring at a blank list. */
export const BENEFIT_PRESETS = [
  "Daily DMs",
  "Exclusive weekly drop",
  "Custom requests",
  "Early access",
  "Behind the scenes",
  "Priority replies",
];

/** Format a cent amount as a localized currency string (whole amounts drop ".00"). */
export function formatPrice(
  cents: number,
  currency: SubscriptionCurrency,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/**
 * The loose shape of a tier row from either the server data module or a parsed
 * API response — nullable everywhere, since the table columns are optional.
 */
export interface RawTier {
  $id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  priceCents: number;
  currency: SubscriptionCurrency | null;
  billingPeriod: BillingPeriod | null;
  includedCollectionIds: string[] | null;
  unlocksAllExclusive: boolean | null;
  benefits: string[] | null;
  coverFileId: string | null;
  trialDays: number | null;
  introDiscountPercent: number | null;
  introLabel: string | null;
  subscriberCap: number | null;
  visible: boolean | null;
  sortOrder: number | null;
}

/** Normalize a row's nullable columns into the concrete client `Tier`. */
export function toTier(row: RawTier): Tier {
  return {
    id: row.$id,
    name: row.name,
    tagline: row.tagline ?? null,
    description: row.description ?? null,
    priceCents: row.priceCents,
    currency: row.currency ?? "usd",
    billingPeriod: row.billingPeriod ?? "monthly",
    includedCollectionIds: row.includedCollectionIds ?? [],
    unlocksAllExclusive: row.unlocksAllExclusive ?? false,
    benefits: row.benefits ?? [],
    coverFileId: row.coverFileId ?? null,
    trialDays: row.trialDays ?? 0,
    introDiscountPercent: row.introDiscountPercent ?? null,
    introLabel: row.introLabel ?? null,
    subscriberCap: row.subscriberCap ?? 0,
    visible: row.visible ?? true,
    sortOrder: row.sortOrder ?? 0,
  };
}

/** A blank draft for the "create tier" path. */
export function emptyTierDraft(): TierDraft {
  return {
    name: "",
    tagline: "",
    description: "",
    priceCents: 999,
    currency: "usd",
    billingPeriod: "monthly",
    includedCollectionIds: [],
    unlocksAllExclusive: false,
    benefits: [],
    trialDays: 0,
    introDiscountPercent: 0,
    introLabel: "",
    subscriberCap: 0,
    visible: true,
  };
}

/** Hydrate an editable draft from an existing tier. */
export function draftFromTier(tier: Tier): TierDraft {
  return {
    name: tier.name,
    tagline: tier.tagline ?? "",
    description: tier.description ?? "",
    priceCents: tier.priceCents,
    currency: tier.currency,
    billingPeriod: tier.billingPeriod,
    includedCollectionIds: tier.includedCollectionIds,
    unlocksAllExclusive: tier.unlocksAllExclusive,
    benefits: tier.benefits,
    trialDays: tier.trialDays,
    introDiscountPercent: tier.introDiscountPercent ?? 0,
    introLabel: tier.introLabel ?? "",
    subscriberCap: tier.subscriberCap,
    visible: tier.visible,
  };
}

/**
 * Reduce a draft to the JSON body the tier API expects (matches createTierSchema):
 * empty optional copy becomes null, blank benefits are dropped, and a 0% intro
 * discount collapses to null ("no offer").
 */
export function toTierPayload(draft: TierDraft) {
  const tagline = draft.tagline.trim();
  const description = draft.description.trim();
  const introLabel = draft.introLabel.trim();
  return {
    name: draft.name.trim(),
    tagline: tagline || null,
    description: description || null,
    priceCents: draft.priceCents,
    currency: draft.currency,
    billingPeriod: draft.billingPeriod,
    includedCollectionIds: draft.includedCollectionIds,
    unlocksAllExclusive: draft.unlocksAllExclusive,
    benefits: draft.benefits.map((b) => b.trim()).filter(Boolean),
    trialDays: draft.trialDays,
    introDiscountPercent:
      draft.introDiscountPercent > 0 ? draft.introDiscountPercent : null,
    introLabel: introLabel || null,
    subscriberCap: draft.subscriberCap,
    visible: draft.visible,
  };
}
