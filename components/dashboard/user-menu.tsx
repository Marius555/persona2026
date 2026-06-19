"use client";

import { Logout01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { Avatar, Dropdown, Label, toast } from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Separator } from '@heroui/react';

import { useRouteTransition } from "@/components/transitions/transition-provider";

export interface UserMenuProps {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

/** Two-letter initials derived from the display name (falls back to email). */
function initialsOf(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({ userId, displayName, email, avatarUrl }: UserMenuProps) {
  const router = useRouter();
  const { navigate } = useRouteTransition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const initials = initialsOf(displayName, email);

  async function handleAction(key: React.Key) {
    switch (key) {
      case "settings":
        navigate(`/auth/${userId}/dashboard/settings`);
        return;
      case "logout": {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
          const res = await fetch("/api/auth/logout", { method: "POST" });
          if (!res.ok) throw new Error();
          router.refresh();
          navigate("/login");
        } catch {
          setIsLoggingOut(false);
          toast.danger("Couldn't log you out. Please try again.");
        }
        return;
      }
    }
  }

  return (
    <Dropdown>
      <Dropdown.Trigger className="cursor-pointer rounded-full outline-none">
        <Avatar size="sm" aria-label={displayName}>
          {avatarUrl ? <Avatar.Image alt={displayName} src={avatarUrl} /> : null}
          <Avatar.Fallback delayMs={avatarUrl ? 600 : 0}>{initials}</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-[15rem]">
        <div className="flex items-center gap-2 px-3 pt-3 pb-1">
          <Avatar size="sm" aria-label={displayName}>
            {avatarUrl ? <Avatar.Image alt={displayName} src={avatarUrl} /> : null}
            <Avatar.Fallback delayMs={avatarUrl ? 600 : 0}>{initials}</Avatar.Fallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0">
            <p className="truncate text-sm leading-5 font-medium text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs leading-none text-muted">{email}</p>
          </div>
        </div>
        <Dropdown.Menu onAction={handleAction} disabledKeys={isLoggingOut ? ["logout"] : []}>
          <Separator />
          <Dropdown.Item id="settings" textValue="Settings">
            <div className="flex w-full items-center justify-between gap-2">
              <Label>Settings</Label>
              <HugeiconsIcon icon={Settings01Icon} className="size-3.5 text-muted" />
            </div>
          </Dropdown.Item>
          <Separator />
          <Dropdown.Item id="logout" textValue="Log out" variant="danger">
            <div className="flex w-full items-center justify-between gap-2">
              <Label>Log out</Label>
              <HugeiconsIcon icon={Logout01Icon} className="size-3.5 text-danger" />
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
