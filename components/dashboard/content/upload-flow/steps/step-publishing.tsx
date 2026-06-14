"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Spinner } from "@heroui/react";
import { motion, useReducedMotion } from "framer-motion";

import type { ContentCategory } from "../../content-meta";
import { StepReveal } from "../step-reveal";

interface StepPublishingProps {
  category: ContentCategory;
  phase: "publishing" | "done";
  /** Upload progress 0–1 (media batches only). */
  progress: number;
  count: number;
  /** Human label for the offer being published (non-media). */
  offerLabel: string;
}

/**
 * Terminal step: an in-progress state (media upload bar / offer spinner) then a
 * single clean confirmation — success icon, title, subtitle — for every category.
 */
export function StepPublishing({
  category,
  phase,
  progress,
  count,
  offerLabel,
}: StepPublishingProps) {
  const reduceMotion = useReducedMotion();

  // --- in-progress ---
  if (phase === "publishing") {
    if (category === "media") {
      return <StepReveal progress={progress} count={count} />;
    }
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Spinner size="lg" color="current" className="text-accent" />
        <p className="text-base font-semibold text-foreground">Publishing…</p>
      </div>
    );
  }

  // --- done: one clean confirmation for every category ---
  const subtitle =
    category === "media"
      ? `${count} ${count === 1 ? "file" : "files"} uploaded.`
      : `Your ${offerLabel.toLowerCase()} is ready for the agent to hand out.`;

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <motion.span
        initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="grid size-14 place-items-center rounded-full bg-success/15 text-success"
      >
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-7" />
      </motion.span>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-foreground">Added to your vault!</h3>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
