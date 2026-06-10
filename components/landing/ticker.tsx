import { Chip } from "@heroui/react";

import { TICKER_ITEMS } from "@/components/landing/data";

export function Ticker() {
  return (
    <div className="border-y border-border bg-surface/40 px-6 py-5 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2.5">
        {TICKER_ITEMS.map((item) => (
          <Chip key={item} variant="soft" color="default" size="sm" className="rounded-full">
            {item}
          </Chip>
        ))}
      </div>
    </div>
  );
}
