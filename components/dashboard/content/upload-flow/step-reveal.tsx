"use client";

import { CloudUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "framer-motion";

interface StepRevealProps {
  /** Upload progress 0–1. */
  progress: number;
  count: number;
}

/** The media batch upload progress view (spinner ring + animated bar). */
export function StepReveal({ progress, count }: StepRevealProps) {
  const reduceMotion = useReducedMotion();
  const pct = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="relative grid size-24 place-items-center">
        {!reduceMotion ? (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-accent/30 border-t-accent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : null}
        <motion.span
          className="grid size-16 place-items-center rounded-2xl bg-accent/12 text-accent"
          animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <HugeiconsIcon icon={CloudUploadIcon} className="size-7" />
        </motion.span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-foreground">Uploading…</p>
        <p className="text-sm text-muted">
          {count} {count === 1 ? "file" : "files"}
        </p>
      </div>

      <div className="w-full max-w-xs">
        <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${Math.max(8, pct)}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </div>
        <p className="mt-1.5 text-right font-mono text-xs text-muted">{pct}%</p>
      </div>
    </div>
  );
}
