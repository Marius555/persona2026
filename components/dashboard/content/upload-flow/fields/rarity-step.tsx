"use client";

import {
  CONTENT_RARITIES,
  type ContentRarity,
} from "@/lib/validation/content";

interface RarityStepProps {
  rarity: ContentRarity;
  onChange: (rarity: ContentRarity) => void;
}

/** Per-rarity color treatment so the four tiers read as distinct prizes. */
const RARITY_META: Record<ContentRarity, { dot: string; active: string }> = {
  common: {
    dot: "bg-slate-400",
    active:
      "border-slate-400 bg-slate-400/15 text-slate-700 dark:text-slate-300",
  },
  rare: {
    dot: "bg-blue-500",
    active: "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  epic: {
    dot: "bg-purple-500",
    active:
      "border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  legendary: {
    dot: "bg-amber-500",
    active:
      "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
};

/** Pick a loot rarity — colored pills, one per tier. */
export function RarityStep({ rarity, onChange }: RarityStepProps) {
  return (
    <div className="flex flex-col gap-2 text-left">
      <div className="grid grid-cols-4 gap-2">
        {CONTENT_RARITIES.map((r) => {
          const meta = RARITY_META[r];
          const active = rarity === r;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(r)}
              className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-xs font-semibold capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus ${
                active
                  ? meta.active
                  : "border-border bg-surface-secondary/40 text-muted hover:border-foreground/20"
              }`}
            >
              <span className={`size-2 rounded-full ${meta.dot}`} />
              {r}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted">
        Rarer drops appear less often and feel more valuable to fans.
      </p>
    </div>
  );
}
