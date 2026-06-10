"use client";

import { TextArea } from "@heroui/react";

interface TextAreaStepProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoFocus?: boolean;
}

/** A single labelled multi-line input — one field, one step. */
export function TextAreaStep({
  label,
  value,
  onChange,
  placeholder,
  error,
  autoFocus,
}: TextAreaStepProps) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <TextArea
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-h-28 w-full"
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
