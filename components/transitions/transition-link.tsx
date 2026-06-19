"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

import { useRouteTransition } from "./transition-provider";

/**
 * Drop-in replacement for next/link that routes navigation through the fade
 * curtain. Modified clicks (cmd/ctrl/shift/alt, middle-click) and any handler
 * that calls `preventDefault()` fall through to the browser so "open in new
 * tab" still works. `onNavigate` fires before the transition (used by the
 * mobile drawer to close itself).
 */
type TransitionLinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string;
  onNavigate?: () => void;
};

export function TransitionLink({
  href,
  onClick,
  onNavigate,
  children,
  ...rest
}: TransitionLinkProps) {
  const { navigate } = useRouteTransition();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    onNavigate?.();
    navigate(href);
  }

  return (
    <NextLink href={href} onClick={handleClick} {...rest}>
      {children}
    </NextLink>
  );
}
