"use client";

import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  GiftIcon,
  SquareUnlock02Icon,
  UserMultiple02Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import type { CollectionOption } from "@/components/dashboard/games/game-meta";
import {
  BILLING_PERIOD_META,
  formatPrice,
  type TierDraft,
} from "../../subscription-meta";

interface StepReviewProps {
  draft: TierDraft;
  collections: CollectionOption[];
}

/** A compact, display-only summary pill: an icon plus a short label. */
function MetaPill({
  icon,
  children,
}: {
  icon: IconSvgElement;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-secondary/40 px-2.5 py-1 text-xs font-medium text-foreground">
      <HugeiconsIcon icon={icon} className="size-3.5 shrink-0 text-muted" />
      {children}
    </span>
  );
}

/** Step 6: a read-only recap of the draft, shown as a single preview card. */
export function StepReview({ draft, collections }: StepReviewProps) {
  const period = BILLING_PERIOD_META[draft.billingPeriod];
  const includedCount = draft.includedCollectionIds.filter((id) =>
    collections.some((c) => c.id === id),
  ).length;

  const unlocks = draft.unlocksAllExclusive
    ? "All exclusive content"
    : includedCount > 0
      ? `${includedCount} collection${includedCount === 1 ? "" : "s"}`
      : "Perks only";

  return (
    <div className="overflow-hidden rounded-2xl border border-border text-left">
      {/* Header band — name, tagline, and headline price. */}
      <div className="border-b border-border bg-accent/8 px-5 py-6 text-center">
        <p className="text-xl font-bold tracking-tight text-foreground">
          {draft.name.trim() || "Untitled tier"}
        </p>
        {draft.tagline.trim() ? (
          <p className="mt-1 text-sm text-muted">{draft.tagline.trim()}</p>
        ) : null}
        <p className="mt-3">
          <span className="text-4xl font-bold tracking-tight text-foreground">
            {formatPrice(draft.priceCents, draft.currency)}
          </span>
          <span className="text-sm text-muted">{period.suffix}</span>
        </p>
        {draft.introDiscountPercent > 0 ? (
          <p className="mt-1.5 text-xs font-medium text-accent">
            {draft.introLabel.trim() ||
              `${draft.introDiscountPercent}% off the first ${period.noun}`}
          </p>
        ) : null}
      </div>

      {/* Body — the selected options as pills, then the perks checklist. */}
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap justify-center gap-1.5">
          <MetaPill icon={Calendar03Icon}>{period.label}</MetaPill>
          <MetaPill icon={SquareUnlock02Icon}>{unlocks}</MetaPill>
          {draft.trialDays > 0 ? (
            <MetaPill icon={GiftIcon}>{`${draft.trialDays}-day trial`}</MetaPill>
          ) : null}
          {draft.subscriberCap > 0 ? (
            <MetaPill icon={UserMultiple02Icon}>
              {`${draft.subscriberCap} seats`}
            </MetaPill>
          ) : null}
          <MetaPill icon={draft.visible ? ViewIcon : ViewOffIcon}>
            {draft.visible ? "Visible" : "Hidden draft"}
          </MetaPill>
        </div>

        {draft.benefits.length > 0 ? (
          <>
            <div className="border-t border-border" />
            <ul className="flex flex-col gap-1.5">
              {draft.benefits.map((benefit, i) => (
                <li
                  key={`${benefit}-${i}`}
                  className="flex items-center gap-2"
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="size-4 shrink-0 text-accent"
                  />
                  <span className="text-sm text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
