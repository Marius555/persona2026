import { NextResponse } from "next/server";

import { isMockMode } from "@/lib/subscriptions/billing";

/**
 * Stripe webhook seam.
 *
 * In mock mode (the default until Stripe is configured), subscriptions are opened
 * synchronously in `POST /api/subscriptions`, so there are no provider events to
 * process and this endpoint is a no-op.
 *
 * To go live: set `SUBSCRIPTIONS_MOCK=false` and the `STRIPE_*` env vars, then
 * implement signature verification and map events onto the `subscriptions` table
 * via `updateSubscription()` from `lib/appwrite/subscriptions.ts`:
 *   - `checkout.session.completed`            → status "active"/"trialing"
 *   - `customer.subscription.updated`         → status + currentPeriodEnd
 *   - `customer.subscription.deleted`         → status "canceled"
 *   - `invoice.payment_failed`                → status "past_due"
 * See `docs/subscriptions-payments.md` for the full outline.
 */
export async function POST() {
  if (isMockMode()) {
    return NextResponse.json(
      { ok: true, note: "Mock mode — no Stripe events to process." },
      { status: 200 },
    );
  }

  // TODO(payments): verify the Stripe-Signature header against STRIPE_WEBHOOK_SECRET
  // and update the matching subscription row.
  return NextResponse.json(
    { error: "Stripe webhook not implemented yet." },
    { status: 501 },
  );
}
