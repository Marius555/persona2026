"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface FlowStepperProps {
  /** 0-based index of the current step (ignored when totalSteps is 0). */
  stepIndex: number;
  /** How many progress dots to draw. 0 hides the dots (e.g. the chooser). */
  totalSteps: number;
  /** Allow closing the whole flow (disabled while publishing). */
  canClose: boolean;
  onClose: () => void;
}

/** A thin top bar: centered progress dots + a close button. No back arrow. */
export function FlowStepper({
  stepIndex,
  totalSteps,
  canClose,
  onClose,
}: FlowStepperProps) {
  return (
    <div className="relative flex items-center justify-center px-3 py-3">
      {totalSteps > 0 ? (
        <div className="flex items-center gap-1.5" aria-hidden>
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? "w-5 bg-accent"
                  : i < stepIndex
                    ? "w-1.5 bg-accent/40"
                    : "w-1.5 bg-surface-tertiary"
              }`}
            />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Close"
        disabled={!canClose}
        onClick={() => (canClose ? onClose() : undefined)}
        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-surface-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-[18px]" />
      </button>
    </div>
  );
}
