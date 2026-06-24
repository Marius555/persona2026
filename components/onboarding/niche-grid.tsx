"use client";

import {
  DiamondIcon,
  Dumbbell01Icon,
  FavouriteIcon,
  MaskIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { Niche } from "@/lib/validation/onboarding";

const NICHE_OPTIONS: {
  value: Niche;
  label: string;
  icon: typeof DiamondIcon;
  tone: string;
}[] = [
  { value: "glamour", label: "Glamour", icon: DiamondIcon, tone: "flirty, high-glam hype" },
  { value: "fitness", label: "Fitness", icon: Dumbbell01Icon, tone: "energetic, motivational coaching" },
  { value: "cosplay", label: "Cosplay", icon: MaskIcon, tone: "playful, character-driven roleplay" },
  { value: "sensual", label: "Sensual", icon: FavouriteIcon, tone: "intimate, slow-burn teasing" },
];

/** 1-click niche grid. Selecting a niche tunes the AI mascot's default tone. */
export function NicheGrid({
  value,
  onChange,
}: {
  value: Niche | null;
  onChange: (niche: Niche) => void;
}) {
  const selected = NICHE_OPTIONS.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        {NICHE_OPTIONS.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={[
                "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 transition-colors duration-200 outline-none",
                "focus-visible:ring-2 focus-visible:ring-focus",
                isSelected
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-surface-secondary/40 text-muted hover:border-accent/50 hover:text-foreground",
              ].join(" ")}
            >
              <HugeiconsIcon
                icon={option.icon}
                className={isSelected ? "size-6 text-accent" : "size-6"}
              />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
      {/* Always reserve two lines so picking a niche never shifts the layout
          (the longest tone wraps to two lines on narrow screens). */}
      <p className="min-h-[2.25rem] text-xs text-muted">
        {selected ? (
          <>
            Your mascot will lean{" "}
            <span className="text-foreground">{selected.tone}</span>.
          </>
        ) : null}
      </p>
    </div>
  );
}
