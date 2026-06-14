import {
  Calendar03Icon,
  DiscountTag01Icon,
  GiftIcon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import type {
  ContentRarity,
  ContentTier,
  MediaType,
} from "@/lib/validation/content";

/** A non-file offer the creator can publish (no gamble/tier/price terms). */
export type OfferType = "discount" | "event" | "perk";

/** Everything the creator can add from the wizard — media plus the offers. */
export type ContentCategory = "media" | OfferType;

/** The editable distribution terms shared by every content row. */
export interface OfferTerms {
  tier: ContentTier;
  rarity: ContentRarity | null;
  tokenValue: number | null;
}

/**
 * An uploaded photo or clip in the creator's media pool. When the file has been
 * published as an offering, `rowId` and the terms/copy are filled; raw onboarding
 * uploads have `rowId === null` (delete-only, no editable terms).
 */
export interface FileItem extends Partial<OfferTerms> {
  kind: "file";
  fileId: string;
  mediaType: MediaType;
  /** Same-origin proxy URL streaming the (private) file. */
  src: string;
  /** The backing content row id, or null for a raw onboarding upload. */
  rowId: string | null;
  title?: string | null;
  description?: string | null;
}

/** A discount / event / perk offer. */
export interface OfferItem extends OfferTerms {
  kind: "offer";
  id: string;
  contentType: OfferType;
  title: string | null;
  description: string | null;
  discountPercent: number | null;
  eventAt: string | null;
  eventLocation: string | null;
}

export type VaultItem = FileItem | OfferItem;

export const OFFER_META: Record<
  OfferType,
  { label: string; icon: IconSvgElement }
> = {
  discount: { label: "Discount", icon: DiscountTag01Icon },
  event: { label: "Event", icon: Calendar03Icon },
  perk: { label: "Perk", icon: GiftIcon },
};

/** The cards shown on the wizard's first step. Order drives the grid. */
export const CATEGORY_META: Record<
  ContentCategory,
  { label: string; blurb: string; icon: IconSvgElement }
> = {
  media: {
    label: "Upload media",
    blurb: "Photos & clips fans can unlock or win",
    icon: Image01Icon,
  },
  discount: {
    label: "Discount",
    blurb: "A percentage off for your fans",
    icon: DiscountTag01Icon,
  },
  event: {
    label: "Event",
    blurb: "Invite fans to something live",
    icon: Calendar03Icon,
  },
  perk: {
    label: "Perk",
    blurb: "A personal perk fans can claim",
    icon: GiftIcon,
  },
};

/** The category cards in display order. */
export const CATEGORY_ORDER: ContentCategory[] = [
  "media",
  "discount",
  "event",
  "perk",
];

/** Short human summary of an offer, for its card. */
export function offerSummary(item: OfferItem): string {
  switch (item.contentType) {
    case "discount":
      return item.discountPercent != null
        ? `${item.discountPercent}% off`
        : "Discount";
    case "event":
      return item.eventAt ? formatEventDate(item.eventAt) : "Live event";
    case "perk":
      return item.description?.trim() || "Custom perk";
  }
}

/** Render an ISO datetime as a compact, locale-friendly label. */
export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
