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
  /** Path suffix appended to the user's dashboard base (`""` is the root). */
  segment: string;
  icon: IconSvgElement;
}

/** A titled, collapsible group of sidebar links. */
export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Dashboard sidebar links, organized into collapsible sections. Hrefs are built
 * per-user from each item's segment against `/auth/<userId>/dashboard`. Only the
 * root, `/content` and `/settings` have real pages today; the rest are scaffolded
 * routes for now.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", segment: "", icon: DashboardSquare01Icon },
      { id: "content", label: "Content", segment: "/content", icon: Image01Icon },
      { id: "analytics", label: "Analytics", segment: "/analytics", icon: Analytics01Icon },
    ],
  },
  {
    id: "management",
    label: "Management",
    items: [
      { id: "persona", label: "Persona", segment: "/persona", icon: AiBrain01Icon },
      { id: "settings", label: "Settings", segment: "/settings", icon: Settings01Icon },
    ],
  },
];
