"use client";

import {
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
    value: "exclusive" as const,
    label: "Exclusive",
    blurb: "Fans pay tokens to unlock it.",
    icon: SquareLock02Icon,
    iconClass: "bg-accent/12 text-accent",
    activeClass: "border-accent bg-accent/5",
  },
  {
    value: "gamble" as const,
    label: "Game drop",
    blurb: "Fans win it from a loot box or wheel.",
    icon: GameController01Icon,
    iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    activeClass: "border-amber-500 bg-amber-500/5",
  },
];

/** Choose how fans get the content — two compact, side-by-side cards. */
export function TierStep({ tier, onChange }: TierStepProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 text-left">
      {TIER_OPTIONS.map((opt) => {
        const active = tier === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`flex cursor-pointer flex-col gap-2.5 rounded-2xl border p-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus ${
              active
                ? opt.activeClass
                : "border-border bg-surface-secondary/40 hover:border-foreground/20"
            }`}
          >
            <span
              className={`grid size-9 place-items-center rounded-xl ${opt.iconClass}`}
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
