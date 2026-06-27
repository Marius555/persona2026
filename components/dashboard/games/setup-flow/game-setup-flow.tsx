"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, toast } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

import { FlowShell } from "@/components/dashboard/content/upload-flow/flow-shell";
import { FlowStepper } from "@/components/dashboard/content/upload-flow/flow-stepper";
import { useOverlayClose } from "@/components/dashboard/content/upload-flow/use-overlay-close";
import type { ContentRarity } from "@/lib/validation/content";
import {
  campaignDateBounds,
  type CollectionOption,
  type DateRange,
} from "../game-meta";
import { StepBasics } from "./steps/step-basics";
import { StepOdds } from "./steps/step-odds";

interface GameSetupFlowProps {
  /** All of the creator's exclusive collections (filtered to non-empty here). */
  exclusiveCollections: CollectionOption[];
  /** All of the creator's Games-tier collections (filtered to non-empty here). */
  gameCollections: CollectionOption[];
  onClose: () => void;
}

/** One step in the setup stepper: a centered title, then its body. */
interface SetupStep {
  id: string;
  title: string;
  subtitle?: string;
  render: () => React.ReactNode;
  /** Sets any field errors and returns false to block Continue. */
  validate: () => boolean;
}

/**
 * The game configuration stepper. A responsive modal (desktop) / bottom-sheet
 * drawer (mobile) that walks the creator through setting up a game, mirroring the
 * add-content wizard's shell, progress dots, and slide/fade step animation.
 *
 * This is Step 1 ("Basics") only — the draft is held client-side; persistence and
 * the later steps land once the full flow is designed.
 */
export function GameSetupFlow({
  exclusiveCollections,
  gameCollections,
  onClose,
}: GameSetupFlowProps) {
  const reduceMotion = useReducedMotion();
  // Keep the overlay mounted long enough to play its slide-out before the parent
  // unmounts us; close() is the single close path for every exit below.
  const { isOpen, close } = useOverlayClose(onClose, reduceMotion ? 0 : 250);

  // Only collections that actually hold content can feed a prize pool.
  const eligibleCollections = useMemo(
    () => exclusiveCollections.filter((c) => c.itemCount > 0),
    [exclusiveCollections],
  );
  const eligibleGameCollections = useMemo(
    () => gameCollections.filter((c) => c.itemCount > 0),
    [gameCollections],
  );

  const [stepIndex, setStepIndex] = useState(0);
  // 1 = moving forward, -1 = moving back. Drives the slide direction.
  const [direction, setDirection] = useState(1);

  // --- step 1 state ---------------------------------------------------------
  const [includeExclusive, setIncludeExclusive] = useState(false);
  const [exclusiveCollectionIds, setExclusiveCollectionIds] = useState<string[]>(
    [],
  );
  const [autoDesignOdds, setAutoDesignOdds] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const [dateError, setDateError] = useState<string>();
  const [collectionError, setCollectionError] = useState<string>();

  // --- step 2 state (manual odds; only shown when auto-design is off) -------
  const [gameCollectionIds, setGameCollectionIds] = useState<string[]>([]);
  const [collectionRarity, setCollectionRarity] = useState<
    Record<string, ContentRarity>
  >({});
  const [oddsError, setOddsError] = useState<string>();

  function changeGameCollections(ids: string[]) {
    setGameCollectionIds(ids);
    // Keep exactly one rarity per selected collection, defaulting new picks to
    // common and dropping entries for collections that were deselected.
    setCollectionRarity((prev) => {
      const next: Record<string, ContentRarity> = {};
      for (const id of ids) next[id] = prev[id] ?? "common";
      return next;
    });
    if (ids.length) setOddsError(undefined);
  }
  function changeRarity(id: string, rarity: ContentRarity) {
    setCollectionRarity((prev) => ({ ...prev, [id]: rarity }));
  }

  function validateOdds(): boolean {
    if (eligibleGameCollections.length > 0 && gameCollectionIds.length === 0) {
      setOddsError("Pick at least one collection.");
      return false;
    }
    return true;
  }

  function toggleIncludeExclusive(next: boolean) {
    setIncludeExclusive(next);
    if (!next) setCollectionError(undefined);
  }
  function changeCollections(ids: string[]) {
    setExclusiveCollectionIds(ids);
    if (ids.length) setCollectionError(undefined);
  }
  function changeDateRange(range: DateRange | null) {
    setDateRange(range);
    if (range?.start && range?.end) setDateError(undefined);
  }

  function validateBasics(): boolean {
    let ok = true;
    if (!dateRange?.start || !dateRange?.end) {
      setDateError("Pick a start and end date.");
      ok = false;
    } else if (dateRange.end.compare(campaignDateBounds().max) > 0) {
      // The calendar blocks clicks past the bound, but typed segments can exceed it.
      setDateError("Keep the campaign within a month from today.");
      ok = false;
    }
    if (
      includeExclusive &&
      eligibleCollections.length > 0 &&
      exclusiveCollectionIds.length === 0
    ) {
      setCollectionError("Pick at least one collection.");
      ok = false;
    }
    return ok;
  }

  const steps: SetupStep[] = [
    {
      id: "basics",
      title: "Set up your game",
      subtitle: "Pick what's at stake and how long the campaign runs.",
      validate: validateBasics,
      render: () => (
        <StepBasics
          exclusiveCollections={eligibleCollections}
          includeExclusive={includeExclusive}
          onIncludeExclusiveChange={toggleIncludeExclusive}
          exclusiveCollectionIds={exclusiveCollectionIds}
          onExclusiveCollectionIdsChange={changeCollections}
          collectionError={collectionError}
          autoDesignOdds={autoDesignOdds}
          onAutoDesignOddsChange={setAutoDesignOdds}
          dateRange={dateRange}
          onDateRangeChange={changeDateRange}
          dateError={dateError}
        />
      ),
    },
  ];

  // Manual mode adds the odds step; auto-design lets the agent handle it.
  if (!autoDesignOdds) {
    steps.push({
      id: "odds",
      title: "Set the odds",
      subtitle: "Choose which collections fans can win, and how rare each is.",
      validate: validateOdds,
      render: () => (
        <StepOdds
          collections={eligibleGameCollections}
          selectedIds={gameCollectionIds}
          onSelectedIdsChange={changeGameCollections}
          rarityById={collectionRarity}
          onRarityChange={changeRarity}
          error={oddsError}
        />
      ),
    });
  }

  const safeIndex = Math.min(stepIndex, steps.length - 1);
  const currentStep = steps[safeIndex];
  const isLast = safeIndex === steps.length - 1;

  function handleComplete() {
    // The draft lives only client-side for now — persistence + the remaining
    // steps are wired once the full stepper is designed.
    toast.success("Game basics saved — more steps coming soon.");
    close();
  }

  function goNext() {
    if (!currentStep.validate()) return;
    setDirection(1);
    if (isLast) {
      handleComplete();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    setDirection(-1);
    if (safeIndex === 0) {
      close();
      return;
    }
    setStepIndex((i) => i - 1);
  }

  // Directional slide + fade, matching the add-content wizard.
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
      ariaLabel="Set up a game"
      isDismissable
      isOpen={isOpen}
      onDismiss={close}
    >
      <div className="flex min-h-0 flex-col">
        <FlowStepper
          stepIndex={safeIndex}
          totalSteps={steps.length}
          canClose
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
                <StepHeader
                  title={currentStep.title}
                  subtitle={currentStep.subtitle}
                />
                {currentStep.render()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 border-t border-border px-6 pb-6 pt-4 sm:px-8">
          <Button variant="ghost" className="cursor-pointer" onPress={goBack}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            {safeIndex === 0 ? "Cancel" : "Back"}
          </Button>
          <Button className="ml-auto cursor-pointer" onPress={goNext}>
            Continue
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Button>
        </div>
      </div>
    </FlowShell>
  );
}

/** The centered title (+ optional subtitle) that opens every step. */
function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="flex flex-col items-center gap-1.5 text-center">
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto text-sm leading-relaxed text-muted">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
