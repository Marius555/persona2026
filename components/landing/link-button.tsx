import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { buttonVariants } from "@heroui/react";
import Link from "next/link";

/*
 * The single CTA style for the landing page: a Next.js Link styled with HeroUI's
 * button classes. Fully rounded for mobile, and hover is neutralized by pinning
 * `--button-bg-hover` to the base color (the page uses no hover effects).
 */

type LinkButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  withArrow?: boolean;
  className?: string;
};

const NO_HOVER: Record<NonNullable<LinkButtonProps["variant"]>, string> = {
  primary: "[--button-bg-hover:var(--accent)]",
  outline: "[--button-bg-hover:transparent]",
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  withArrow = false,
  className = "",
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${buttonVariants({ variant, size: "lg" })} group !rounded-full px-7 font-semibold ${NO_HOVER[variant]} ${className}`}
    >
      {children}
      {withArrow ? (
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" aria-hidden />
      ) : null}
    </Link>
  );
}
