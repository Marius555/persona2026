"use client";

import { PlusSignIcon, SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, InputGroup, TextField } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { BENEFIT_PRESETS } from "../../subscription-meta";

interface BenefitsListFieldProps {
  benefits: string[];
  onChange: (benefits: string[]) => void;
}

const MAX_BENEFITS = 20;
const MAX_LENGTH = 120;

/**
 * Perks picked as toggle chips: tap a preset (or a previously-added custom one)
 * to check or uncheck it. The trailing "Custom" chip reveals an inline input —
 * with a submit button inside the field — to add your own; submitting keeps the
 * input open so several can be added in a row. Duplicates and blanks are ignored
 * and the list is capped so a tier stays scannable.
 */
export function BenefitsListField({
  benefits,
  onChange,
}: BenefitsListFieldProps) {
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const atCap = benefits.length >= MAX_BENEFITS;

  const isChecked = (label: string) =>
    benefits.some((b) => b.toLowerCase() === label.toLowerCase());

  function toggle(label: string) {
    if (isChecked(label)) {
      onChange(benefits.filter((b) => b.toLowerCase() !== label.toLowerCase()));
      return;
    }
    if (atCap) return;
    onChange([...benefits, label]);
  }

  function submitCustom() {
    const value = draft.trim().slice(0, MAX_LENGTH);
    if (!value || atCap) return;
    if (!isChecked(value)) onChange([...benefits, value]);
    setDraft("");
  }

  // The chip set is the presets plus any custom perks already chosen, so edits
  // round-trip and a custom add appears as a checked chip immediately.
  const presetLower = new Set(BENEFIT_PRESETS.map((p) => p.toLowerCase()));
  const customBenefits = benefits.filter(
    (b) => !presetLower.has(b.toLowerCase()),
  );
  const chips = [...BENEFIT_PRESETS, ...customBenefits];

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((label) => {
          const checked = isChecked(label);
          return (
            <button
              key={label}
              type="button"
              aria-pressed={checked}
              disabled={atCap && !checked}
              onClick={() => toggle(label)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                checked
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface-secondary/40 text-muted"
              }`}
            >
              {label}
            </button>
          );
        })}

        {/* Trailing chip — reveals the custom-perk input. */}
        <button
          type="button"
          aria-pressed={showCustom}
          aria-expanded={showCustom}
          onClick={() => setShowCustom((v) => !v)}
          className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-95 ${
            showCustom
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-surface-secondary/40 text-muted"
          }`}
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          Custom
        </button>
      </div>

      {/* Custom-perk input — submit button sits inside the field. */}
      <AnimatePresence initial={false}>
        {showCustom ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <div className="px-1 pt-2 pb-1">
              <TextField
                fullWidth
                variant="secondary"
                value={draft}
                onChange={setDraft}
                isDisabled={atCap}
                className="text-left"
                aria-label="Add a custom perk"
              >
                <InputGroup>
                  <InputGroup.Input
                    placeholder={
                      atCap ? "Perk limit reached" : "Add a custom perk…"
                    }
                    maxLength={MAX_LENGTH}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitCustom();
                      }
                    }}
                  />
                  <InputGroup.Suffix className="pr-0">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label="Add perk"
                      isDisabled={!draft.trim() || atCap}
                      onPress={submitCustom}
                    >
                      <HugeiconsIcon icon={SentIcon} className="size-4" />
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
