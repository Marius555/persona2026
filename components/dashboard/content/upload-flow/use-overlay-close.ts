"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives an overlay's slide-out when its parent mounts it conditionally.
 *
 * A `{open ? <Flow/> : null}` parent unmounts the overlay the instant it closes,
 * which cuts HeroUI's exit animation — the panel just vanishes. This keeps an
 * internal `isOpen` (true on mount, so the enter animation still plays) that
 * flips to false on close so HeroUI plays the slide-out, then defers the parent's
 * unmount (`onClose`) until that animation has finished.
 *
 * Pass `durationMs: 0` under reduced motion so the unmount isn't needlessly held.
 */
export function useOverlayClose(onClose: () => void, durationMs = 250) {
  const [isOpen, setIsOpen] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear a pending unmount if the component goes away for any other reason.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const close = useCallback(() => {
    if (timer.current) return; // already animating closed
    setIsOpen(false);
    timer.current = setTimeout(onClose, durationMs);
  }, [onClose, durationMs]);

  return { isOpen, close };
}
