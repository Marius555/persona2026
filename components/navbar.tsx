import { AiBrain01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Avatar } from "@heroui/react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/appwrite/config";
import { STORAGE_ID } from "@/lib/appwrite/db";
import { getProfileByUserId } from "@/lib/appwrite/profile";
import { getLoggedInUser } from "@/lib/appwrite/server";

function fileViewUrl(fileId: string | null | undefined): string | null {
  if (!fileId) return null;
  return `${APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

function initialsOf(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export async function Navbar() {
  const user = await getLoggedInUser();

  let avatarUrl: string | null = null;
  let initials = "";
  let dashboardHref = "/";

  if (user) {
    const profile = await getProfileByUserId(user.$id);
    avatarUrl = fileViewUrl(profile?.avatarFileId);
    const displayName = user.name || profile?.username || user.email.split("@")[0] || "";
    initials = initialsOf(displayName, user.email);
    dashboardHref = `/auth/${user.$id}/dashboard`;
  }

  return (
    <header className="relative z-10 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-lg shadow-accent/30">
            <HugeiconsIcon icon={AiBrain01Icon} className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">persona2</span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <Link
              href={dashboardHref}
              className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Avatar size="sm" aria-label="Go to dashboard">
                {avatarUrl ? <Avatar.Image alt="User avatar" src={avatarUrl} /> : null}
                <Avatar.Fallback delayMs={avatarUrl ? 600 : 0}>{initials}</Avatar.Fallback>
              </Avatar>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-8 items-center justify-center rounded-full px-3 text-sm font-medium text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-8 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
