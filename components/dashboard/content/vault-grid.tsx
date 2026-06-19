"use client";

import { AddTile } from "./add-tile";
import type { VaultItem } from "./content-meta";
import { VaultCard } from "./vault-card";

interface VaultGridProps {
  items: VaultItem[];
  onAdd: () => void;
  onView: (item: VaultItem) => void;
  onEdit: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
}

export function VaultGrid({
  items,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: VaultGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {items.map((item) => (
        <VaultCard
          key={item.kind === "file" ? item.fileId : item.id}
          item={item}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      <AddTile onAdd={onAdd} />
    </div>
  );
}
