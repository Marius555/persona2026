"use client";

import { Description, Label, NumberField } from "@heroui/react";

interface NumberFieldStepProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  description?: string;
}

/** A single number stepper — one field, one step. Centered, fits any width. */
export function NumberFieldStep({
  label,
  value,
  onChange,
  minValue,
  maxValue,
  step,
  description,
}: NumberFieldStepProps) {
  return (
    <NumberField
      value={value}
      onChange={(v) => onChange(Number.isFinite(v) ? v : 0)}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      className="mx-auto w-full max-w-[320px] text-left"
    >
      <Label>{label}</Label>
      <NumberField.Group>
        <NumberField.DecrementButton />
        <NumberField.Input className="text-center" />
        <NumberField.IncrementButton />
      </NumberField.Group>
      {description ? <Description>{description}</Description> : null}
    </NumberField>
  );
}
