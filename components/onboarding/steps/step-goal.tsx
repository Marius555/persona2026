"use client";

import {
  CheckmarkCircle01Icon,
  CoinsDollarIcon,
  CrownIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { BotGoal } from "@/lib/validation/onboarding";

const GOAL_OPTIONS: {
  value: BotGoal;
  title: string;
  description: string;
  icon: typeof CrownIcon;
}[] = [
  {
    value: "maximize_tokens",
    title: "Maximize token sales",
    description: "The bot pushes micro-transactions heavily.",
    icon: CoinsDollarIcon,
  },
  {
    value: "drive_subscriptions",
    title: "Drive Fans subscriptions",
    description: "The bot pushes the “Guaranteed 1-of-5 Wheel Event”.",
    icon: CrownIcon,
  },
  {
    value: "warm_fanbase",
    title: "Warm up the fanbase",
    description: "Gives away more free micro-content to build loyalty.",
    icon: UserMultipleIcon,
  },
];

export function StepGoal({
  value,
  onChange,
}: {
  value: BotGoal | null;
  onChange: (goal: BotGoal) => void;
}) {
  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-2.5">
        {GOAL_OPTIONS.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition-colors outline-none",
                "focus-visible:ring-2 focus-visible:ring-focus",
                isSelected
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface-secondary/40 hover:border-accent/50",
              ].join(" ")}
            >
              <span
                className={[
                  "grid size-10 shrink-0 place-items-center rounded-full",
                  isSelected ? "bg-accent/15 text-accent" : "bg-surface-tertiary text-muted",
                ].join(" ")}
              >
                <HugeiconsIcon icon={option.icon} className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {option.title}
                </span>
                <span className="text-xs text-muted">{option.description}</span>
              </span>
              {/* Always reserve the check slot so selecting never shifts layout. */}
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className={[
                  "ml-auto size-5 shrink-0 text-accent transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
