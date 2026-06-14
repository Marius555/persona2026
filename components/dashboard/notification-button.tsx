"use client";

import {
  CheckmarkCircle01Icon,
  Notification03Icon,
  ChartBarIncreasingIcon,
  AiBrain01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge, Button, Popover, Separator } from "@heroui/react";

const NOTIFICATIONS = [
  {
    id: "1",
    icon: AiBrain01Icon,
    iconColor: "text-accent",
    title: "Welcome to persona2!",
    description: "Complete your profile to unlock all features.",
    time: "5 min ago",
  },
  {
    id: "2",
    icon: CheckmarkCircle01Icon,
    iconColor: "text-success",
    title: "Your AI persona is ready",
    description: "Start configuring your bot goal in settings.",
    time: "1 hr ago",
  },
  {
    id: "3",
    icon: ChartBarIncreasingIcon,
    iconColor: "text-warning",
    title: "Analytics update",
    description: "Your dashboard is live. Check your stats below.",
    time: "2 hrs ago",
  },
] as const;

export function NotificationButton() {
  return (
    <Badge.Anchor>
      <Popover>
        <Button isIconOnly variant="tertiary" aria-label="View notifications">
          <HugeiconsIcon icon={Notification03Icon} className="size-5" />
        </Button>
        <Popover.Content placement="bottom end" className="w-80">
          <Popover.Dialog>
            <Popover.Heading className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Notifications</span>
              <span className="text-xs text-muted">3 unread</span>
            </Popover.Heading>
            <div className="mt-3 flex flex-col">
              {NOTIFICATIONS.map((n, i) => (
                <div key={n.id}>
                  {i > 0 && <Separator className="my-2 " />}
                  <div className="flex items-start gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-default/40 cursor-pointer">
                    <div className={`mt-0.5 shrink-0 ${n.iconColor}`}>
                      <HugeiconsIcon icon={n.icon} className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{n.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
      <Badge color="danger" size="sm" placement="top-right">
        3
      </Badge>
    </Badge.Anchor>
  );
}
