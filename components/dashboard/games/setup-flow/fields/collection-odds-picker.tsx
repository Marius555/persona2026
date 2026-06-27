"use client";

import { FolderLibraryIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tooltip } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { CONTENT_RARITIES, type ContentRarity } from "@/lib/validation/content";

import {
  RARITY_ICON,
  RARITY_STYLE,
  RARITY_WIN_CHANCE,
  type CollectionOption,
} from "../../game-meta";

interface CollectionOddsPickerProps {
  /** All eligible Games-tier collections. */
  collections: CollectionOption[];
  /** Currently-selected collection ids (in play). */
  value: string[];
  onChange: (ids: string[]) => void;
  /** Per collection id, its chosen rarity (defaults to common). */
  rarityById: Record<string, ContentRarity>;
  onRarityChange: (id: string, rarity: ContentRarity) => void;
}

/** "12 items" / "1 item". */
function formatItemCount(n: number): string {
  return `${n} ${n === 1 ? "item" : "items"}`;
}

/** ISO → "Jun 2026". */
function formatCreatedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

/**
 * One full-width "radio field" per Games-tier collection, merging selection and
 * rarity into a single tap-through. Tapping a row slides an odds overlay in from
 * the right that covers ~75% of the field — four rarity "bubbles" (win % under
 * each). Picking one slides the overlay back out and leaves the field selected
 * with that rarity. Stays multi-select; the right-hand radio dot deselects an
 * in-play row.
 *
 * Only one overlay is open at a time (`openId`). The overlay is absolutely
 * positioned on top of the row and the row clips it, so it appears to emerge
 * from / retract into the row's right edge.
 */
export function CollectionOddsPicker({
  collections,
  value,
  onChange,
  rarityById,
  onRarityChange,
}: CollectionOddsPickerProps) {
  const reduceMotion = useReducedMotion();
  // Which row's odds overlay is currently sliding open (one at a time).
  const [openId, setOpenId] = useState<string | null>(null);

  const overlayTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const };
  // Springy "pop": the tapped field recedes a touch while the overlay scales
  // up over it, giving the flat slide some depth. Slight overshoot = the pop.
  const popTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 520, damping: 30 };

  function clearAll() {
    setOpenId(null);
    onChange([]);
  }

  function toggleOverlay(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function deselect(id: string) {
    setOpenId(null);
    onChange(value.filter((x) => x !== id));
  }

  /** Picking an odds bubble: apply the rarity, put the row in play, retract. */
  function pickRarity(id: string, rarity: ContentRarity) {
    onRarityChange(id, rarity);
    if (!value.includes(id)) onChange([...value, id]);
    setOpenId(null);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Always mounted (so its row is reserved and the layout never shifts);
          just disabled + faded out until something is in play. */}
      {collections.length > 1 ? (
        <button
          type="button"
          onClick={clearAll}
          disabled={value.length === 0}
          aria-hidden={value.length === 0}
          className={[
            "-mb-0.5 self-end rounded-md text-xs font-medium text-accent outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-focus",
            value.length > 0 ? "cursor-pointer opacity-100" : "opacity-0",
          ].join(" ")}
        >
          Clear all
        </button>
      ) : null}

      {/* The radio fields get their own scroll area (scrollbar hidden) so the
          step card stays a fixed height no matter how many collections exist. */}
      <div className="scrollbar-hide flex max-h-[min(40vh,260px)] flex-col gap-2.5 overflow-y-auto">
      {collections.map((collection) => {
        const selected = value.includes(collection.id);
        const rarity = rarityById[collection.id] ?? "common";
        const open = openId === collection.id;

        return (
          <div
            key={collection.id}
            className="relative flex shrink-0 items-stretch overflow-hidden rounded-2xl"
          >
            {/* The whole row is one toggle: an unselected row opens the odds
                overlay; a selected row deselects (no overlay). The border lives on
                the field (not the container) so the overlay can slide over and
                cover it. */}
            <motion.button
              type="button"
              aria-pressed={selected}
              aria-label={
                selected
                  ? `Remove "${collection.name}" from play`
                  : `Set odds for "${collection.name}"`
              }
              onClick={() =>
                selected ? deselect(collection.id) : toggleOverlay(collection.id)
              }
              animate={{ scale: open ? 0.97 : 1 }}
              transition={popTransition}
              className={[
                "flex min-w-0 flex-1 cursor-pointer items-stretch gap-3 rounded-2xl border p-5 text-left outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-focus",
                selected
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface-secondary/40",
              ].join(" ")}
            >
              <span
                className={[
                  "flex aspect-square shrink-0 items-center justify-center self-stretch rounded-xl border transition-colors",
                  selected
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-border bg-surface text-muted",
                ].join(" ")}
              >
                <HugeiconsIcon icon={FolderLibraryIcon} className="size-5" />
              </span>

              <span className="flex min-w-0 flex-1 flex-col justify-center">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {collection.name}
                  </span>
                  {/* The chosen odds, on the title line in accent text so the
                      creator can see — and recognize when they change — the win
                      rate. Clears with the field / "Clear all". */}
                  {selected ? (
                    <span className="ml-auto shrink-0 text-xs font-semibold text-accent tabular-nums">
                      <span className="capitalize">{rarity}</span> ·{" "}
                      {RARITY_WIN_CHANCE[rarity]}% win
                    </span>
                  ) : null}
                </span>
                <span className="truncate text-xs text-muted">
                  {formatItemCount(collection.itemCount)} ·{" "}
                  {formatCreatedDate(collection.createdAt)}
                </span>
              </span>

              <span
                className={[
                  "flex size-5 shrink-0 items-center justify-center self-center rounded-full border-2 transition-colors",
                  selected ? "border-accent" : "border-border",
                ].join(" ")}
              >
                {selected ? (
                  <span className="size-2 rounded-full bg-accent" />
                ) : null}
              </span>
            </motion.button>

            {/* Odds overlay: a transparent backdrop catches taps on the exposed
                strip to dismiss, while a lifted, brighter panel slides in from the
                right covering ~75% of the row. */}
            <AnimatePresence>
              {open ? (
                <motion.button
                  key="backdrop"
                  type="button"
                  aria-label="Close odds"
                  onClick={() => setOpenId(null)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={overlayTransition}
                  className="absolute inset-0 z-10 cursor-pointer"
                />
              ) : null}
              {open ? (
                <motion.div
                  key="panel"
                  initial={{ x: "100%", scale: 0.9 }}
                  animate={{ x: "0%", scale: 1 }}
                  exit={{ x: "100%", scale: 0.92 }}
                  transition={{ x: overlayTransition, scale: popTransition }}
                  className="absolute inset-y-0 right-0 z-20 flex w-3/4 items-center gap-2 rounded-2xl border border-border bg-overlay px-3 shadow-[-16px_0_32px_-16px_rgba(0,0,0,0.35),-2px_0_6px_-3px_rgba(0,0,0,0.2)]"
                >
                  {/* Column label leading the bubbles. */}
                  <span className="flex shrink-0 flex-col items-center justify-center text-center text-[10px] font-semibold leading-tight text-muted">
                    <span>Win</span>
                    <span>rate</span>
                  </span>

                  {/* Four rarity bubbles flex to fill whatever the label leaves. */}
                  <div className="grid min-w-0 flex-1 grid-cols-4 items-center gap-1.5">
                    {CONTENT_RARITIES.map((r) => {
                      const active = r === rarity;
                      const select = () => pickRarity(collection.id, r);
                      return (
                        <Tooltip key={r} delay={0}>
                          <Tooltip.Trigger
                            aria-label={r}
                            aria-pressed={active}
                            onClick={select}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                select();
                              }
                            }}
                            className={[
                              "mx-auto flex aspect-square w-full max-w-11 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full border outline-none transition-all",
                              "focus-visible:ring-2 focus-visible:ring-focus",
                              active
                                ? `${RARITY_STYLE[r]} shadow-[0_4px_12px_-3px_rgba(0,0,0,0.35)]`
                                : "border-border bg-foreground/[0.04] text-muted shadow-[0_1px_2px_-1px_rgba(0,0,0,0.15)]",
                            ].join(" ")}
                          >
                            <HugeiconsIcon
                              icon={RARITY_ICON[r]}
                              className="size-4"
                            />
                            <span className="text-[10px] font-semibold leading-none tabular-nums">
                              {RARITY_WIN_CHANCE[r]}%
                            </span>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <span className="capitalize">{r}</span> ·{" "}
                            {RARITY_WIN_CHANCE[r]}% win
                          </Tooltip.Content>
                        </Tooltip>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
      </div>
    </div>
  );
}
