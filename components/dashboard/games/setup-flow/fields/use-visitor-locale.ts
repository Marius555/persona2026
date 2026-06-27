"use client";

import { useSyncExternalStore } from "react";

import { FALLBACK_LOCALE, resolveLocale } from "@/lib/i18n/resolve-locale";

const emptySubscribe = () => () => {};

/**
 * The visitor's locale ("lt-LT", "en-US", …), inferred from their region (see
 * `resolveLocale`). The server can't predict it, so we return the stable
 * `FALLBACK_LOCALE` on the server and first client paint, then the resolved locale after
 * mount. `useSyncExternalStore` keeps it hydration-safe without a setState-in-effect —
 * it drives the date picker's I18nProvider so dates format in the viewer's own region.
 */
export function useVisitorLocale(): string {
  return useSyncExternalStore(emptySubscribe, resolveLocale, () => FALLBACK_LOCALE);
}
