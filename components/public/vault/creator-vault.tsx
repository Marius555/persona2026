"use client";

import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { FanVaultItem } from "@/lib/subscriptions/vault";

interface CreatorVaultProps {
  items: FanVaultItem[];
  /** Whether the viewer holds an active subscription (tunes the locked copy). */
  subscribed: boolean;
}

/**
 * The creator's exclusive media, gated by the viewer's subscription. Unlocked
 * items render their image/video; locked items show a blurred teaser with a lock,
 * nudging the viewer toward a membership.
 */
export function CreatorVault({ items, subscribed }: CreatorVaultProps) {
  if (items.length === 0) return null;

  const lockedCopy = subscribed ? "Not in your tier" : "Members only";

  return (
    <section className="mx-auto max-w-5xl px-4 pb-16">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">
        Exclusive content
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-secondary"
          >
            {item.locked || !item.src ? (
              <div className="grid size-full place-items-center bg-gradient-to-br from-surface-secondary to-surface-tertiary">
                <div className="flex flex-col items-center gap-1.5 text-muted">
                  <HugeiconsIcon icon={SquareLock02Icon} className="size-6" />
                  <span className="text-xs font-medium">{lockedCopy}</span>
                </div>
              </div>
            ) : item.mediaType === "video" ? (
              <video
                src={item.src}
                controls
                playsInline
                className="size-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.title ?? "Exclusive content"}
                className="size-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
