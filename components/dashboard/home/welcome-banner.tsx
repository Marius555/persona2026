import { Card } from "@heroui/react";

import { LinkButton } from "@/components/landing/link-button";

/**
 * Dashboard hero card: a greeting, a short prompt, and a primary CTA — with a
 * decorative accent wash on the right (no stock illustration asset). Matches the
 * reference's "Welcome back" banner while staying on the project's theme.
 */
export function WelcomeBanner({
  displayName,
  href,
  className = "",
}: {
  displayName: string;
  href: string;
  className?: string;
}) {
  return (
    <Card
      className={`relative isolate overflow-hidden ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 90% 120% at 100% 0%, oklch(57.74% 0.2091 273.85 / 0.16), transparent 60%)",
      }}
    >
      <Card.Content className="flex flex-col gap-4 p-6 sm:p-8 md:max-w-[70%]">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back 👋
            <br />
            {displayName}
          </h2>
          <p className="text-sm text-muted">
            Manage your content, tune your persona, and keep your offers fresh —
            everything starts from here.
          </p>
        </div>
        <div>
          <LinkButton href={href} withArrow>
            Go now
          </LinkButton>
        </div>
      </Card.Content>

      {/* Decorative accent orb (hidden on small screens). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 bottom-2 hidden size-40 rounded-full bg-accent/15 blur-2xl md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 bottom-8 hidden size-24 rounded-3xl bg-accent/25 md:block"
        style={{ transform: "rotate(12deg)" }}
      />
    </Card>
  );
}
