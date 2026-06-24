"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button, Drawer } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useSyncExternalStore } from "react";

import { RouteTransition } from "@/components/transitions/route-transition";
import { NotificationButton } from "./notification-button";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu, type UserMenuProps } from "./user-menu";
import { Separator } from "@heroui/react";

const SIDEBAR_WIDTH = "16rem";
const DESKTOP_QUERY = "(min-width: 1024px)";

/** Track whether the viewport is at desktop width, the lg breakpoint above. */
function subscribeDesktop(cb: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", cb);
  return () => media.removeEventListener("change", cb);
}
function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function Brand() {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-lg font-bold tracking-tight text-foreground">
          persona2
        </span>
      </div>
      <Separator className="bg-border" />
    </>
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
  userId,
  ...user
}: UserMenuProps & { children: React.ReactNode; userId: string }) {
  const reduceMotion = useReducedMotion();
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // The header is shared across breakpoints, so the toggle's open-state is the
  // desktop sidebar above lg and the mobile drawer below it. Default to "desktop"
  // on the server so the first paint matches the lg-and-up layout (sidebar open).
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    () => true,
  );
  const sidebarOpen = isDesktop ? !desktopCollapsed : mobileOpen;

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
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
        className="hidden shrink-0 overflow-hidden bg-surface lg:block"
      >
        <div className="flex h-full w-64 flex-col border-r border-border bg-gradient-to-br from-accent/10 to-surface-secondary/40">
          <Brand />
          <SidebarNav userId={userId} />
        </div>
      </motion.aside>

      {/* Mobile drawer — controlled, closed by default. Only opened on < lg. */}
      <Drawer.Backdrop isOpen={mobileOpen} onOpenChange={setMobileOpen}>
        <Drawer.Content placement="left">
          <Drawer.Dialog className="w-64 max-w-[80vw] bg-gradient-to-br from-accent/10 to-surface-secondary/40 p-0">
            <Drawer.CloseTrigger />
            <Brand />
            <SidebarNav userId={userId} onNavigate={() => setMobileOpen(false)} />
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 bg-transparent px-4">
          <Button
            isIconOnly
            variant="tertiary"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onPress={handleToggle}
          >
            <HugeiconsIcon
              icon={sidebarOpen ? ArrowLeft01Icon : ArrowRight01Icon}
              className="size-5"
            />
          </Button>
          <div className="flex items-center gap-3">
            <NotificationButton />
            <UserMenu userId={userId} {...user} />
          </div>
        </header>

        <main className="scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>
    </div>
  );
}
