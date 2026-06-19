"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { TransitionLink } from "@/components/transitions/transition-link";
import { NAV_GROUPS } from "./nav-items";

/**
 * The grouped dashboard links, shared by the desktop sidebar and the mobile
 * drawer. Each section heading toggles its group open/closed. `onNavigate` lets
 * the mobile drawer close itself when a link is tapped.
 */
export function SidebarNav({
  userId,
  onNavigate,
}: {
  userId: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const base = `/auth/${userId}/dashboard`;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav className="flex w-64 flex-col gap-4 p-3">
      {NAV_GROUPS.map((group) => {
        const isCollapsed = collapsed[group.id] ?? false;

        return (
          <div key={group.id} className="flex flex-col gap-1">
            <button
              type="button"
              aria-expanded={!isCollapsed}
              onClick={() =>
                setCollapsed((c) => ({ ...c, [group.id]: !isCollapsed }))
              }
              className="flex items-center justify-between px-3 py-1 text-xs font-semibold tracking-wide text-muted uppercase outline-none"
            >
              <span>{group.label}</span>
              <motion.span
                animate={{ rotate: isCollapsed ? -90 : 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
                className="flex"
              >
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const href = `${base}${item.segment}`;
                      const isActive =
                        pathname === href ||
                        (item.segment !== "" &&
                          pathname.startsWith(`${href}/`));

                      return (
                        <TransitionLink
                          key={item.id}
                          href={href}
                          onNavigate={onNavigate}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-accent/12 text-accent"
                              : "text-muted hover:bg-surface-secondary hover:text-foreground"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={item.icon}
                            className="size-5 shrink-0"
                          />
                          {item.label}
                        </TransitionLink>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
