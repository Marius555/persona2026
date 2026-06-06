"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { Button, Drawer } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { SidebarNav } from "./sidebar-nav";
import { UserMenu, type UserMenuProps } from "./user-menu";

const SIDEBAR_WIDTH = "16rem";

function Brand() {
  return (
    <div className="flex h-16 shrink-0 items-center px-6">
      <span className="text-lg font-bold tracking-tight text-foreground">persona2</span>
    </div>
  );
}

/**
 * The persistent dashboard chrome: a desktop sidebar (open by default), a mobile
 * drawer (closed by default), and a top bar with a toggle and the user menu.
 *
 * The open/closed default is decided by CSS breakpoints — not JS — so the
 * server-rendered markup already matches each viewport and there is no hydration
 * flicker. The desktop sidebar and the mobile drawer are independent treatments;
 * the toggle reads the viewport at press time to drive the relevant one.
 */
export function DashboardShell({
  children,
  ...user
}: UserMenuProps & { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleToggle() {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setDesktopCollapsed((c) => !c);
    } else {
      setMobileOpen((o) => !o);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — visible from lg up, width animates on collapse. */}
      <motion.aside
        initial={false}
        animate={{ width: desktopCollapsed ? 0 : SIDEBAR_WIDTH }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
        className="hidden shrink-0 overflow-hidden bg-surface lg:block"
      >
        <div className="flex h-full w-64 flex-col border-r border-border">
          <Brand />
          <SidebarNav />
        </div>
      </motion.aside>

      {/* Mobile drawer — controlled, closed by default. Only opened on < lg. */}
      <Drawer.Backdrop isOpen={mobileOpen} onOpenChange={setMobileOpen}>
        <Drawer.Content placement="left">
          <Drawer.Dialog className="w-64 max-w-[80vw] p-0">
            <Drawer.CloseTrigger />
            <Brand />
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
          <Button
            isIconOnly
            variant="tertiary"
            aria-label="Toggle sidebar"
            onPress={handleToggle}
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-5" />
          </Button>
          <UserMenu {...user} />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
