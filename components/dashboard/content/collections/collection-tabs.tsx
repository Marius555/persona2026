"use client";

import type { Key } from "@heroui/react";
import { Tabs } from "@heroui/react";

import type { Ref } from "react";

import type { Collection } from "../content-meta";

interface CollectionTabsProps {
  /** Collections for the active tier, newest first. */
  collections: Collection[];
  /** The active collection id. */
  activeId: string;
  onActiveChange: (id: string) => void;
  /** Forwarded to the scrolling tab list so overflow arrows can drive it. */
  scrollerRef?: Ref<HTMLDivElement>;
}

/** Keep tab labels compact so many collections stay visible at once. */
function truncateLabel(name: string) {
  return name.length > 20 ? `${name.slice(0, 20)}…` : name;
}

/**
 * Animated HeroUI tabs, one per collection in the active tier (newest first).
 * Used as a controlled selector — the grid renders the active collection's
 * content below, so there are no tab panels here. Overflowing tabs scroll
 * horizontally on their own.
 */
export function CollectionTabs({
  collections,
  activeId,
  onActiveChange,
  scrollerRef,
}: CollectionTabsProps) {
  return (
    <Tabs
      className="min-w-0"
      variant="secondary"
      selectedKey={activeId}
      onSelectionChange={(key: Key) => onActiveChange(String(key))}
    >
      <Tabs.ListContainer>
        {/* `!w-fit` / `*:!w-fit` need `!important` to beat HeroUI's base
            `.tabs__list[data-orientation]` width:100% (an attribute selector wins
            on specificity), so tabs size to their labels instead of stretching. */}
        <Tabs.List
          ref={scrollerRef}
          aria-label="Collections"
          className="!w-fit max-w-full *:!w-fit"
        >
          {collections.map((c) => (
            <Tabs.Tab key={c.id} id={c.id}>
              <span title={c.name}>{truncateLabel(c.name)}</span>
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
