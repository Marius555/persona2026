import { z } from "zod";

/**
 * Content domain enums. These MUST stay aligned with the `content` table's enum
 * `elements` in `appwrite.schema.json` (applied by scripts/setup-appwrite.mjs).
 */

/** What kind of thing an offering is. Files are the default; the rest are perks. */
export const CONTENT_TYPES = ["file", "discount", "event", "perk"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

/**
 * The single classification fans see:
 * - `exclusive` — locked content unlocked for a fixed token price; never gambled.
 * - `gamble` — a loot drop staked into the gamification layer; fans win or lose
 *   it. Carries a `rarity` and a token pot value.
 */
export const CONTENT_TIERS = ["exclusive", "gamble"] as const;
export type ContentTier = (typeof CONTENT_TIERS)[number];

/** Loot rarity, driving the odds and the visual treatment of a gamble drop. */
export const CONTENT_RARITIES = ["common", "rare", "epic", "legendary"] as const;
export type ContentRarity = (typeof CONTENT_RARITIES)[number];

/** Media kind, derived from the uploaded file's MIME type (file offerings only). */
export const MEDIA_TYPES = ["image", "video"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const tierSchema = z.enum(CONTENT_TIERS);
export const raritySchema = z.enum(CONTENT_RARITIES);
export const mediaTypeSchema = z.enum(MEDIA_TYPES);

/** Distribution terms shared by every offering, regardless of content type. */
const termsShape = {
  tier: tierSchema,
  rarity: raritySchema.nullish(),
  tokenValue: z.number().int().min(0).max(1_000_000).nullish(),
  collectionId: z.string().max(64).nullish(),
};

/** A single already-uploaded file (from the pool or a fresh upload). */
export const contentItemSchema = z.object({
  fileId: z.string().min(1).max(64),
  mediaType: mediaTypeSchema,
  title: z.string().trim().max(120).nullish(),
});

const titleSchema = z.string().trim().min(1, "Add a title").max(120);

/**
 * One publish action, discriminated by `contentType`. File batches become one
 * row per file; the other types are a single offering each. The `tier`/rarity/
 * value terms are shared across the batch.
 */
export const createContentSchema = z
  .discriminatedUnion("contentType", [
    z.object({
      contentType: z.literal("file"),
      ...termsShape,
      // Shared batch meta — applied to every file row in the upload.
      title: z.string().trim().max(120).nullish(),
      description: z.string().trim().max(1000).nullish(),
      items: z
        .array(contentItemSchema)
        .min(1, "Add at least one piece of content")
        .max(20, "You can publish up to 20 files at a time"),
    }),
    z.object({
      contentType: z.literal("discount"),
      ...termsShape,
      title: titleSchema,
      description: z.string().trim().max(1000).nullish(),
      discountPercent: z
        .number()
        .int()
        .min(1, "Set a discount of at least 1%")
        .max(100),
    }),
    z.object({
      contentType: z.literal("event"),
      ...termsShape,
      title: titleSchema,
      description: z.string().trim().max(1000).nullish(),
      eventAt: z.string().trim().min(1, "Pick a date and time").max(40),
      eventLocation: z.string().trim().max(300).nullish(),
    }),
    z.object({
      contentType: z.literal("perk"),
      ...termsShape,
      title: titleSchema,
      description: z.string().trim().min(1, "Describe the perk").max(1000),
    }),
  ])
  .refine((d) => d.tier !== "gamble" || !!d.rarity, {
    message: "Pick a rarity for a gamble drop",
    path: ["rarity"],
  });

export type CreateContent = z.infer<typeof createContentSchema>;

/**
 * One edit to an existing offering, discriminated by `contentType`. Mirrors
 * `createContentSchema` minus file batching — the media file itself is never
 * swapped, only its terms and copy. The `contentType` must match the row being
 * edited (the route enforces this); it can't be changed after creation.
 */
export const updateContentSchema = z
  .discriminatedUnion("contentType", [
    z.object({
      contentType: z.literal("file"),
      ...termsShape,
      title: z.string().trim().max(120).nullish(),
      description: z.string().trim().max(1000).nullish(),
    }),
    z.object({
      contentType: z.literal("discount"),
      ...termsShape,
      title: titleSchema,
      description: z.string().trim().max(1000).nullish(),
      discountPercent: z
        .number()
        .int()
        .min(1, "Set a discount of at least 1%")
        .max(100),
    }),
    z.object({
      contentType: z.literal("event"),
      ...termsShape,
      title: titleSchema,
      description: z.string().trim().max(1000).nullish(),
      eventAt: z.string().trim().min(1, "Pick a date and time").max(40),
      eventLocation: z.string().trim().max(300).nullish(),
    }),
    z.object({
      contentType: z.literal("perk"),
      ...termsShape,
      title: titleSchema,
      description: z.string().trim().min(1, "Describe the perk").max(1000),
    }),
  ])
  .refine((d) => d.tier !== "gamble" || !!d.rarity, {
    message: "Pick a rarity for a gamble drop",
    path: ["rarity"],
  });

export type UpdateContent = z.infer<typeof updateContentSchema>;
