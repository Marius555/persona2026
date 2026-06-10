"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Spinner } from "@heroui/react";
import { motion, useReducedMotion } from "framer-motion";

import type { ContentCategory } from "../../content-meta";
import { StepReveal } from "../step-reveal";
import type { MediaPreview } from "../fields/media-files-step";

interface StepPublishingProps {
  category: ContentCategory;
  phase: "publishing" | "done";
  /** Upload progress 0–1 (media batches only). */
  progress: number;
  count: number;
  previews: MediaPreview[];
  /** Human label for the offer being published (non-media). */
  offerLabel: string;
}

/**
 * Terminal step: a progress/spinner state then a celebratory reveal. Media
 * batches reuse the thumbnail reveal; offers get a compact generic confirmation.
 */
export function StepPublishing({
  category,
  phase,
  progress,
  count,
  previews,
  offerLabel,
}: StepPublishingProps) {
  const reduceMotion = useReducedMotion();

  if (category === "media") {
    return (
      <StepReveal
        phase={phase === "publishing" ? "uploading" : "revealed"}
        progress={progress}
        count={count}
        previews={previews}
      />
    );
  }

  // --- offer: publishing then done ---
  if (phase === "publishing") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Spinner size="lg" color="current" className="text-accent" />
        <p className="text-base font-semibold text-foreground">Publishing…</p>
      </div>
    );
  }

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
        <p className="text-sm text-muted">
          Your {offerLabel.toLowerCase()} is ready for the agent to hand out.
        </p>
      </div>
    </div>
  );
}
