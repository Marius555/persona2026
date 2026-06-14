"use client";

import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@heroui/react";
import { useSyncExternalStore } from "react";

const PREFERS_DARK = "(prefers-color-scheme: dark)";

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributeFilter: ["class"] });
  const media = window.matchMedia(PREFERS_DARK);
  media.addEventListener("change", cb);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", cb);
  };
}

/** Effective theme: explicit class wins, else fall back to the OS preference. */
function getSnapshot() {
  const { classList } = document.documentElement;
  if (classList.contains("dark")) return true;
  if (classList.contains("light")) return false;
  return window.matchMedia(PREFERS_DARK).matches;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = getSnapshot() ? "light" : "dark";
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(next);
    // Persist for SSR so the server renders the right class on the next load.
    document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return (
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onPress={toggle}
    >
      <HugeiconsIcon
        icon={isDark ? Sun01Icon : Moon01Icon}
        className="size-4"
      />
    </Button>
  );
}
