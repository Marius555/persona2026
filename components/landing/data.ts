import {
  AiBrain01Icon,
  AiContentGenerator01Icon,
  Analytics01Icon,
  AnalyticsUpIcon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

/* Shared content for the landing page sections. */

export const FEATURES = [
  {
    icon: AiBrain01Icon,
    title: "AI-powered persona",
    description:
      "Your AI embodies your exact tone, style, and goals. It learns from your content and engages your audience around the clock — without you lifting a finger.",
  },
  {
    icon: AiContentGenerator01Icon,
    title: "Content pool",
    description:
      "Upload your library once. Your AI stays on-brand and pulls from your content to keep every reply fresh and authentic.",
  },
  {
    icon: Analytics01Icon,
    title: "Smart analytics",
    description:
      "Track growth, engagement, and revenue across every platform from one unified dashboard.",
  },
  {
    icon: AnalyticsUpIcon,
    title: "Growth engine",
    description:
      "Automated engagement loops that compound over time — reach more fans with less manual effort, every day.",
  },
] as const;

export const STEPS = [
  {
    step: "01",
    icon: UserIcon,
    title: "Create your profile",
    description: "Claim your handle, pick your niche, and upload your avatar in under two minutes.",
  },
  {
    step: "02",
    icon: Settings01Icon,
    title: "Configure your AI",
    description: "Choose your goal — maximize engagement, grow subscriptions, or warm your fanbase.",
  },
  {
    step: "03",
    icon: AnalyticsUpIcon,
    title: "Watch it grow",
    description: "Your AI works around the clock while you focus on creating content you love.",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote: "persona2 handles my DMs while I sleep. It genuinely sounds like me, and my fans stay engaged even when I'm offline.",
    name: "Alexa R.",
    role: "Fitness & wellness creator",
  },
  {
    quote: "I was skeptical, but the AI captures my voice surprisingly well. Setup was quick and the replies feel authentic.",
    name: "Marcus T.",
    role: "Cosplay & art creator",
  },
  {
    quote: "It took me about ten minutes to get going. Now I have a persona that keeps the conversation alive day and night.",
    name: "Zoe L.",
    role: "Lifestyle & fashion creator",
  },
] as const;

export const TICKER_ITEMS = [
  "AI Persona Engine",
  "24/7 Engagement",
  "Content Pool",
  "Smart Analytics",
  "Growth Automation",
  "Fan Relationship AI",
  "Multi-Platform Support",
] as const;
