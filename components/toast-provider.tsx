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

  return <Toast.Provider placement={isMobile ? "bottom" : "bottom end"} />;
}
