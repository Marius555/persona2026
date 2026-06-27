"use client";

import { Label, ListBox, NumberField, Select } from "@heroui/react";

import { CURRENCY_META } from "../../subscription-meta";
import {
  SUBSCRIPTION_CURRENCIES,
  type SubscriptionCurrency,
} from "@/lib/validation/subscription";

interface PriceFieldProps {
  /** Amount in cents (the draft's storage unit). */
  priceCents: number;
  currency: SubscriptionCurrency;
  /** Emits the new amount in cents. */
  onChange: (cents: number) => void;
  /** Emits the newly picked currency. */
  onCurrencyChange: (currency: SubscriptionCurrency) => void;
}

/**
 * The subscription amount, edited in major currency units but stored as integer
 * cents so floats never round badly. The field formats as currency for the chosen
 * code (e.g. "$9.99"); the currency picker sits inline to the right of the amount.
 */
export function PriceField({
  priceCents,
  currency,
  onChange,
  onCurrencyChange,
}: PriceFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <NumberField
        variant="secondary"
        value={priceCents / 100}
        onChange={(v) =>
          onChange(Math.round((Number.isFinite(v) ? v : 0) * 100))
        }
        minValue={0}
        step={1}
        formatOptions={{ style: "currency", currency: currency.toUpperCase() }}
        className="w-full text-left"
      >
        <Label>Price</Label>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input className="text-center" />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>

      <Select
        variant="secondary"
        value={currency}
        onChange={(value) => onCurrencyChange(value as SubscriptionCurrency)}
        className="w-full"
      >
        <Label>Currency</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {SUBSCRIPTION_CURRENCIES.map((code) => (
              <ListBox.Item
                key={code}
                id={code}
                textValue={CURRENCY_META[code].label}
              >
                {CURRENCY_META[code].symbol} {CURRENCY_META[code].label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
