"use client";

import { Diamond02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  CONTENT_RARITIES,
  type ContentRarity,
} from "@/lib/validation/content";

interface RarityStepProps {
  rarity: ContentRarity;
  onChange: (rarity: ContentRarity) => void;
}

/** Per-rarity color treatment so the four tiers read as distinct prizes. */
const RARITY_META: Record<
  ContentRarity,
  { icon: string; active: string }
> = {
  common: {
    icon: "text-slate-500 dark:text-slate-400",
    active:
      "border-slate-400 bg-slate-400/10 ring-1 ring-slate-400/60 text-slate-700 dark:text-slate-200",
  },
  rare: {
    icon: "text-blue-500",
    active:
      "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/60 text-blue-600 dark:text-blue-300",
  },
  epic: {
    icon: "text-purple-500",
    active:
      "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/60 text-purple-600 dark:text-purple-300",
  },
  legendary: {
    icon: "text-amber-500",
    active:
      "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/60 text-amber-600 dark:text-amber-300",
  },
};

/** Pick a loot rarity — a tinted gem card per tier. */
export function RarityStep({ rarity, onChange }: RarityStepProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 text-left sm:grid-cols-4">
      {CONTENT_RARITIES.map((r) => {
        const meta = RARITY_META[r];
        const active = rarity === r;
        return (
          <button
            key={r}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(r)}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border px-2 py-3.5 text-center text-xs font-semibold capitalize shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97] ${
              active
                ? meta.active
                : "border-border bg-gradient-to-b from-surface-secondary/60 to-surface-secondary/30 text-muted"
            }`}
          >
            <HugeiconsIcon
              icon={Diamond02Icon}
              className={`size-6 transition-colors ${
                active ? meta.icon : "text-muted/60"
              }`}
            />
            {r}
          </button>
        );
      })}
    </div>
  );
}
