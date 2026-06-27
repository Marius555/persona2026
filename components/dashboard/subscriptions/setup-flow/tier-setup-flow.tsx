"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Spinner, toast } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { FlowShell } from "@/components/dashboard/content/upload-flow/flow-shell";
import { FlowStepper } from "@/components/dashboard/content/upload-flow/flow-stepper";
import { useOverlayClose } from "@/components/dashboard/content/upload-flow/use-overlay-close";
import type { CollectionOption } from "@/components/dashboard/games/game-meta";
import {
  draftFromTier,
  emptyTierDraft,
  toTier,
  toTierPayload,
  type RawTier,
  type Tier,
  type TierDraft,
} from "../subscription-meta";
import { StepExtras } from "./steps/step-extras";
import { StepIdentity } from "./steps/step-identity";
import { StepIncluded } from "./steps/step-included";
import { StepPerks } from "./steps/step-perks";
import { StepPricing } from "./steps/step-pricing";
import { StepReview } from "./steps/step-review";

interface TierSetupFlowProps {
  /** Collections (with content) the creator can gate behind a tier. */
  collections: CollectionOption[];
  /** When set, the flow edits this tier instead of creating a new one. */
  initialTier?: Tier | null;
  onSaved: (tier: Tier) => void;
  onClose: () => void;
}

interface SetupStep {
  id: string;
  title: string;
  subtitle?: string;
  render: () => React.ReactNode;
  /** Sets any field errors and returns false to block Continue. */
  validate?: () => boolean;
}

/**
 * The subscription-tier configuration stepper. A responsive modal (desktop) /
 * bottom-sheet drawer (mobile) mirroring the add-content and game-setup wizards:
 * the same shell, progress dots, and directional slide/fade. Holds the draft
 * client-side and persists it on the final step (create → POST, edit → PATCH).
 */
export function TierSetupFlow({
  collections,
  initialTier,
  onSaved,
  onClose,
}: TierSetupFlowProps) {
  const reduceMotion = useReducedMotion();
  const { isOpen, close } = useOverlayClose(onClose, reduceMotion ? 0 : 250);

  const [draft, setDraft] = useState<TierDraft>(() =>
    initialTier ? draftFromTier(initialTier) : emptyTierDraft(),
  );
  const update = (patch: Partial<TierDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  const [nameError, setNameError] = useState<string>();
  const [includedError, setIncludedError] = useState<string>();

  function validateIdentity(): boolean {
    if (!draft.name.trim()) {
      setNameError("Name your tier");
      return false;
    }
    setNameError(undefined);
    return true;
  }

  const grantsSomething =
    draft.unlocksAllExclusive ||
    draft.includedCollectionIds.length > 0 ||
    draft.benefits.length > 0;

  const steps: SetupStep[] = useMemo(
    () => [
      {
        id: "identity",
        title: initialTier ? "Edit tier" : "Name your tier",
        subtitle: "What fans see at the top of the pricing card.",
        validate: validateIdentity,
        render: () => (
          <StepIdentity draft={draft} onChange={update} nameError={nameError} />
        ),
      },
      {
        id: "pricing",
        title: "Set the price",
        subtitle: "How much, in what currency, and how often it recurs.",
        render: () => <StepPricing draft={draft} onChange={update} />,
      },
      {
        id: "included",
        title: "What's included",
        subtitle: "Choose the content subscribing unlocks.",
        render: () => (
          <StepIncluded
            draft={draft}
            onChange={update}
            collections={collections}
            error={includedError}
          />
        ),
      },
      {
        id: "perks",
        title: "Add the perks",
        subtitle: "The bullet points that sell the tier.",
        render: () => <StepPerks draft={draft} onChange={update} />,
      },
      {
        id: "extras",
        title: "Sweeten the deal",
        subtitle: "Optional scarcity.",
        render: () => <StepExtras draft={draft} onChange={update} />,
      },
      {
        id: "review",
        title: "Review & publish",
        subtitle: "One last look before it goes live.",
        render: () => <StepReview draft={draft} collections={collections} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft, nameError, includedError, collections, initialTier],
  );

  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  async function handlePublish() {
    if (!grantsSomething) {
      setIncludedError(
        "Add a collection, a perk, or unlock all exclusive content.",
      );
      // Send them back to the "What's included" step to fix it.
      setDirection(-1);
      setStepIndex(2);
      return;
    }

    setSaving(true);
    try {
      const url = initialTier
        ? `/api/subscriptions/tiers/${initialTier.id}`
        : "/api/subscriptions/tiers";
      const res = await fetch(url, {
        method: initialTier ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toTierPayload(draft)),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          fieldErrors?: Record<string, string>;
          error?: string;
        };
        const firstFieldError = data.fieldErrors
          ? Object.values(data.fieldErrors)[0]
          : undefined;
        throw new Error(firstFieldError || data.error || "Couldn't save tier");
      }
      const { tier } = (await res.json()) as { tier: RawTier };
      toast.success(initialTier ? "Tier updated" : "Tier published");
      onSaved(toTier(tier));
      close();
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Couldn't save tier");
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (currentStep.validate && !currentStep.validate()) return;
    if (isLast) {
      void handlePublish();
      return;
    }
    setDirection(1);
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (saving) return;
    setDirection(-1);
    if (stepIndex === 0) {
      close();
      return;
    }
    setStepIndex((i) => i - 1);
  }

  const offset = reduceMotion ? 0 : 32;
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? offset : -offset, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -offset : offset, opacity: 0 }),
  };
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <FlowShell
      ariaLabel={initialTier ? "Edit subscription tier" : "Create a subscription tier"}
      isDismissable={!saving}
      isOpen={isOpen}
      onDismiss={close}
    >
      <div className="flex min-h-0 flex-col">
        <FlowStepper
          stepIndex={stepIndex}
          totalSteps={steps.length}
          canClose={!saving}
          onClose={close}
        />

        <div className="relative h-[min(72vh,520px)] overflow-hidden sm:h-[460px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentStep.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="scrollbar-hide absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden px-6 pt-3 pb-5 sm:px-8"
            >
              <div className="my-auto flex w-full flex-col gap-6">
                <header className="flex flex-col items-center gap-1.5 text-center">
                  <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {currentStep.title}
                  </h2>
                  {currentStep.subtitle ? (
                    <p className="mx-auto text-sm leading-relaxed text-muted">
                      {currentStep.subtitle}
                    </p>
                  ) : null}
                </header>
                {currentStep.render()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 border-t border-border px-6 pb-6 pt-4 sm:px-8">
          <Button
            variant="ghost"
            className="cursor-pointer"
            isDisabled={saving}
            onPress={goBack}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            {stepIndex === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            className="ml-auto cursor-pointer"
            isPending={saving}
            onPress={goNext}
          >
            {saving ? (
              <Spinner size="sm" color="current" />
            ) : isLast ? (
              initialTier ? (
                "Save changes"
              ) : (
                "Publish tier"
              )
            ) : (
              <>
                Continue
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </FlowShell>
  );
}
