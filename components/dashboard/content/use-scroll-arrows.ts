"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

interface Overflow {
  left: boolean;
  right: boolean;
}

/**
 * Tracks horizontal overflow of a scroller so left/right arrows can show only
 * when there's more content off-screen. Attach `scrollerRef` to the
 * `overflow-x-auto` element and (optionally) `contentRef` to its inner track;
 * `scrollByDir` nudges the scroller one viewport-ish step in the given
 * direction. Pass `revalidate` (e.g. the item count) when the scroller is also
 * its own content track, so overflow is re-measured as items are added/removed.
 */
export function useScrollArrows(revalidate?: unknown) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<Overflow>({
    left: false,
    right: false,
  });

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Measure the real extent of the in-flow children rather than `scrollWidth`:
    // an absolutely-positioned overlay (e.g. the HeroUI tabs selection indicator)
    // inflates `scrollWidth` and can leave a phantom right arrow that only clears
    // on reload. Bounding rects relative to the scroller ignore such overlays.
    const elRect = el.getBoundingClientRect();
    let maxRight = elRect.left;
    for (const child of Array.from(el.children) as HTMLElement[]) {
      if (getComputedStyle(child).position === "absolute") continue;
      maxRight = Math.max(maxRight, child.getBoundingClientRect().right);
    }
    const left = el.scrollLeft > 1;
    const right = maxRight > elRect.left + el.clientWidth + 1;
    setOverflow((prev) =>
      prev.left === left && prev.right === right ? prev : { left, right },
    );
  }, []);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    const content = contentRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    // Re-measure once any tab transition settles (transitions bubble to the
    // scroller), so layout changes from switching tabs are picked up.
    el.addEventListener("transitionend", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (content) ro.observe(content);
    return () => {
      el.removeEventListener("scroll", measure);
      el.removeEventListener("transitionend", measure);
      ro.disconnect();
    };
  }, [measure]);

  // Re-measure when the tracked value changes — covers scrollers that are also
  // their own content track, where the ResizeObserver won't fire on overflow.
  // A content swap (e.g. switching tabs to a different set) shouldn't inherit the
  // previous scroll position, so reset it first; the extra rAF catches a
  // post-layout settle even when no transition fires.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollLeft = 0;
    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [measure, revalidate]);

  const scrollByDir = useCallback((dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  return { scrollerRef, contentRef, overflow, scrollByDir };
}
