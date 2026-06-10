import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { LinkButton } from "@/components/landing/link-button";

export function Cta() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface/60 px-6 py-16 text-center sm:px-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5 text-accent" aria-hidden />
          No credit card required
        </div>

        <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Ready to build{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(120deg, oklch(65% 0.22 280), oklch(57.74% 0.2091 273.85) 55%, oklch(72% 0.18 300))",
            }}
          >
            your persona?
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-pretty text-lg text-muted">
          Join creators already using persona2 to grow their audience on autopilot.
        </p>

        <div className="mt-9 flex justify-center">
          <LinkButton href="/signup" withArrow className="w-full sm:w-auto">
            Start for free — it&apos;s quick
          </LinkButton>
        </div>

        <p className="mt-4 text-sm text-muted">Cancel anytime · Takes 2 minutes</p>
      </div>
    </section>
  );
}
