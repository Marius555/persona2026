"use client";

import {
  CheckmarkCircle02Icon,
  GameController01Icon,
  SquareLock02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { ContentTier } from "@/lib/validation/content";

interface TierStepProps {
  tier: ContentTier;
  onChange: (tier: ContentTier) => void;
}

const TIER_OPTIONS = [
  {
    value: "gamble" as const,
    label: "Game drop",
    blurb: "Fans win it from a loot box or wheel.",
    icon: GameController01Icon,
  },
  {
    value: "exclusive" as const,
    label: "Exclusive",
    blurb: "Fans pay tokens to unlock it.",
    icon: SquareLock02Icon,
  },
];

/** Choose how fans get the content — two cohesive, side-by-side cards. */
export function TierStep({ tier, onChange }: TierStepProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-left">
      {TIER_OPTIONS.map((opt) => {
        const active = tier === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 text-left shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98] ${
              active
                ? "border-accent bg-accent/8 ring-1 ring-accent/30"
                : "border-border bg-gradient-to-b from-surface-secondary/60 to-surface-secondary/30"
            }`}
          >
            {active ? (
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="absolute right-3 top-3 size-5 text-accent"
              />
            ) : null}
            <span
              className={`grid size-10 place-items-center rounded-xl transition-colors ${
                active
                  ? "bg-accent/15 text-accent ring-1 ring-inset ring-accent/20"
                  : "bg-surface-tertiary text-muted"
              }`}
            >
              <HugeiconsIcon icon={opt.icon} className="size-5" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                {opt.label}
              </span>
              <span className="text-xs leading-snug text-muted">
                {opt.blurb}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
