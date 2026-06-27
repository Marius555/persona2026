"use client";

import { Description, Label, NumberField, Switch } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { TierDraft } from "../../subscription-meta";
import { SettingCard } from "../fields/setting-card";

interface StepExtrasProps {
  draft: TierDraft;
  onChange: (patch: Partial<TierDraft>) => void;
}

const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto" as const, opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

/** Step 5: optional scarcity and visibility — subscriber cap and draft state. */
export function StepExtras({ draft, onChange }: StepExtrasProps) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="flex flex-col gap-3 text-left">
      {/* Subscriber cap. */}
      <SettingCard>
        <Switch
          isSelected={draft.subscriberCap > 0}
          onChange={(on) => onChange({ subscriberCap: on ? 100 : 0 })}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label className="text-sm font-semibold text-foreground">
              Limit subscribers
            </Label>
            <Description>Cap the seats to make the tier feel scarce.</Description>
          </Switch.Content>
        </Switch>
        <AnimatePresence initial={false}>
          {draft.subscriberCap > 0 ? (
            <motion.div {...collapse} transition={transition} className="overflow-hidden">
              <div className="px-1 pt-4 pb-1">
                <NumberField
                  variant="secondary"
                  value={draft.subscriberCap}
                  onChange={(v) =>
                    onChange({ subscriberCap: Number.isFinite(v) ? v : 1 })
                  }
                  minValue={1}
                  maxValue={1_000_000}
                  step={10}
                  className="w-full text-left"
                >
                  <Label>Max subscribers</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input className="text-center" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </SettingCard>
    </div>
  );
}
