"use client";

import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InputGroup,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import { useEffect, useState } from "react";

import { usernameSchema } from "@/lib/validation/onboarding";

type Availability =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "error"; reason: string };

interface StepHandleProps {
  username: string;
  usernameError?: string;
  onUsernameChange: (value: string) => void;
}

export function StepHandle({
  username,
  usernameError,
  onUsernameChange,
}: StepHandleProps) {
  // Async result keyed to the value it was fetched for, so we can tell whether
  // the latest input is still being checked.
  const [result, setResult] = useState<{
    value: string;
    available: boolean;
    reason?: string;
  } | null>(null);

  const trimmed = username.trim();
  const parsed = usernameSchema.safeParse(trimmed);
  const normalized = parsed.success ? parsed.data : "";

  // Derive the display status during render (no synchronous setState in effects).
  let availability: Availability;
  if (!trimmed) {
    availability = { status: "idle" };
  } else if (!parsed.success) {
    availability = {
      status: "error",
      reason: parsed.error.issues[0]?.message ?? "Invalid username",
    };
  } else if (result?.value === normalized) {
    availability = result.available
      ? { status: "available" }
      : { status: "error", reason: result.reason ?? "Username unavailable" };
  } else {
    availability = { status: "checking" };
  }

  // Debounced availability check — only the async callback touches state.
  useEffect(() => {
    if (!normalized) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/onboarding/username?value=${encodeURIComponent(normalized)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setResult({
          value: normalized,
          available: !!data.available,
          reason: data.reason,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResult({ value: normalized, available: true });
        }
      }
    }, 450);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [normalized]);

  return (
    <div className="flex flex-col gap-5 text-left">
      <TextField
        fullWidth
        name="username"
        autoComplete="off"
        isInvalid={!!usernameError}
        value={username}
        onChange={onUsernameChange}
      >
        <Label>Username</Label>
        <InputGroup className="[--field-border:var(--border)]">
          <InputGroup.Prefix>
            <span className="text-sm text-muted">@</span>
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="yourname" />
          <InputGroup.Suffix>
            {availability.status === "checking" ? (
              <Spinner size="sm" color="current" />
            ) : availability.status === "available" ? (
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="size-4 text-success"
              />
            ) : availability.status === "error" ? (
              <HugeiconsIcon icon={Cancel01Icon} className="size-4 text-danger" />
            ) : null}
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>

      {/* Fixed-height message slot so showing an error never resizes the card. */}
      <p className="-mt-3 min-h-[1.25rem] text-xs text-danger">
        {usernameError ??
          (availability.status === "error" ? availability.reason : "")}
      </p>
    </div>
  );
}
