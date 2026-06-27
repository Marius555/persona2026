"use client";

import type { TierDraft } from "../../subscription-meta";
import { BillingPeriodPicker } from "../fields/billing-period-picker";
import { PriceField } from "../fields/price-field";

interface StepPricingProps {
  draft: TierDraft;
  onChange: (patch: Partial<TierDraft>) => void;
}

/** Step 2: the recurring price, its currency, and the billing interval. */
export function StepPricing({ draft, onChange }: StepPricingProps) {
  return (
    <div className="flex flex-col gap-5 text-left">
      <PriceField
        priceCents={draft.priceCents}
        currency={draft.currency}
        onChange={(priceCents) => onChange({ priceCents })}
        onCurrencyChange={(currency) => onChange({ currency })}
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          Billing period
        </span>
        <BillingPeriodPicker
          value={draft.billingPeriod}
          onChange={(billingPeriod) => onChange({ billingPeriod })}
        />
      </div>
    </div>
  );
}
