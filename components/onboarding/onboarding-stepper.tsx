"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Spinner, toast } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useRouteTransition } from "@/components/transitions/transition-provider";
import type { ProfileRow } from "@/lib/appwrite/profile";
import { dominantGradient } from "@/lib/color/dominant";
import type { BotGoal, Niche } from "@/lib/validation/onboarding";
import {
  botGoalSchema,
  nicheSchema,
  usernameSchema,
} from "@/lib/validation/onboarding";
import { createCollectionRequest } from "@/components/dashboard/content/collections/collection-api";
import { AddContentFlow } from "@/components/dashboard/content/upload-flow/add-content-flow";
import type { StagedContent } from "@/components/dashboard/content/content-meta";
import { NEUTRAL_GRADIENT, PAGE_BACKDROP, STEP_META, TOTAL_STEPS } from "./constants";
import { StepProgressBubbles } from "./step-progress-bubbles";
import { StepContentPool } from "./steps/step-content-pool";
import { StepGoal } from "./steps/step-goal";
import { StepHandle } from "./steps/step-handle";
import { StepNiche } from "./steps/step-niche";
import { StepProfile } from "./steps/step-profile";

interface FormState {
  username: string;
  niche: Niche | null;
  avatarFile: File | null;
  avatarPreview: string | null;
  bannerFile: File | null;
  bannerPreview: string | null;
  contentItems: StagedContent[];
  botGoal: BotGoal | null;
}

/** The default collection every onboarding item is filed under. */
const DEFAULT_COLLECTION_NAME = "First Collection";

async function uploadFile(
  file: File,
  kind: "avatar" | "banner" | "content",
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Upload failed");
  }
  const data = await res.json();
  return data.fileId as string;
}

export function OnboardingStepper({
  initialProfile,
}: {
  initialProfile: ProfileRow | null;
}) {
  const router = useRouter();
  const { navigate } = useRouteTransition();
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; content?: string }>({});
  const [data, setData] = useState<FormState>(() => ({
    username: initialProfile?.username ?? "",
    niche: initialProfile?.niche ?? null,
    avatarFile: null,
    avatarPreview: null,
    bannerFile: null,
    bannerPreview: null,
    contentItems: [],
    botGoal: initialProfile?.botGoal ?? null,
  }));

  // Revoke any object URLs we created when the component unmounts.
  const previewUrls = useRef<Set<string>>(new Set());
  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function trackUrl(url: string) {
    previewUrls.current.add(url);
    return url;
  }
  function dropUrl(url: string | null) {
    if (url) {
      URL.revokeObjectURL(url);
      previewUrls.current.delete(url);
    }
  }

  function advance() {
    setDirection(1);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function handleBack() {
    if (isSubmitting) return;
    setErrors({});
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  }

  // --- file selection handlers ---
  function selectAvatar(file: File) {
    const url = trackUrl(URL.createObjectURL(file));
    setData((d) => {
      dropUrl(d.avatarPreview);
      return { ...d, avatarFile: file, avatarPreview: url };
    });
  }
  function selectBanner(file: File) {
    const url = trackUrl(URL.createObjectURL(file));
    setData((d) => {
      dropUrl(d.bannerPreview);
      return { ...d, bannerFile: file, bannerPreview: url };
    });
  }
  function clearBanner() {
    setData((d) => {
      dropUrl(d.bannerPreview);
      return { ...d, bannerFile: null, bannerPreview: null };
    });
  }

  // --- staged content (from the add-content wizard) ---
  function addStagedItem(item: StagedContent) {
    // The wizard handed us ownership of its preview object URLs; track them so
    // they're revoked on unmount or removal.
    if (item.category === "media") {
      item.previews.forEach((p) => trackUrl(p.url));
    }
    setData((d) => ({ ...d, contentItems: [...d.contentItems, item] }));
    setErrors((e) => ({ ...e, content: undefined }));
    setFlowOpen(false);
  }
  function removeStagedItem(index: number) {
    setData((d) => {
      const item = d.contentItems[index];
      if (item?.category === "media") {
        item.previews.forEach((p) => dropUrl(p.url));
      }
      return {
        ...d,
        contentItems: d.contentItems.filter((_, i) => i !== index),
      };
    });
  }

  /** Persist one staged item as a content row filed under `collectionId`. */
  async function persistStaged(item: StagedContent, collectionId: string) {
    const terms = {
      tier: "gamble" as const,
      rarity: item.rarity,
      tokenValue: item.tokenValue,
      collectionId,
    };
    let payload: Record<string, unknown>;

    if (item.category === "media") {
      const built: { fileId: string; mediaType: "image" | "video" }[] = [];
      for (let i = 0; i < item.files.length; i++) {
        const fileId = await uploadFile(item.files[i], "content");
        built.push({ fileId, mediaType: item.previews[i].mediaType });
      }
      payload = {
        contentType: "file",
        ...terms,
        title: item.title.trim() || undefined,
        description: item.description.trim() || undefined,
        items: built,
      };
    } else if (item.category === "discount") {
      payload = {
        contentType: "discount",
        ...terms,
        title: item.title.trim(),
        description: item.description.trim() || null,
        discountPercent: item.discountPercent,
      };
    } else if (item.category === "event") {
      payload = {
        contentType: "event",
        ...terms,
        title: item.title.trim(),
        description: item.description.trim() || null,
        eventAt: item.eventAt,
        eventLocation: item.eventLocation.trim() || null,
      };
    } else {
      payload = {
        contentType: "perk",
        ...terms,
        title: item.title.trim(),
        description: item.description.trim(),
      };
    }

    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? "Couldn't save your content.");
    }
  }

  async function finish() {
    const usernameOk = usernameSchema.safeParse(data.username);
    if (!usernameOk.success || !data.niche || !data.botGoal || !data.contentItems.length) {
      toast.danger("Please complete the earlier steps first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const avatarFileId = data.avatarFile
        ? await uploadFile(data.avatarFile, "avatar")
        : null;
      const bannerFileId = data.bannerFile
        ? await uploadFile(data.bannerFile, "banner")
        : null;

      // Everything added in the stepper is filed under a default Games collection.
      const collection = await createCollectionRequest(
        "gamble",
        DEFAULT_COLLECTION_NAME,
      );
      for (const item of data.contentItems) {
        await persistStaged(item, collection.id);
      }

      const bgGradient = bannerFileId
        ? null
        : (data.avatarPreview ? await dominantGradient(data.avatarPreview) : null) ??
          NEUTRAL_GRADIENT;

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameOk.data,
          niche: data.niche,
          avatarFileId,
          bannerFileId,
          bgGradient,
          botGoal: data.botGoal,
        }),
      });

      if (res.ok) {
        toast.success("You're all set! Welcome aboard.");
        router.refresh();
        navigate("/");
        return;
      }

      const body = await res.json().catch(() => null);
      if (body?.fieldErrors?.username) {
        setErrors({ username: body.fieldErrors.username });
        setDirection(-1);
        setStep(1);
        toast.danger("That username was just taken — please pick another.");
      } else {
        toast.danger(body?.error ?? "Couldn't finish onboarding.");
      }
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNext() {
    if (isSubmitting) return;
    setErrors({});

    switch (step) {
      case 1: {
        const parsed = usernameSchema.safeParse(data.username);
        if (!parsed.success) {
          setErrors({ username: parsed.error.issues[0]?.message ?? "Invalid username" });
          return;
        }
        advance();
        return;
      }
      case 2: {
        if (!nicheSchema.safeParse(data.niche).success) {
          toast.danger("Pick a niche to continue.");
          return;
        }
        advance();
        return;
      }
      case 3:
        advance(); // profile is optional
        return;
      case 4: {
        if (!data.contentItems.length) {
          setErrors({ content: "Add at least one piece of content." });
          return;
        }
        advance();
        return;
      }
      case 5: {
        if (!botGoalSchema.safeParse(data.botGoal).success) {
          toast.danger("Choose a goal to finish.");
          return;
        }
        void finish();
        return;
      }
    }
  }

  const meta = STEP_META[step - 1];
  const isLastStep = step === TOTAL_STEPS;

  const variants = {
    enter: (dir: number) => ({ x: reduceMotion ? 0 : dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduceMotion ? 0 : dir > 0 ? -48 : 48, opacity: 0 }),
  };
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 32 };

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <StepHandle
            username={data.username}
            usernameError={errors.username}
            onUsernameChange={(value) => {
              setData((d) => ({ ...d, username: value }));
              setErrors((e) => ({ ...e, username: undefined }));
            }}
          />
        );
      case 2:
        return (
          <StepNiche
            value={data.niche}
            onChange={(niche) => setData((d) => ({ ...d, niche }))}
          />
        );
      case 3:
        return (
          <StepProfile
            avatarPreview={data.avatarPreview}
            bannerPreview={data.bannerPreview}
            onAvatarSelect={selectAvatar}
            onBannerSelect={selectBanner}
            onClearBanner={clearBanner}
          />
        );
      case 4:
        return (
          <StepContentPool
            items={data.contentItems}
            error={errors.content}
            onAdd={() => setFlowOpen(true)}
            onRemove={removeStagedItem}
          />
        );
      case 5:
        return (
          <StepGoal
            value={data.botGoal}
            onChange={(botGoal) => setData((d) => ({ ...d, botGoal }))}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: PAGE_BACKDROP }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 max-sm:p-0">
        <motion.div
          layout={!reduceMotion}
          transition={{
            layout: reduceMotion
              ? { duration: 0 }
              : { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
          }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface shadow-xl max-sm:flex max-sm:min-h-screen max-sm:max-w-none max-sm:flex-col max-sm:justify-center max-sm:rounded-none max-sm:border-0 max-sm:shadow-none"
        >
          <StepProgressBubbles
            current={step}
            total={TOTAL_STEPS}
            className="absolute right-5 top-5 z-10"
          />

          <div className="flex flex-col gap-6 p-7 sm:p-9 max-sm:flex-1 max-sm:justify-center">
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="flex flex-col gap-6"
              >
                <header className="flex flex-col items-center gap-3 text-center">
                  <span className="grid size-16 place-items-center rounded-2xl bg-accent/12 text-accent">
                    <HugeiconsIcon icon={meta.icon} className="size-8" />
                  </span>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {meta.title}
                  </h1>
                </header>
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Footer controls (stay put while step content animates) */}
            <div className="flex items-center gap-3 pt-1 max-sm:mt-auto">
              {step > 1 ? (
                <Button
                  className="cursor-pointer"
                  variant="ghost"
                  onPress={handleBack}
                  isDisabled={isSubmitting}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                  Back
                </Button>
              ) : null}
              <div className="ml-auto flex items-center gap-3">
                <Button
                  className="cursor-pointer"
                  onPress={handleNext}
                  isPending={isSubmitting}
                >
                  {({ isPending }) => (
                    <>
                      {isPending ? <Spinner color="current" size="sm" /> : null}
                      {isLastStep ? "Finish setup" : "Continue"}
                      {!isPending && !isLastStep ? (
                        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                      ) : null}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>

      {flowOpen ? (
        <AddContentFlow
          defaultTier="gamble"
          defaultCollectionId={null}
          onPublished={() => {}}
          onStage={addStagedItem}
          onClose={() => setFlowOpen(false)}
        />
      ) : null}
    </>
  );
}
