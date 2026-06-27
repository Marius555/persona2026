"use client";

import type { TierDraft } from "../../subscription-meta";
import { BenefitsListField } from "../fields/benefits-list-field";

interface StepPerksProps {
  draft: TierDraft;
  onChange: (patch: Partial<TierDraft>) => void;
}

/** Step 4: the perk bullets, picked as chips. */
export function StepPerks({ draft, onChange }: StepPerksProps) {
  return (
    <div className="flex flex-col gap-5 text-left">
      <BenefitsListField
        benefits={draft.benefits}
        onChange={(benefits) => onChange({ benefits })}
      />
    </div>
  );
}
