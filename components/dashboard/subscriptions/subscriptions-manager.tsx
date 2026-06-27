"use client";

import { CrownIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertDialog, Button, Spinner, toast } from "@heroui/react";
import { useState } from "react";

import type { CollectionOption } from "@/components/dashboard/games/game-meta";
import type { Tier } from "./subscription-meta";
import { CreateTierCard } from "./create-tier-card";
import { TierCard } from "./tier-card";
import { TierSetupFlow } from "./setup-flow/tier-setup-flow";

interface SubscriptionsManagerProps {
  collections: CollectionOption[];
  initialTiers: Tier[];
  /** Active/trialing subscriber counts, keyed by tier id. */
  subscriberCounts: Record<string, number>;
}

/**
 * The creator's subscription-tier workspace: lists existing tiers, opens the
 * setup flow to create or edit one, and confirms deletes. Tier state is held
 * here and updated optimistically as the flow saves.
 */
export function SubscriptionsManager({
  collections,
  initialTiers,
  subscriberCounts,
}: SubscriptionsManagerProps) {
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [flowOpen, setFlowOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [deletingTier, setDeletingTier] = useState<Tier | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function openCreate() {
    setEditingTier(null);
    setFlowOpen(true);
  }

  function openEdit(tier: Tier) {
    setEditingTier(tier);
    setFlowOpen(true);
  }

  function handleSaved(saved: Tier) {
    setTiers((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [saved, ...prev];
    });
  }

  async function confirmDelete() {
    if (!deletingTier) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/subscriptions/tiers/${deletingTier.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setTiers((prev) => prev.filter((t) => t.id !== deletingTier.id));
      setDeletingTier(null);
    } catch {
      toast.danger("Couldn't delete that tier. Please try again.");
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Subscriptions
        </h1>
        <p className="text-sm text-muted">
          Create membership tiers fans can subscribe to for recurring access.
        </p>
      </header>

      {tiers.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-transparent text-muted ring-1 ring-inset ring-border">
            <HugeiconsIcon icon={CrownIcon} className="size-7" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">
              No tiers yet
            </h2>
            <p className="mx-auto max-w-sm text-sm text-muted">
              Set up your first membership tier — pick a price, choose what it
              unlocks, and list the perks fans get.
            </p>
          </div>
          <Button className="cursor-pointer w-80" onPress={openCreate}>
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
            Create a tier
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              subscriberCount={subscriberCounts[tier.id] ?? 0}
              onEdit={() => openEdit(tier)}
              onDelete={() => setDeletingTier(tier)}
            />
          ))}
          <CreateTierCard onCreate={openCreate} />
        </div>
      )}

      {flowOpen ? (
        <TierSetupFlow
          collections={collections}
          initialTier={editingTier}
          onSaved={handleSaved}
          onClose={() => setFlowOpen(false)}
        />
      ) : null}

      <AlertDialog.Backdrop
        isOpen={!!deletingTier}
        onOpenChange={(open) => {
          if (!open && !deleteBusy) setDeletingTier(null);
        }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Delete this tier?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                This removes{" "}
                <strong>{deletingTier?.name ?? "this tier"}</strong> from your
                pricing. Existing subscribers keep access until their period ends.
                This can&apos;t be undone.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary" isDisabled={deleteBusy}>
                Cancel
              </Button>
              <Button variant="danger" isPending={deleteBusy} onPress={confirmDelete}>
                {({ isPending }) =>
                  isPending ? <Spinner size="sm" color="current" /> : "Delete"
                }
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  );
}
