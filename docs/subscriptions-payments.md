# Subscriptions & payments

Real-money recurring subscriptions for creators. The data model, creator setup
flow, fan subscribe flow, and content gating are all built and work end-to-end in
**mock mode**. Real card processing (Stripe) is the one remaining, isolated piece.

## How it works today (mock mode)

`SUBSCRIPTIONS_MOCK` defaults to **on** (anything other than the string `"false"`).
In mock mode:

- `POST /api/subscriptions` opens a subscription row immediately — `trialing` if the
  tier has a free trial, otherwise `active` — with `currentPeriodEnd` computed from
  the billing period (`lib/subscriptions/billing.ts`).
- No payment provider is contacted; `providerSubscriptionId` / `providerCustomerId`
  stay null.
- `POST /api/webhooks/stripe` is a no-op.

This lets the entire creator → fan → gated-content path be exercised without keys.

## Data model

- **`subscription_tiers`** — a creator's tiers (price in cents, currency, billing
  period, included collections / unlock-all, perks, trial, intro offer, cap,
  visibility). Owned by the creator.
- **`subscriptions`** — one row per fan↔creator relationship: `status`
  (`active` / `trialing` / `past_due` / `canceled` / `expired`), `currentPeriodEnd`,
  `cancelAtPeriodEnd`, and the reserved `providerSubscriptionId` /
  `providerCustomerId` columns for Stripe.

Access is decided by `getEntitlement()` + `canAccessContent()`
(`lib/subscriptions/entitlement.ts`): an active/trialing tier unlocks either all
exclusive content or its `includedCollectionIds`.

## Going live with Stripe

1. **Install + configure**
   - `npm i stripe`
   - Env: `SUBSCRIPTIONS_MOCK=false`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
     `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using Stripe.js), and a public base URL
     for success/cancel redirects.

2. **Products & prices** — create a Stripe Product + recurring Price per tier when a
   tier is created/updated (`lib/appwrite/subscriptions.ts createTier/updateTier`),
   storing the Stripe price id on the tier row (add a `providerPriceId` column).

3. **Checkout** — in `POST /api/subscriptions` (live branch, where it currently
   returns 501), create a Checkout Session in `subscription` mode for the tier's
   price, attach `fanUserId` + `creatorUserId` + `tierId` as metadata, and return the
   session URL. The client redirects to it instead of optimistically marking the card.

4. **Webhook** — implement `POST /api/webhooks/stripe`: verify the `Stripe-Signature`
   header against `STRIPE_WEBHOOK_SECRET`, then map events with `updateSubscription()`:

   | Stripe event | Subscription update |
   | --- | --- |
   | `checkout.session.completed` | create/activate row (`active` / `trialing`) |
   | `customer.subscription.updated` | `status` + `currentPeriodEnd` |
   | `customer.subscription.deleted` | `status: "canceled"` |
   | `invoice.payment_failed` | `status: "past_due"` |

   Note: the webhook needs the raw request body for signature verification.

5. **Manage / cancel** — add a Customer Portal link (or a cancel endpoint that sets
   `cancelAtPeriodEnd`) for fans to manage billing.

The mock seam means none of the app's other code has to change when this lands —
only the live branch of `POST /api/subscriptions` and the webhook handler.
