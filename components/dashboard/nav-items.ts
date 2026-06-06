import {
  AiBrain01Icon,
  Analytics01Icon,
  DashboardSquare01Icon,
  Image01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

/** A single sidebar navigation entry. */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: IconSvgElement;
}

/**
 * Dashboard sidebar links. Only `/dashboard` and `/dashboard/settings` have real
 * pages today; the rest are scaffolded routes that render placeholders for now.
 */
export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
  { id: "content", label: "Content", href: "/dashboard/content", icon: Image01Icon },
  { id: "persona", label: "Persona", href: "/dashboard/persona", icon: AiBrain01Icon },
  { id: "analytics", label: "Analytics", href: "/dashboard/analytics", icon: Analytics01Icon },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings01Icon },
];
