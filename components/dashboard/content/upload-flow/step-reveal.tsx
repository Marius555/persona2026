"use client";

import { CheckmarkCircle02Icon, CloudUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "framer-motion";

import type { MediaType } from "@/lib/validation/content";

interface StepRevealProps {
  phase: "uploading" | "revealed";
  progress: number;
  count: number;
  previews: { url: string; mediaType: MediaType }[];
}

export function StepReveal({ phase, progress, count, previews }: StepRevealProps) {
  const reduceMotion = useReducedMotion();
  const pct = Math.round(progress * 100);

  if (phase === "uploading") {
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

  // --- revealed ---
  const shown = previews.slice(0, 8);

  return (
    <div className="flex flex-col items-center gap-5 py-2 text-center">
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
          {count} {count === 1 ? "file" : "files"} uploaded.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {shown.map((item, i) => (
          <motion.div
            key={item.url}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 16, rotate: i % 2 ? 6 : -6, scale: 0.8 }
            }
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            transition={{
              delay: reduceMotion ? 0 : 0.08 * i,
              type: "spring",
              stiffness: 320,
              damping: 22,
            }}
            className="size-16 overflow-hidden rounded-xl border border-border bg-surface-secondary"
          >
            {item.mediaType === "video" ? (
              <video src={item.url} className="size-full object-cover" muted playsInline />
            ) : (
              <span
                className="block size-full bg-cover bg-center"
                style={{ backgroundImage: `url(${item.url})` }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
