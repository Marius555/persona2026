import { HugeiconsIcon } from "@hugeicons/react";

import { STEPS } from "@/components/landing/data";
import { SectionHeading } from "@/components/landing/section-heading";

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-surface/40 px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="How it works"
          title="Up and running in minutes"
          subtitle="Three steps to your AI-powered persona."
        />

        {/* Desktop */}
        <div className="hidden items-start sm:flex">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex flex-1 flex-col">
              <div className="flex items-center">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {parseInt(s.step, 10)}
                </div>
                {i < STEPS.length - 1 && <div className="mx-4 h-px flex-1 bg-border" />}
              </div>
              <div className="mt-6 pr-6">
                <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                  <HugeiconsIcon icon={s.icon} className="size-5" aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile */}
        <div className="flex flex-col gap-6 sm:hidden">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {parseInt(s.step, 10)}
                </div>
                {i < STEPS.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
              </div>
              <div className="pb-2 pt-1">
                <div className="mb-2 flex size-9 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                  <HugeiconsIcon icon={s.icon} className="size-4" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
