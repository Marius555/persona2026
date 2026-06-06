"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Small step-progress dots. Positioned by the parent (absolutely, in the card's
 * top-right corner). The active step renders as a wider pill; completed steps
 * stay filled.
 */
export function StepProgressBubbles({
  current,
  total,
  className = "",
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === current;
        const isDone = stepNumber < current;
        return (
          <motion.span
            key={stepNumber}
            layout={!reduceMotion}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className={[
              "h-1.5 rounded-full",
              isActive
                ? "w-5 bg-accent"
                : isDone
                  ? "w-1.5 bg-accent/70"
                  : "w-1.5 bg-foreground/20",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
