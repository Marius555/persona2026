"use client";

import { usePathname } from "next/navigation";

/**
 * Plays a CSS "enter" animation on the incoming route. The inner `<div>` is
 * keyed by the route, so React remounts it on every navigation and the CSS
 * animation (defined as `.route-enter` in globals.css) replays. The previous
 * route is simply replaced — there is no exit animation and, crucially, no
 * second router-driven tree on screen, so nothing fights Next's App Router
 * cache (which is what made the snapshot/freeze approaches flash and blank out).
 *
 * `scope` controls what counts as a navigation:
 *  - "path"    — keys on the full pathname (dashboard content area: every
 *                sub-page swap animates).
 *  - "section" — collapses all dashboard paths to one key, so dashboard sub-nav
 *                does NOT remount/animate the whole page; only top-level section
 *                changes (landing ↔ auth ↔ onboarding ↔ dashboard) do.
 */
type Scope = "section" | "path";

function keyFor(pathname: string, scope: Scope): string {
  if (scope === "section" && /^\/auth\/[^/]+\/dashboard/.test(pathname)) {
    return "dashboard";
  }
  return pathname;
}

export function RouteTransition({
  children,
  scope = "path",
}: {
  children: React.ReactNode;
  scope?: Scope;
}) {
  const pathname = usePathname();

  return (
    <div key={keyFor(pathname, scope)} className="route-enter">
      {children}
    </div>
  );
}
