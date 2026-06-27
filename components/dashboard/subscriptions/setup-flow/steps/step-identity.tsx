"use client";

import { TextFieldStep } from "@/components/dashboard/content/upload-flow/fields/text-field-step";
import type { TierDraft } from "../../subscription-meta";

interface StepIdentityProps {
  draft: TierDraft;
  onChange: (patch: Partial<TierDraft>) => void;
  nameError?: string;
}

/** Step 1: what the tier is called. */
export function StepIdentity({ draft, onChange, nameError }: StepIdentityProps) {
  return (
    <div className="flex flex-col gap-5">
      <TextFieldStep
        ariaLabel="Tier name"
        value={draft.name}
        onChange={(name) => onChange({ name })}
        placeholder="e.g. VIP"
        error={nameError}
        autoFocus
      />
    </div>
  );
}
