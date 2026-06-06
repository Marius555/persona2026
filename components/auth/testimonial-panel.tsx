"use client";

import { Avatar, Button, Card } from "@heroui/react";
import { useState } from "react";

type Testimonial = { quote: string; name: string; role: string; initials: string };

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "persona2 made it effortless to shape a space that feels like me. Setup took minutes, not hours.",
    name: "Mara Pavlović",
    role: "Product Designer",
    initials: "MP",
  },
  {
    quote:
      "The cleanest onboarding I've used in years. Everything just worked on the first try.",
    name: "Daniel Okafor",
    role: "Engineer at Northwind",
    initials: "DO",
  },
  {
    quote:
      "Beautiful, fast, and thoughtful. It's rare to find a tool this polished from day one.",
    name: "Yuki Tanaka",
    role: "Founder, Studio Yuki",
    initials: "YT",
  },
];

const AVATAR_COLORS = ["accent", "success", "warning", "danger"] as const;

// Dark circle behind the sparkle badge, for contrast against the light surface
// and the accent sheet.
const DARK_BASE = "oklch(16% 0.025 273.85)";

// Accent glow mirrored from the form side (which points toward the center seam
// at 80% 50%); here it points the same way relative to its own seam (20% 50%) so
// both halves read as one continuous surface.
const SIDE_GLOW =
  "radial-gradient(60% 55% at 20% 50%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)";

// Concave "scoop" cut into the top-right corner: a small circle centered exactly
// at the corner so a tight quarter-circle is bitten out. The card's sparkle
// badge (a round avatar) nestles into that bite — the radius matches the badge
// radius plus a hair of gap, so the curve hugs the icon.
const SCOOP_SHEET =
  "radial-gradient(circle 30px at 100% 0, transparent 0 29px, #000 30px)";
const SCOOP_CARD =
  "radial-gradient(circle 34px at 100% 0, transparent 0 33px, #000 34px)";

function Starburst() {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden
      className="pointer-events-none absolute -bottom-10 -right-10 size-72 text-accent-foreground opacity-10"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="100"
          y1="100"
          x2="100"
          y2="4"
          stroke="currentColor"
          strokeWidth="1.5"
          transform={`rotate(${i * 30} 100 100)`}
        />
      ))}
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
      <path d="M12 2c.4 3.6 1.8 5 5.4 5.4-3.6.4-5 1.8-5.4 5.4-.4-3.6-1.8-5-5.4-5.4C10.2 7 11.6 5.6 12 2Zm6 9c.25 2.1 1.05 2.9 3.15 3.15C19.05 14.4 18.25 15.2 18 17.3c-.25-2.1-1.05-2.9-3.15-3.15C16.95 13.9 17.75 13.1 18 11Z" />
    </svg>
  );
}

export function TestimonialPanel({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const total = TESTIMONIALS.length;
  const t = TESTIMONIALS[index];

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total);

  return (
    // Centered composition. The column clips to the container's right corners and
    // carries the same accent glow as the form side so both halves match.
    <aside
      className={`relative items-center justify-center overflow-hidden rounded-r-3xl ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: SIDE_GLOW }}
      />

      {/* Group box, centered in the column. Its width drives the sheet; the
          marketing card is positioned relative to its bottom edge. */}
      <div className="relative z-10 w-[80%]">
        {/* Accent sheet ("What our members say."). Outer layer carries only the
            soft shadow (drop-shadow) so it tracks the scooped corner; the inner
            layer holds the background, content, and the concave mask. */}
        <div
          className="relative h-[31rem] w-full"
          style={{ filter: "drop-shadow(0 26px 38px rgba(0,0,0,0.5))" }}
        >
          <div
            className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.6rem] bg-accent p-6 text-accent-foreground"
            style={{ maskImage: SCOOP_SHEET, WebkitMaskImage: SCOOP_SHEET }}
          >
            {/* Gradient sheen for the lit-from-above 3D feel. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.12), transparent 55%)",
              }}
            />

            <Starburst />

            <div className="relative z-10">
              <h2 className="max-w-[14rem] text-2xl font-bold leading-tight">
                What our members say.
              </h2>

              <span
                aria-hidden
                className="mt-4 block font-serif text-5xl leading-none opacity-60"
              >
                &ldquo;
              </span>

              <p className="mt-2 max-w-[20rem] text-base leading-relaxed text-accent-foreground/90">
                {t.quote}
              </p>

              <div className="mt-4">
                <p className="text-base font-semibold">{t.name}</p>
                <p className="text-sm text-accent-foreground/70">{t.role}</p>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Button
                  isIconOnly
                  type="button"
                  variant="secondary"
                  aria-label="Previous testimonial"
                  className="size-10 rounded-2xl"
                  onPress={() => go(-1)}
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
                    <path d="M14 6l-6 6 6 6 1.4-1.4L10.8 12l4.6-4.6z" />
                  </svg>
                </Button>
                <Button
                  isIconOnly
                  type="button"
                  aria-label="Next testimonial"
                  className="size-10 rounded-2xl"
                  onPress={() => go(1)}
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
                    <path d="M10 6L8.6 7.4 13.2 12l-4.6 4.6L10 18l6-6z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing card — centered, sitting inside the lower portion of the
            sheet and spilling out past its bottom border. */}
        <div className="absolute bottom-[-5rem] left-1/2 z-20 w-[85%] -translate-x-1/2">
          <div className="relative">
            {/* Shadow ancestor: drop-shadow follows the masked silhouette below it
                instead of being clipped by the mask. */}
            <div style={{ filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.30))" }}>
              {/* Mask wrapper carves the same concave top-right scoop. */}
              <div
                className="overflow-hidden rounded-[1.1rem]"
                style={{ maskImage: SCOOP_CARD, WebkitMaskImage: SCOOP_CARD }}
              >
                {/* `light` keeps the card white. HeroUI's card.css is unlayered and
                    wins over Tailwind utilities, so the overrides need `!`. Shadow
                    lives on the ancestor, so this is flat. */}
                <Card
                  variant="default"
                  className="light w-full gap-2! rounded-[1.1rem]! border-0! p-4! shadow-none!"
                >
                  <Card.Header className="gap-0.5">
                    <Card.Title className="text-base! leading-6!">
                      Make persona2 your own
                    </Card.Title>
                    <Card.Description className="text-sm! leading-5!">
                      Be among the first to shape a space built entirely around you.
                    </Card.Description>
                  </Card.Header>
                  <Card.Footer className="gap-2">
                    <div className="flex -space-x-2">
                      {["AL", "RK", "JS"].map((initials, i) => (
                        <Avatar
                          key={initials}
                          size="sm"
                          color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                          className="size-9! ring-2 ring-surface"
                        >
                          <Avatar.Fallback className="text-[0.8rem]!">
                            {initials}
                          </Avatar.Fallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm text-muted">Joined this week</span>
                  </Card.Footer>
                </Card>
              </div>
            </div>

            {/* Dark sparkle badge centered on the corner so it nestles into the
                concave scoop (sibling of the mask wrapper so it isn't clipped). */}
            <div
              className="absolute -right-2 -top-2 z-10 flex size-11 items-center justify-center rounded-full text-white shadow-lg"
              style={{ background: DARK_BASE }}
            >
              <SparkleIcon />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
