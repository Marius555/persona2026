import { Avatar, Card } from "@heroui/react";

import { TESTIMONIALS } from "@/components/landing/data";
import { SectionHeading } from "@/components/landing/section-heading";

export function Testimonials() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Testimonials"
          title="Creators love persona2"
          subtitle="Don't take our word for it."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="justify-between gap-5">
              <div className="flex gap-0.5 text-accent" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <Avatar size="sm" aria-label={t.name}>
                  <Avatar.Fallback className="bg-accent/15 text-xs font-bold text-accent">
                    {t.name.charAt(0)}
                  </Avatar.Fallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="truncate text-xs text-muted">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
