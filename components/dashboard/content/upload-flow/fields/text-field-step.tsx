"use client";

import { Description, FieldError, Input, Label, TextField } from "@heroui/react";

interface TextFieldStepProps {
  label: string;
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
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      className="text-left"
    >
      <Label>{label}</Label>
      <Input placeholder={placeholder} autoFocus={autoFocus} />
      {description ? <Description>{description}</Description> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </TextField>
  );
}
