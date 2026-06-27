"use client";

import { Description, FieldError, Input, Label, TextField } from "@heroui/react";

interface TextFieldStepProps {
  /** Visible label; omit for a label-less field (pair with `ariaLabel`). */
  label?: string;
  /** Accessible name when no visible `label` is shown. */
  ariaLabel?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  description?: string;
  error?: string;
  autoFocus?: boolean;
}

/** A single labelled text input — one field, one step. */
export function TextFieldStep({
  label,
  ariaLabel,
  value,
  onChange,
  placeholder,
  description,
  error,
  autoFocus,
}: TextFieldStepProps) {
  return (
    <TextField
      fullWidth
      variant="secondary"
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      className="text-left"
      aria-label={ariaLabel}
    >
      {label ? <Label>{label}</Label> : null}
      <Input placeholder={placeholder} autoFocus={autoFocus} />
      {description ? <Description>{description}</Description> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
