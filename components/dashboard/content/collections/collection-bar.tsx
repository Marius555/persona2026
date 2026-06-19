"use client";

import type { Collection } from "../content-meta";
import { ScrollArrow } from "../scroll-arrow";
import { useScrollArrows } from "../use-scroll-arrows";
import { CollectionActions } from "./collection-actions";
import { CollectionTabs } from "./collection-tabs";

interface CollectionBarProps {
  /** Collections for the active tier, newest first. */
  collections: Collection[];
  activeId: string;
  onActiveChange: (id: string) => void;
  /** Open the new-collection overlay. */
  onNewCollection: () => void;
  /** Open the manage drawer for the active collection. */
  onManageCollection: () => void;
}

/**
 * The control row above the grid: the collection tabs (sized to their content,
 * scrolling when they overflow) with a "+ New collection" button pinned right.
 */
export function CollectionBar({
  collections,
  activeId,
  onActiveChange,
  onNewCollection,
  onManageCollection,
}: CollectionBarProps) {
  // Re-measure whenever the visible set changes (tier switches keep the same
  // count but swap collections), so a stale arrow can't linger.
  const { scrollerRef, overflow, scrollByDir } = useScrollArrows(
    collections.map((c) => c.id).join(","),
  );
  const scrollable = overflow.left || overflow.right;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex min-w-0 items-center gap-1.5">
        {/* The left arrow overlays the scroller's left edge (no reserved space, so
            the tabs always start flush-left); the right arrow sits in flow next to
            the tabs. Both stay mounted while the list can scroll and only fade by
            direction, so reaching the start/end never shifts the layout. */}
        {scrollable && (
          <ScrollArrow
            dir={-1}
            visible={overflow.left}
            onPress={() => scrollByDir(-1)}
          />
        )}
        <CollectionTabs
          scrollerRef={scrollerRef}
          collections={collections}
          activeId={activeId}
          onActiveChange={onActiveChange}
        />
        {scrollable && (
          <ScrollArrow
            dir={1}
            inline
            visible={overflow.right}
            onPress={() => scrollByDir(1)}
          />
        )}
      </div>

      <div className="ml-auto shrink-0">
        <CollectionActions
          onNewCollection={onNewCollection}
          onManageCollection={onManageCollection}
        />
      </div>
    </div>
  );
}
