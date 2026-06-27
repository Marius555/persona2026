import { NextResponse } from "next/server";
import { AppwriteException } from "node-appwrite";

import { getLoggedInUser } from "@/lib/appwrite/server";
import {
  countActiveSubscribers,
  createSubscription,
  getFanSubscription,
  getTierById,
  listSubscriptionsByFan,
} from "@/lib/appwrite/subscriptions";
import { computeSubscriptionWindow, isMockMode } from "@/lib/subscriptions/billing";
import { flattenFieldErrors } from "@/lib/validation/auth";
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  subscribeSchema,
  type SubscriptionStatus,
} from "@/lib/validation/subscription";

const ACTIVE = ACTIVE_SUBSCRIPTION_STATUSES as readonly SubscriptionStatus[];

/** The fan's own subscriptions across creators, newest first. */
export async function GET() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await listSubscriptionsByFan(user.$id);
  return NextResponse.json({ subscriptions });
}

/**
 * Subscribe the logged-in fan to a tier. The tier (and thus its price, currency,
 * and creator) is resolved server-side — the client only sends a `tierId`. In
 * mock mode this opens an active/trialing subscription immediately; live mode
 * (Stripe) is wired in a later phase.
 */
export async function POST(request: Request) {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrors: flattenFieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const tier = await getTierById(parsed.data.tierId);
  if (!tier || !tier.visible) {
    return NextResponse.json({ error: "Tier not found" }, { status: 404 });
  }

  // Block a duplicate active/trialing subscription to the same creator.
  const existing = await getFanSubscription(user.$id, tier.userId);
  if (existing && ACTIVE.includes(existing.status)) {
    return NextResponse.json(
      { error: "You're already subscribed to this creator." },
      { status: 409 },
    );
  }

  // Enforce a subscriber cap when the creator set one.
  if (tier.subscriberCap && tier.subscriberCap > 0) {
    const count = await countActiveSubscribers(tier.$id);
    if (count >= tier.subscriberCap) {
      return NextResponse.json(
        { error: "This tier is full." },
        { status: 409 },
      );
    }
  }

  if (!isMockMode()) {
    // Live payments (Stripe Checkout) land in the dedicated payments phase.
    return NextResponse.json(
      { error: "Payments aren't configured yet." },
      { status: 501 },
    );
  }

  const window = computeSubscriptionWindow(
    tier.billingPeriod ?? "monthly",
    tier.trialDays ?? 0,
  );

  try {
    const subscription = await createSubscription({
      fanUserId: user.$id,
      creatorUserId: tier.userId,
      tierId: tier.$id,
      status: window.status,
      startedAt: window.startedAt,
      currentPeriodEnd: window.currentPeriodEnd,
    });
    return NextResponse.json({ subscription }, { status: 201 });
  } catch (err) {
    if (err instanceof AppwriteException) {
      return NextResponse.json({ error: err.message }, { status: err.code || 500 });
    }
    return NextResponse.json(
      { error: "Couldn't start subscription" },
      { status: 500 },
    );
  }
}
