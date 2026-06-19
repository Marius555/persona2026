"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@heroui/react";

interface ScrollArrowProps {
  /** -1 scrolls left, 1 scrolls right. */
  dir: number;
  onPress: () => void;
  /** Sit in the flow (taking its own space) instead of being pinned to a
   * `relative` scroller's edge. */
  inline?: boolean;
  /** When false the arrow fades out but keeps its space, so toggling it at the
   * scroll start/end doesn't shift the surrounding layout. Defaults to true. */
  visible?: boolean;
}

/**
 * A small circular arrow, shown only when there's more content to scroll toward.
 * By default it's pinned to the left/right edge of a `relative` scroller; pass
 * `inline` to place it in normal flow beside the scroller instead. Keep it
 * mounted and toggle `visible` to fade it in/out without a layout shift.
 */
export function ScrollArrow({
  dir,
  onPress,
  inline,
  visible = true,
}: ScrollArrowProps) {
  const isLeft = dir < 0;
  const position = inline
    ? "shrink-0"
    : `absolute top-1/2 z-10 -translate-y-1/2 ${isLeft ? "left-0" : "right-0"}`;
  return (
    <Button
      isIconOnly
      size="sm"
      variant="secondary"
      aria-label={isLeft ? "Scroll left" : "Scroll right"}
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? undefined : -1}
      onPress={onPress}
      className={`size-7 rounded-full shadow-sm transition-opacity duration-200 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      } ${position}`}
    >
      <HugeiconsIcon
        icon={isLeft ? ArrowLeft01Icon : ArrowRight01Icon}
        className="size-4"
      />
    </Button>
  );
}
