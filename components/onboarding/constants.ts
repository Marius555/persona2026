import {
  CloudUploadIcon,
  Image01Icon,
  Link01Icon,
  SparklesIcon,
  Target01Icon,
} from "@hugeicons/core-free-icons";

/** Per-step icon (shown at the top of the card) + title. */
export const STEP_META = [
  { title: "Claim your handle", icon: Link01Icon },
  { title: "Pick your niche", icon: SparklesIcon },
  { title: "Dress your profile", icon: Image01Icon },
  { title: "Build your content pool", icon: CloudUploadIcon },
  { title: "Set the bot's objective", icon: Target01Icon },
] as const;

export const TOTAL_STEPS = STEP_META.length;

/** Public link host shown in the username preview. */
export const PLATFORM_HOST = "persona2.com";

/**
 * Neutral fallback gradient (theme-driven) applied when a creator skips the
 * banner and we can't derive a colour from their avatar.
 */
export const NEUTRAL_GRADIENT =
  "linear-gradient(135deg, color-mix(in oklab, var(--accent) 32%, transparent), color-mix(in oklab, var(--accent) 6%, transparent))";

/** Full-page warm-blue backdrop, built from the accent token like the auth page. */
export const PAGE_BACKDROP =
  "radial-gradient(70% 60% at 12% 18%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%), " +
  "radial-gradient(65% 55% at 88% 82%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 65%)";
