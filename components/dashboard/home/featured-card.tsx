"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button, Card } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

const FEATURED = [
  { label: "Featured", title: "Grow your audience with smarter offers" },
  { label: "Featured", title: "Turn your content vault into revenue" },
  { label: "Featured", title: "Let your persona work while you rest" },
];

/**
 * Dark, always-on-theme spotlight card with a small carousel. Sits beside the
 * welcome banner in the hero row. Content is static placeholder for now.
 */
export function FeaturedCard({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const item = FEATURED[index];

  function step(delta: number) {
    setIndex((i) => (i + delta + FEATURED.length) % FEATURED.length);
  }

  return (
    <Card
      className={`relative isolate min-h-[180px] overflow-hidden border-0 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(135deg, oklch(28% 0.08 273.85), oklch(18% 0.05 273.85) 55%, oklch(40% 0.16 300))",
      }}
    >
      <Card.Content className="flex h-full flex-col justify-end gap-2 p-6">
        <span className="text-xs font-semibold tracking-wide text-white/60 uppercase">
          {item.label}
        </span>
        <h3 className="max-w-[85%] text-lg font-semibold text-white">
          {item.title}
        </h3>
      </Card.Content>

      <div className="absolute top-4 right-4 flex items-center gap-1">
        <Button
          isIconOnly
          size="sm"
          variant="tertiary"
          aria-label="Previous"
          onPress={() => step(-1)}
          className="!bg-transparent text-white/80 [--button-bg-hover:transparent] [--button-bg:transparent]"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="tertiary"
          aria-label="Next"
          onPress={() => step(1)}
          className="!bg-transparent text-white/80 [--button-bg-hover:transparent] [--button-bg:transparent]"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </Button>
      </div>
    </Card>
  );
}
