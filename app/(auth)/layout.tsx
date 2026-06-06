import { TestimonialPanel } from "@/components/auth/testimonial-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full place-items-center bg-background p-4">
      {/* No overflow-hidden here so the testimonial sheet can poke above the top
          edge; bg-surface is shared by both columns so they read as one surface. */}
      <div className="relative grid h-[min(760px,calc(100vh-2rem))] w-full max-w-6xl rounded-3xl border border-border bg-surface shadow-xl lg:grid-cols-2">
        {/* Left: form column (light) */}
        <section className="relative flex flex-col overflow-hidden rounded-l-3xl bg-surface">
          {/* Subtle accent glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 55% at 80% 50%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)",
            }}
          />

          <div className="relative z-10 px-8 pt-8 sm:px-12">
            <span className="text-lg font-bold tracking-tight text-foreground">
              persona2
            </span>
          </div>

          <div className="relative z-10 flex flex-1 items-center overflow-y-auto px-8 py-6 sm:px-12">
            <div className="w-full max-w-sm">{children}</div>
          </div>
        </section>

        {/* Right: testimonial column */}
        <TestimonialPanel className="hidden lg:flex" />
      </div>
    </div>
  );
}
