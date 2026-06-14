"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 640px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * True on small (mobile) viewports. Hydration-safe via `useSyncExternalStore`:
 * the server and first client paint assume desktop (false), then it corrects
 * after mount without a setState-in-effect.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
