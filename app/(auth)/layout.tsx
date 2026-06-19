import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full bg-background lg:grid-cols-2">
      {/* Left: background image (hidden on mobile). */}
      <section className="relative hidden overflow-hidden bg-surface lg:flex">
        <Image
          src="/signupBackground/background.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </section>

      {/* Right: form column */}
      <section className="relative flex flex-col overflow-hidden bg-surface">
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

        <div className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto px-8 py-6 sm:px-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </section>
    </div>
  );
}
