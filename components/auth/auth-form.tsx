"use client";

import {
  LockPasswordIcon,
  Mail01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  Link,
  Spinner,
  TextField,
  toast,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SocialButtons } from "@/components/auth/social-buttons";
import {
  type FieldErrors,
  loginSchema,
  signupSchema,
} from "@/lib/validation/auth";

type Mode = "login" | "signup";

const COPY: Record<
  Mode,
  {
    title: string;
    subtitle: string;
    submit: string;
    pending: string;
    altText: string;
    altLabel: string;
    altHref: string;
  }
> = {
  login: {
    title: "Welcome back",
    subtitle: "Please enter your account details.",
    submit: "Sign in",
    pending: "Signing in…",
    altText: "",
    altLabel: "Create an account",
    altHref: "/signup",
  },
  signup: {
    title: "Create your account",
    subtitle: "Get started with persona2 in seconds.",
    submit: "Sign up",
    pending: "Creating account…",
    altText: "Already have an account?",
    altLabel: "Sign in",
    altHref: "/login",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const schema = isSignup ? signupSchema : loginSchema;
    const values = isSignup ? { email, password, confirm } : { email, password };
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        router.push(isSignup ? "/onboarding" : "/");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => null);
      if (data?.fieldErrors) {
        setErrors(data.fieldErrors as FieldErrors);
      } else {
        toast.danger(data?.error ?? "Something went wrong. Please try again.");
      }
      setIsLoading(false);
    } catch {
      toast.danger("Unable to reach the server. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {copy.title}
        </h1>
        <p className="text-sm text-muted">{copy.subtitle}</p>
      </header>

      <Form
        className="flex flex-col gap-5"
        validationBehavior="aria"
        onSubmit={handleSubmit}
      >
        <TextField
          fullWidth
          name="email"
          type="email"
          autoComplete="email"
          isInvalid={!!errors.email}
          value={email}
          onChange={(value) => {
            setEmail(value);
            clearFieldError("email");
          }}
        >
          <Label>Email</Label>
          <InputGroup>
            <InputGroup.Prefix>
              <HugeiconsIcon icon={Mail01Icon} className="size-4 text-muted" />
            </InputGroup.Prefix>
            <InputGroup.Input placeholder="johndoe@gmail.com" />
          </InputGroup>
          {errors.email ? <FieldError>{errors.email}</FieldError> : null}
        </TextField>

        <TextField
          fullWidth
          name="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          isInvalid={!!errors.password}
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearFieldError("password");
          }}
        >
          <Label>Password</Label>
          <InputGroup>
            <InputGroup.Prefix>
              <HugeiconsIcon
                icon={LockPasswordIcon}
                className="size-4 text-muted"
              />
            </InputGroup.Prefix>
            <InputGroup.Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
            />
            <InputGroup.Suffix className="pr-0">
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onPress={() => setShowPassword((v) => !v)}
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                  className="size-4"
                />
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
          {errors.password ? <FieldError>{errors.password}</FieldError> : null}
        </TextField>

        {isSignup ? (
          <TextField
            fullWidth
            name="confirm"
            autoComplete="new-password"
            isInvalid={!!errors.confirm}
            value={confirm}
            onChange={(value) => {
              setConfirm(value);
              clearFieldError("confirm");
            }}
          >
            <Label>Confirm password</Label>
            <InputGroup>
              <InputGroup.Prefix>
                <HugeiconsIcon
                  icon={LockPasswordIcon}
                  className="size-4 text-muted"
                />
              </InputGroup.Prefix>
              <InputGroup.Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
              />
              <InputGroup.Suffix className="pr-0">
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onPress={() => setShowConfirm((v) => !v)}
                >
                  <HugeiconsIcon
                    icon={showConfirm ? ViewOffSlashIcon : ViewIcon}
                    className="size-4"
                  />
                </Button>
              </InputGroup.Suffix>
            </InputGroup>
            {errors.confirm ? <FieldError>{errors.confirm}</FieldError> : null}
          </TextField>
        ) : null}

        {!isSignup ? (
          <div className="-mt-1 flex justify-end">
            <Link href="#" className="text-sm">
              Forgot password?
            </Link>
          </div>
        ) : null}

        <Button
          className="w-full"
          size="lg"
          type="submit"
          isPending={isLoading}
        >
          {({ isPending }) => (
            <>
              {isPending ? <Spinner color="current" size="sm" /> : null}
              {isPending ? copy.pending : copy.submit}
            </>
          )}
        </Button>
      </Form>

      <SocialButtons />

      <p className="text-center text-sm text-muted">
        {copy.altText ? `${copy.altText} ` : null}
        <Link href={copy.altHref} className="font-medium">
          {copy.altLabel}
        </Link>
      </p>
    </div>
  );
}
