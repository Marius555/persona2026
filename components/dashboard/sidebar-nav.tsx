"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "./nav-items";

/**
 * The list of dashboard links, shared by the desktop sidebar and the mobile
 * drawer. `onNavigate` lets the mobile drawer close itself when a link is tapped.
 */
export function SidebarNav({
  userId,
  onNavigate,
}: {
  userId: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const base = `/auth/${userId}/dashboard`;

  return (
    <nav className="flex w-64 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const href = `${base}${item.segment}`;
        const isActive =
          pathname === href ||
          (item.segment !== "" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={item.id}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent/12 text-accent"
                : "text-muted hover:bg-surface-secondary hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={item.icon} className="size-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
