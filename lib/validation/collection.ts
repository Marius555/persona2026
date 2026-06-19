import { z } from "zod";

import { tierSchema } from "./content";

/**
 * A content collection — a named grouping of vault items within a single tier.
 * The tier MUST stay aligned with the `content` table's `tier` enum.
 */
export const createCollectionSchema = z.object({
  tier: tierSchema,
  name: z
    .string()
    .trim()
    .min(1, "Name your collection")
    .max(20, "Keep it under 20 characters"),
});

export type CreateCollection = z.infer<typeof createCollectionSchema>;

/**
 * A partial edit to an existing collection. Every field is optional so the
 * client can PATCH just the name (rename) or just the visibility (hide toggle).
 */
export const updateCollectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name your collection")
    .max(20, "Keep it under 20 characters")
    .optional(),
  visible: z.boolean().optional(),
});

export type UpdateCollection = z.infer<typeof updateCollectionSchema>;
