"use client";

import { Toast } from "@heroui/react";
import { useEffect, useState } from "react";

// Toasts sit bottom-right on tablet/desktop and bottom-center on mobile.
// Tailwind's `sm` breakpoint (640px) is the cutover.
const MOBILE_QUERY = "(max-width: 639px)";

export function ToastProvider() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // HeroUI animates toast add/dismiss through `document.startViewTransition()`.
  // When a second toast update starts before the previous transition finishes
  // (a new toast, an auto-dismiss, or a route change), the browser aborts the
  // in-flight transition and rejects its promise with an InvalidStateError that
  // HeroUI never catches. The DOM update still applies synchronously, so the
  // rejection is purely cosmetic — swallow this exact one so it stops surfacing
  // as a runtime error (everything else propagates untouched).
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as unknown;
      if (
        reason instanceof DOMException &&
        reason.name === "InvalidStateError" &&
        reason.message.includes("Transition was aborted")
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, []);

  return <Toast.Provider placement={isMobile ? "bottom" : "bottom end"} />;
}
