"use client";

import { toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Tier } from "@/components/dashboard/subscriptions/subscription-meta";
import { TierPricingCard, type CardState } from "./tier-pricing-card";

interface CreatorSubscribePanelProps {
  tiers: Tier[];
  isAuthed: boolean;
  isOwnProfile: boolean;
  /** The viewer's active/trialing tier with this creator, if any. */
  initialSubscribedTierId: string | null;
  /** Where to send a logged-out viewer who taps subscribe. */
  loginHref: string;
}

/**
 * The fan-facing pricing grid. Tracks which tier (if any) the viewer is on and
 * posts to the subscribe endpoint in mock mode; logged-out viewers are routed to
 * sign in. One subscription per creator, so other tiers lock once the viewer joins.
 */
export function CreatorSubscribePanel({
  tiers,
  isAuthed,
  isOwnProfile,
  initialSubscribedTierId,
  loginHref,
}: CreatorSubscribePanelProps) {
  const router = useRouter();
  const [subscribedTierId, setSubscribedTierId] = useState<string | null>(
    initialSubscribedTierId,
  );
  const [busyTierId, setBusyTierId] = useState<string | null>(null);

  function stateFor(tier: Tier): CardState {
    if (isOwnProfile) return "own";
    if (subscribedTierId === tier.id) return "current";
    if (subscribedTierId) return "locked";
    if (!isAuthed) return "signin";
    return "subscribe";
  }

  async function handleSubscribe(tier: Tier) {
    if (!isAuthed) {
      window.location.assign(loginHref);
      return;
    }
    setBusyTierId(tier.id);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: tier.id }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Couldn't start subscription");
      }
      setSubscribedTierId(tier.id);
      toast.success(`You're subscribed to ${tier.name}.`);
      // Re-render the server components so the gated vault reflects new access.
      router.refresh();
    } catch (err) {
      toast.danger(
        err instanceof Error ? err.message : "Couldn't start subscription",
      );
    } finally {
      setBusyTierId(null);
    }
  }

  if (tiers.length === 0) {
    return (
      <p className="text-center text-sm text-muted">
        This creator hasn&apos;t published any subscription tiers yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tiers.map((tier) => (
        <TierPricingCard
          key={tier.id}
          tier={tier}
          state={stateFor(tier)}
          busy={busyTierId === tier.id}
          onSubscribe={() => handleSubscribe(tier)}
        />
      ))}
    </div>
  );
}
