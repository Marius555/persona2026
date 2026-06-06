"use client";

import type { Niche } from "@/lib/validation/onboarding";
import { NicheGrid } from "../niche-grid";

export function StepNiche({
  value,
  onChange,
}: {
  value: Niche | null;
  onChange: (niche: Niche) => void;
}) {
  return (
    <div className="flex flex-col gap-5 text-left">
      <NicheGrid value={value} onChange={onChange} />
    </div>
  );
}
