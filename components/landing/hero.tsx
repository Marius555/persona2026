import { SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card } from "@heroui/react";

import { Navbar } from "@/components/navbar";
import { LinkButton } from "@/components/landing/link-button";

const PREVIEW_STATS = [
  { val: "12.4K", label: "Followers", delta: "+8.2%" },
  { val: "3.8M", label: "Messages", delta: "+24.1%" },
  { val: "94%", label: "Engagement", delta: "+3.6%" },
];

const PREVIEW_BARS = [
  { label: "Content Pool", pct: 78 },
  { label: "AI Activity", pct: 95 },
  { label: "Fan Reach", pct: 62 },
];

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Single, subtle static wash — soft depth, not a glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% -10%, oklch(57.74% 0.2091 273.85 / 0.10), transparent 70%)",
        }}
      />

      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-12 text-center sm:pt-20 lg:px-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-muted">
          <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-accent" aria-hidden />
          AI-powered creator platform
        </div>

        {/* Headline */}
        <h1 className="mt-7 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          Your persona,
          <br className="hidden sm:block" />{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(120deg, oklch(65% 0.22 280), oklch(57.74% 0.2091 273.85) 55%, oklch(72% 0.18 300))",
            }}
          >
            always on.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
          persona2 gives every creator an AI that looks, sounds, and acts like you — so your
          audience stays engaged even when you&apos;re offline.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <LinkButton href="/signup" withArrow className="w-full sm:w-auto">
            Get started for free
          </LinkButton>
          <LinkButton href="/login" variant="outline" className="w-full sm:w-auto">
            Sign in
          </LinkButton>
        </div>

        <p className="mt-5 text-sm text-muted">No credit card required · Free to start</p>

        {/* Static product preview */}
        <Card variant="secondary" className="mt-16 w-full max-w-3xl text-left">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-accent" />
              <span className="text-sm font-semibold text-foreground">Analytics Overview</span>
            </div>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
              Live
            </span>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
            {PREVIEW_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl bg-surface p-3">
                <div className="text-lg font-bold text-foreground sm:text-2xl">{s.val}</div>
                <div className="mt-0.5 truncate text-xs text-muted">{s.label}</div>
                <div className="mt-1.5 text-xs font-medium text-success">{s.delta}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            {PREVIEW_BARS.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-muted">{b.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <span className="w-7 shrink-0 text-right text-xs font-medium text-foreground">
                  {b.pct}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
