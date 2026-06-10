import { HugeiconsIcon } from "@hugeicons/react";
import { Card } from "@heroui/react";

import { FEATURES } from "@/components/landing/data";
import { SectionHeading } from "@/components/landing/section-heading";

export function FeatureGrid() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Platform"
          title="Everything you need to scale"
          subtitle="One platform to build, manage, and grow your creator presence."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title} className="gap-0">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent/12 text-accent ring-1 ring-accent/20">
                <HugeiconsIcon icon={f.icon} className="size-6" aria-hidden />
              </div>
              <Card.Header>
                <Card.Title className="text-lg">{f.title}</Card.Title>
                <Card.Description className="leading-relaxed">{f.description}</Card.Description>
              </Card.Header>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
