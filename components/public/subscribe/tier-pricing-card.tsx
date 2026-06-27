"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Card, Spinner } from "@heroui/react";

import {
  BILLING_PERIOD_META,
  formatPrice,
  type Tier,
} from "@/components/dashboard/subscriptions/subscription-meta";

/** The CTA state for a pricing card, decided by the panel from viewer context. */
export type CardState = "subscribe" | "current" | "locked" | "signin" | "own";

interface TierPricingCardProps {
  tier: Tier;
  state: CardState;
  busy?: boolean;
  /** Subscribe, or (when `state` is "signin") route to login — the panel decides. */
  onSubscribe: () => void;
}

const CTA_LABEL: Record<CardState, string> = {
  subscribe: "Subscribe",
  current: "Current plan",
  locked: "Subscribed",
  signin: "Sign in to subscribe",
  own: "Your tier",
};

/** A fan-facing pricing card: price, perks, intro offer, and a contextual CTA. */
export function TierPricingCard({
  tier,
  state,
  busy,
  onSubscribe,
}: TierPricingCardProps) {
  const period = BILLING_PERIOD_META[tier.billingPeriod];
  const isCurrent = state === "current";

  return (
    <Card className={isCurrent ? "border-accent ring-1 ring-accent/30" : ""}>
      <Card.Content className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
        {tier.tagline ? (
          <p className="text-sm text-muted">{tier.tagline}</p>
        ) : null}
      </div>

      <div>
        <p>
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {formatPrice(tier.priceCents, tier.currency)}
          </span>
          <span className="text-sm text-muted">{period.suffix}</span>
        </p>
        {tier.introDiscountPercent ? (
          <p className="mt-1 text-xs font-medium text-accent">
            {tier.introLabel ||
              `${tier.introDiscountPercent}% off the first ${period.noun}`}
          </p>
        ) : null}
        {tier.trialDays > 0 ? (
          <p className="mt-1 text-xs text-muted">
            {tier.trialDays}-day free trial
          </p>
        ) : null}
      </div>

      {tier.description ? (
        <p className="text-sm leading-relaxed text-muted">{tier.description}</p>
      ) : null}

      {tier.benefits.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {tier.benefits.map((benefit, i) => (
            <li key={`${benefit}-${i}`} className="flex items-start gap-2">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="mt-0.5 size-4 shrink-0 text-accent"
              />
              <span className="text-sm text-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto pt-1">
        <Button
          className="w-full cursor-pointer"
          variant={state === "signin" || isCurrent ? "secondary" : "primary"}
          isDisabled={
            state === "current" ||
            state === "locked" ||
            state === "own" ||
            busy
          }
          onPress={onSubscribe}
        >
          {busy ? <Spinner size="sm" color="current" /> : CTA_LABEL[state]}
        </Button>
      </div>
      </Card.Content>
    </Card>
  );
}
