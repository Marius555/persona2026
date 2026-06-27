import { z } from "zod";

/**
 * Subscription domain enums. These MUST stay aligned with the `subscription_tiers`
 * and `subscriptions` table enum `elements` in `appwrite.schema.json` (applied by
 * scripts/setup-appwrite.mjs).
 */

/** Real-money currencies a tier can be priced in. Prices are stored in cents. */
export const SUBSCRIPTION_CURRENCIES = ["usd", "eur", "gbp"] as const;
export type SubscriptionCurrency = (typeof SUBSCRIPTION_CURRENCIES)[number];

/** How often the subscription recurs. */
export const BILLING_PERIODS = ["monthly", "quarterly", "yearly"] as const;
export type BillingPeriod = (typeof BILLING_PERIODS)[number];

/**
 * A subscription record's lifecycle. `trialing`/`active` grant access; the rest
 * do not. Updated by the payment provider seam (Stripe webhook) in live mode.
 */
export const SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "expired",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const currencySchema = z.enum(SUBSCRIPTION_CURRENCIES);
export const billingPeriodSchema = z.enum(BILLING_PERIODS);
export const subscriptionStatusSchema = z.enum(SUBSCRIPTION_STATUSES);

/** Statuses that actively grant a fan access to the tier's content. */
export const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;

/**
 * The shape a creator edits for a subscription tier. Money is an integer cent
 * amount (999 = $9.99) so we never round floats. A tier MUST grant something —
 * either all exclusive content, at least one collection, or at least one benefit.
 */
const tierShape = {
  name: z.string().trim().min(1, "Name your tier").max(40),
  tagline: z.string().trim().max(120).nullish(),
  description: z.string().trim().max(1000).nullish(),
  priceCents: z
    .number()
    .int()
    .min(0, "Price can't be negative")
    .max(100_000_000),
  currency: currencySchema.default("usd"),
  billingPeriod: billingPeriodSchema.default("monthly"),
  includedCollectionIds: z.array(z.string().max(64)).max(100).default([]),
  unlocksAllExclusive: z.boolean().default(false),
  benefits: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  coverFileId: z.string().max(64).nullish(),
  trialDays: z.number().int().min(0).max(90).default(0),
  introDiscountPercent: z.number().int().min(0).max(100).nullish(),
  introLabel: z.string().trim().max(60).nullish(),
  subscriberCap: z.number().int().min(0).max(1_000_000).default(0),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(1000).default(0),
};

/** A tier must unlock content or list at least one perk, or it sells nothing. */
const grantsSomething = (d: {
  unlocksAllExclusive: boolean;
  includedCollectionIds: string[];
  benefits: string[];
}) =>
  d.unlocksAllExclusive ||
  d.includedCollectionIds.length > 0 ||
  d.benefits.length > 0;

const grantsRefinement = {
  message: "Add at least one collection, perk, or unlock all exclusive content",
  path: ["includedCollectionIds"] as string[],
};

export const createTierSchema = z
  .object(tierShape)
  .refine(grantsSomething, grantsRefinement);

export type CreateTier = z.infer<typeof createTierSchema>;

/**
 * A full edit to an existing tier. Mirrors create — every step writes the whole
 * draft back, so there's no partial-PATCH ambiguity to manage.
 */
export const updateTierSchema = z
  .object(tierShape)
  .refine(grantsSomething, grantsRefinement);

export type UpdateTier = z.infer<typeof updateTierSchema>;

/**
 * A fan's request to subscribe. Only the tier id is trusted from the client; the
 * price, currency, and creator are all resolved server-side from the tier row.
 */
export const subscribeSchema = z.object({
  tierId: z.string().min(1).max(64),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
