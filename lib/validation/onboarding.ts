import { z } from "zod";

/** Niche options — drive the AI mascot's default tone/vocabulary. */
export const NICHES = ["glamour", "fitness", "cosplay", "sensual"] as const;
export type Niche = (typeof NICHES)[number];

/** The bot's primary objective for this creator. */
export const BOT_GOALS = [
  "maximize_tokens",
  "drive_subscriptions",
  "warm_fanbase",
] as const;
export type BotGoal = (typeof BOT_GOALS)[number];

/**
 * Usernames become the public link (`platform.com/<username>`): lowercase
 * letters, digits and underscores, 3–30 chars. `.transform` lowercases so the
 * uniqueness check and stored value are always normalised.
 */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "At least 3 characters")
  .max(30, "At most 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only")
  .transform((v) => v.toLowerCase());

export const nicheSchema = z.enum(NICHES);
export const botGoalSchema = z.enum(BOT_GOALS);

/**
 * The complete onboarding submission. Nothing is persisted until the final
 * step, so the API receives every field in one request.
 */
export const completeOnboardingSchema = z.object({
  username: usernameSchema,
  niche: nicheSchema,
  avatarFileId: z.string().max(64).nullish(),
  bannerFileId: z.string().max(64).nullish(),
  bgGradient: z.string().max(512).nullish(),
  // Onboarding content is now persisted as real `content` rows (filed under the
  // default collection), so the profile no longer needs the raw file ids.
  contentFileIds: z.array(z.string().max(64)).optional().default([]),
  botGoal: botGoalSchema,
});

export type CompleteOnboarding = z.infer<typeof completeOnboardingSchema>;
