import type {
  BillingPeriod,
  SubscriptionStatus,
} from "@/lib/validation/subscription";

/** Months added to the current period per billing interval. */
const PERIOD_MONTHS: Record<BillingPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

/** Whether subscriptions run in mock mode (no real payment processor wired). */
export function isMockMode(): boolean {
  // Default to mock until Stripe is configured; only an explicit "false" opts out.
  return process.env.SUBSCRIPTIONS_MOCK !== "false";
}

/**
 * Compute a fresh subscription's lifecycle window from a tier's terms. A tier
 * with a free trial opens as `trialing` and the first period end is pushed out by
 * the trial length; otherwise it opens `active`. Returns ISO strings ready to
 * write to the `subscriptions` row.
 */
export function computeSubscriptionWindow(
  billingPeriod: BillingPeriod,
  trialDays: number,
): {
  status: Extract<SubscriptionStatus, "active" | "trialing">;
  startedAt: string;
  currentPeriodEnd: string;
} {
  const start = new Date();
  const end = new Date(start);
  if (trialDays > 0) end.setDate(end.getDate() + trialDays);
  end.setMonth(end.getMonth() + PERIOD_MONTHS[billingPeriod]);

  return {
    status: trialDays > 0 ? "trialing" : "active",
    startedAt: start.toISOString(),
    currentPeriodEnd: end.toISOString(),
  };
}
