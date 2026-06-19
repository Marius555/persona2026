"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
} from "react";

/**
 * Funnels programmatic navigation through a single `navigate()` so request-driven
 * flows (login, signup, onboarding, logout) only move once their request has
 * succeeded. The transition itself is declarative: `<RouteTransition>` replays a
 * CSS enter animation when the new route commits, so the slide can never start
 * mid-request (the route only commits after the server responds).
 */

type RouteTransitionValue = {
  navigate: (href: string) => void;
};

const RouteTransitionContext = createContext<RouteTransitionValue | null>(null);

export function useRouteTransition() {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) {
    throw new Error(
      "useRouteTransition must be used within a <TransitionProvider>",
    );
  }
  return ctx;
}

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router, startTransition],
  );

  const value = useMemo<RouteTransitionValue>(() => ({ navigate }), [navigate]);

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
    </RouteTransitionContext.Provider>
  );
}
