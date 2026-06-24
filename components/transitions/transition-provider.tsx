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

export function useRouteTransition(): RouteTransitionValue {
  const ctx = useContext(RouteTransitionContext);
  const router = useRouter();
  return useMemo<RouteTransitionValue>(() => {
    if (ctx) return ctx;
    // No provider in the tree — this can happen transiently during HMR or an
    // in-between SSR pass when a Server Component layout re-renders. Degrade to a
    // plain navigation instead of crashing the whole page.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "useRouteTransition: no <TransitionProvider> ancestor found; " +
          "falling back to router.push (route transition disabled).",
      );
    }
    return { navigate: (href: string) => router.push(href) };
  }, [ctx, router]);
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
