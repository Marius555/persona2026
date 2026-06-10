import { AiBrain01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <HugeiconsIcon icon={AiBrain01Icon} className="size-3.5" aria-hidden />
              </div>
              <span className="font-semibold text-foreground">persona2</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              AI-powered personas for creators who want to do more with less.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Product</p>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/signup">Get started</Link>
              </li>
              <li>
                <Link href="/login">Sign in</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Company</p>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>About</li>
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Support</p>
              <ul className="space-y-2.5 text-sm text-muted">
                <li>Help Center</li>
                <li>Contact</li>
              </ul>
            </div>
            <p className="mt-6 text-xs text-muted">© {new Date().getFullYear()} persona2</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
