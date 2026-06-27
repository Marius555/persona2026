"use client";

import {
  CheckmarkCircle02Icon,
  Delete02Icon,
  PencilEdit02Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card } from "@heroui/react";

import {
  BILLING_PERIOD_META,
  formatPrice,
  type Tier,
} from "./subscription-meta";

interface TierCardProps {
  tier: Tier;
  /** Active/trialing subscribers on this tier. */
  subscriberCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

/** A small icon button used for the card's edit / delete actions. */
function IconAction({
  label,
  icon,
  danger,
  onPress,
}: {
  label: string;
  icon: typeof PencilEdit02Icon;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className={`grid size-8 cursor-pointer place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-90 ${
        danger ? "text-muted active:text-danger" : "text-muted active:text-foreground"
      }`}
    >
      <HugeiconsIcon icon={icon} className="size-[18px]" />
    </button>
  );
}

/** A creator-facing summary of one subscription tier with edit/delete actions. */
export function TierCard({
  tier,
  subscriberCount,
  onEdit,
  onDelete,
}: TierCardProps) {
  const period = BILLING_PERIOD_META[tier.billingPeriod];
  const seats =
    tier.subscriberCap > 0
      ? `${subscriberCount} / ${tier.subscriberCap}`
      : `${subscriberCount}`;

  return (
    <Card>
      <Card.Content className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {tier.name}
            </h3>
            {!tier.visible ? (
              <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted uppercase">
                Hidden
              </span>
            ) : null}
          </div>
          {tier.tagline ? (
            <p className="text-xs text-muted">{tier.tagline}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconAction label="Edit tier" icon={PencilEdit02Icon} onPress={onEdit} />
          <IconAction
            label="Delete tier"
            icon={Delete02Icon}
            danger
            onPress={onDelete}
          />
        </div>
      </div>

      <p>
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {formatPrice(tier.priceCents, tier.currency)}
        </span>
        <span className="text-sm text-muted">{period.suffix}</span>
      </p>

      {tier.introDiscountPercent ? (
        <p className="-mt-2 text-xs font-medium text-accent">
          {tier.introLabel ||
            `${tier.introDiscountPercent}% off the first ${period.noun}`}
        </p>
      ) : null}

      {tier.benefits.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {tier.benefits.slice(0, 4).map((benefit, i) => (
            <li key={`${benefit}-${i}`} className="flex items-center gap-2">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-4 shrink-0 text-accent"
              />
              <span className="text-sm text-foreground">{benefit}</span>
            </li>
          ))}
          {tier.benefits.length > 4 ? (
            <li className="pl-6 text-xs text-muted">
              +{tier.benefits.length - 4} more
            </li>
          ) : null}
        </ul>
      ) : null}

      <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted">
        <HugeiconsIcon icon={UserMultipleIcon} className="size-4" />
        <span>
          {seats} {subscriberCount === 1 && tier.subscriberCap === 0
            ? "subscriber"
            : "subscribers"}
        </span>
        {tier.trialDays > 0 ? (
          <span className="ml-auto">{tier.trialDays}-day trial</span>
        ) : null}
      </div>
      </Card.Content>
    </Card>
  );
}
