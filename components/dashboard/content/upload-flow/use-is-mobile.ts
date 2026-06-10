"use client";

import { useEffect, useState } from "react";

/** Tailwind's `sm` breakpoint — below this we treat the viewport as mobile. */
const MOBILE_QUERY = "(max-width: 639px)";

/**
 * True when the viewport is below the `sm` breakpoint. Consumers (the upload
 * wizard) only mount on a user click, so the lazy initializer reads the real
 * viewport and there is no SSR hydration flicker. The `change` listener writes
 * state from an event handler — never during render — per the React 19 hooks
 * lint rules.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
