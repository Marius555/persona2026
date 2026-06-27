"use client";

import { BILLING_PERIOD_META } from "../../subscription-meta";
import { BILLING_PERIODS, type BillingPeriod } from "@/lib/validation/subscription";

interface BillingPeriodPickerProps {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
}

/** Pick how often the subscription recurs — compact selectable pill chips. */
export function BillingPeriodPicker({
  value,
  onChange,
}: BillingPeriodPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {BILLING_PERIODS.map((period) => {
        const active = value === period;
        const meta = BILLING_PERIOD_META[period];
        return (
          <button
            key={period}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(period)}
            className={`w-full cursor-pointer justify-center rounded-full border px-3 py-1.5 text-center text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus active:scale-95 ${
              active
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface-secondary/40 text-muted"
            }`}
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
