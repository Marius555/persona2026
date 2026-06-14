"use client";

import { SearchField } from "@heroui/react";

/**
 * Topbar search field. Visual/placeholder for now — wiring to real search comes
 * later. Hidden on small screens to keep the mobile header compact.
 */
export function TopbarSearch() {
  return (
    <SearchField aria-label="Search" className="hidden md:flex">
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input className="w-[200px] lg:w-[260px]" placeholder="Search…" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
