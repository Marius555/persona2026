"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Coins01Icon,
  Comment01Icon,
  Diamond01Icon,
  DiscountTag01Icon,
  GiftIcon,
  Image01Icon,
  Clock01Icon,
  Location01Icon,
  PencilEdit02Icon,
  PercentIcon,
  PlusSignIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button, Spinner, toast } from "@heroui/react";
import { getLocalTimeZone, now, type DateValue } from "@internationalized/date";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  OFFER_META,
  type ContentCategory,
  type FileItem,
  type OfferItem,
  type OfferType,
  type StagedContent,
  type VaultItem,
} from "../content-meta";
import type {
  ContentRarity,
  ContentTier,
  MediaType,
} from "@/lib/validation/content";
import { EventDateStep } from "./fields/event-date-step";
import {
  MediaFilesStep,
  type MediaPreview,
} from "./fields/media-files-step";
import { NumberFieldStep } from "./fields/number-field-step";
import { RarityStep } from "./fields/rarity-step";
import { TextAreaStep } from "./fields/textarea-step";
import { TextFieldStep } from "./fields/text-field-step";
import { FlowShell } from "./flow-shell";
import { FlowStepper } from "./flow-stepper";
import { StepPublishing } from "./steps/step-publishing";
import { StepType } from "./steps/step-type";

/** One field on its own step: a centered icon + title, then a single control. */
interface WizardStep {
  id: string;
  icon: IconSvgElement;
  title: string;
  /** Optional one-line helper under the title. */
  subtitle?: string;
  render: () => React.ReactNode;
  /** Returns an error message to block Continue, or null when valid. */
  validate?: () => string | null;
}

interface AddContentFlowProps {
  /** Pre-select a category and jump straight to its first field step. */
  initialCategory?: ContentCategory | null;
  /** Tier of the active collection (mirrors the page's tier Select). */
  defaultTier?: ContentTier;
  /** Collection to pre-select (the active tab), or null for none. */
  defaultCollectionId?: string | null;
  /** Newly published vault items, newest first — prepended to the library. */
  onPublished: (items: VaultItem[]) => void;
  /**
   * Staging mode (onboarding): instead of uploading + publishing, hand the
   * fully-built item back to the parent to persist later. When set, the wizard
   * skips the publish/terminal phase and the final button reads "Add".
   */
  onStage?: (item: StagedContent) => void;
  onClose: () => void;
}

const MAX_FILES = 20;

/** POST one file to storage, returning its id. */
async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", "content");
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Upload failed");
  }
  const data = await res.json();
  return data.fileId as string;
}

/**
 * The unified add-to-vault wizard. Drives an onboarding-style, one-field-per-step
 * flow (type chooser → category fields → distribution → publish) inside a
 * responsive modal / bottom-drawer shell, with a layout-animated body so the
 * overlay resizes smoothly between steps.
 */
export function AddContentFlow({
  initialCategory = null,
  defaultTier = "exclusive",
  defaultCollectionId = null,
  onPublished,
  onStage,
  onClose,
}: AddContentFlowProps) {
  const reduceMotion = useReducedMotion();
  const staging = !!onStage;

  const [category, setCategory] = useState<ContentCategory | null>(
    initialCategory,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  // 1 = moving forward, -1 = moving back. Drives the slide direction.
  const [direction, setDirection] = useState(1);

  // Media batch
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<MediaPreview[]>([]);

  // Shared text (media + offers)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Offer-specific
  const [discountPercent, setDiscountPercent] = useState(20);
  const [eventAt, setEventAt] = useState<DateValue | null>(null);
  const [eventLocation, setEventLocation] = useState("");

  // Distribution — tier and collection are locked to where the + was pressed.
  const [tier] = useState<ContentTier>(defaultTier);
  const [rarity, setRarity] = useState<ContentRarity>("common");
  const [tokenValue, setTokenValue] = useState(0);
  const [collectionId] = useState<string | null>(defaultCollectionId);

  // Publish
  const [phase, setPhase] = useState<"idle" | "publishing" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const objectUrls = useRef<string[]>([]);
  useEffect(() => () => objectUrls.current.forEach(URL.revokeObjectURL), []);

  const isPublishing = phase === "publishing";

  /** Clear any pending step error (call from validated fields' onChange). */
  function clearError() {
    setStepError((e) => (e ? null : e));
  }

  // --- file staging ---------------------------------------------------------

  function stageFiles(raw: File[]) {
    const valid = raw.filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (valid.length < raw.length) {
      toast.danger("Only images and video clips are supported.");
    }
    if (!valid.length) return;

    const room = MAX_FILES - files.length;
    if (room <= 0) {
      toast.danger(`You can add up to ${MAX_FILES} files at a time.`);
      return;
    }
    const accepted = valid.slice(0, room);
    const staged = accepted.map<MediaPreview>((f) => ({
      url: URL.createObjectURL(f),
      mediaType: f.type.startsWith("video") ? "video" : "image",
    }));
    objectUrls.current.push(...staged.map((s) => s.url));

    setFiles((prev) => [...prev, ...accepted]);
    setPreviews((prev) => [...prev, ...staged]);
    clearError();
  }

  function removeFile(index: number) {
    const url = previews[index]?.url;
    if (url) {
      URL.revokeObjectURL(url);
      objectUrls.current = objectUrls.current.filter((u) => u !== url);
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // --- step list ------------------------------------------------------------

  /** A title field shared by the offer categories (required). */
  function titleStep(icon: IconSvgElement, placeholder: string): WizardStep {
    return {
      id: "title",
      icon,
      title: "Give it a title",
      validate: () => (title.trim() ? null : "Add a title."),
      render: () => (
        <TextFieldStep
          label="Title"
          placeholder={placeholder}
          value={title}
          onChange={(v) => {
            setTitle(v);
            clearError();
          }}
          error={stepError ?? undefined}
          autoFocus
        />
      ),
    };
  }

  /** A description / details field (optional unless `required`). */
  function descriptionStep(
    title: string,
    label: string,
    placeholder: string,
    icon: IconSvgElement,
    required = false,
  ): WizardStep {
    return {
      id: "description",
      icon,
      title,
      validate: required
        ? () => (description.trim() ? null : "Add a few details.")
        : undefined,
      render: () => (
        <TextAreaStep
          label={label}
          placeholder={placeholder}
          value={description}
          onChange={(v) => {
            setDescription(v);
            clearError();
          }}
          error={required ? stepError ?? undefined : undefined}
          autoFocus
        />
      ),
    };
  }

  /** Build the ordered step list for the chosen category + tier. */
  function buildSteps(): WizardStep[] {
    if (!category) return [];
    const steps: WizardStep[] = [];

    if (category === "media") {
      steps.push({
        id: "media-files",
        icon: Image01Icon,
        title: "Add your media",
        validate: () => (files.length ? null : "Add at least one file."),
        render: () => (
          <MediaFilesStep
            previews={previews}
            error={stepError ?? undefined}
            onAddFiles={stageFiles}
            onRemove={removeFile}
          />
        ),
      });
      steps.push({
        id: "media-title",
        icon: TextFontIcon,
        title: "Give it a title",
        render: () => (
          <TextFieldStep
            label="Title (optional)"
            placeholder="e.g. Beach shoot — behind the scenes"
            value={title}
            onChange={setTitle}
            description="Shown to fans. Applies to all files in this batch."
            autoFocus
          />
        ),
      });
      steps.push(
        descriptionStep(
          "Add a description",
          "Description (optional)",
          "Tease what fans are unlocking…",
          Comment01Icon,
        ),
      );
    } else if (category === "discount") {
      steps.push(titleStep(DiscountTag01Icon, "e.g. 30% off your first month"));
      steps.push({
        id: "discount-amount",
        icon: PercentIcon,
        title: "How much off?",
        render: () => (
          <NumberFieldStep
            label="Discount"
            value={discountPercent}
            onChange={setDiscountPercent}
            minValue={1}
            maxValue={100}
            step={1}
            description="Percentage off a subscription or purchase."
          />
        ),
      });
      steps.push(
        descriptionStep(
          "Add details",
          "Details (optional)",
          "What it applies to, any conditions…",
          Comment01Icon,
        ),
      );
    } else if (category === "event") {
      steps.push(titleStep(Calendar03Icon, "e.g. Friday night live stream"));
      steps.push({
        id: "event-when",
        icon: Clock01Icon,
        title: "When is it?",
        validate: () => {
          if (!eventAt) return "Pick a date and time.";
          if (eventAt.compare(now(getLocalTimeZone())) < 0)
            return "Pick a date and time in the future.";
          return null;
        },
        render: () => (
          <EventDateStep
            value={eventAt}
            onChange={(v) => {
              setEventAt(v);
              clearError();
            }}
            minValue={now(getLocalTimeZone())}
            error={stepError ?? undefined}
          />
        ),
      });
      steps.push({
        id: "event-where",
        icon: Location01Icon,
        title: "Where is it?",
        render: () => (
          <TextFieldStep
            label="Location (optional)"
            placeholder="A link or place"
            value={eventLocation}
            onChange={setEventLocation}
            autoFocus
          />
        ),
      });
      steps.push(
        descriptionStep(
          "Add details",
          "Details (optional)",
          "What fans can expect…",
          Comment01Icon,
        ),
      );
    } else if (category === "perk") {
      steps.push(titleStep(GiftIcon, "e.g. Personal video shoutout"));
      steps.push(
        descriptionStep(
          "What do fans get?",
          "What fans get",
          "Describe the perk — a DM, a custom request, a shoutout…",
          PencilEdit02Icon,
          true,
        ),
      );
    }

    // Distribution — appended for every category. Tier and collection are
    // fixed to where the + was pressed, so only rarity/price remain.
    if (tier === "gamble") {
      steps.push({
        id: "dist-rarity",
        icon: Diamond01Icon,
        title: "Pick a rarity",
        subtitle: "Rarer drops appear less often and feel more valuable.",
        render: () => <RarityStep rarity={rarity} onChange={setRarity} />,
      });
    }
    // A drop is won, not bought — only the Exclusive tier sets a price.
    if (tier !== "gamble") {
      steps.push({
        id: "dist-value",
        icon: Coins01Icon,
        title: "Set a price",
        subtitle:
          "Tokens are the in-app credits fans buy with real money and spend on your vault.",
        render: () => (
          <NumberFieldStep
            label="Price (tokens)"
            value={tokenValue}
            onChange={setTokenValue}
            minValue={0}
            maxValue={1_000_000}
            step={10}
            description="The starting price — your agent fine-tunes it per fan."
          />
        ),
      });
    }

    return steps;
  }

  const showChooser = category === null;
  const onTerminal = phase !== "idle";
  const steps = buildSteps();
  const safeIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const currentStep = steps[safeIndex];
  const isLast = safeIndex === steps.length - 1;

  const offerLabel =
    category && category !== "media" ? OFFER_META[category].label : "offer";

  // --- navigation -----------------------------------------------------------

  function pickCategory(next: ContentCategory) {
    setDirection(1);
    setCategory(next);
    setStepError(null);
    setStepIndex(0);
  }

  /** Build the staged item from the current field state (staging mode). */
  function buildStaged(): StagedContent | null {
    if (!category) return null;
    const stagedRarity = tier === "gamble" ? rarity : null;
    switch (category) {
      case "media":
        return {
          category: "media",
          title,
          description,
          tokenValue,
          rarity: stagedRarity,
          files: [...files],
          previews: previews.map((p) => ({
            url: p.url,
            mediaType: p.mediaType,
          })),
        };
      case "discount":
        return {
          category: "discount",
          title,
          description,
          tokenValue,
          rarity: stagedRarity,
          discountPercent,
        };
      case "event":
        return {
          category: "event",
          title,
          description,
          tokenValue,
          rarity: stagedRarity,
          eventAt: eventAt?.toString() ?? "",
          eventLocation,
        };
      case "perk":
        return { category: "perk", title, description, tokenValue, rarity: stagedRarity };
    }
  }

  /** Hand the built item to the parent and close, transferring URL ownership. */
  function stageCurrent() {
    const item = buildStaged();
    if (!item) return;
    // The parent now owns the preview object URLs, so don't revoke them here.
    objectUrls.current = [];
    onStage?.(item);
    onClose();
  }

  function goNext() {
    const err = currentStep?.validate?.();
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setDirection(1);
    if (isLast) {
      if (staging) stageCurrent();
      else void publish();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    setStepError(null);
    setDirection(-1);
    if (safeIndex === 0) {
      if (initialCategory) {
        onClose();
        return;
      }
      setCategory(null);
      return;
    }
    setStepIndex((i) => i - 1);
  }

  // --- publish --------------------------------------------------------------

  function sharedTerms() {
    return {
      tier,
      rarity: tier === "gamble" ? rarity : undefined,
      tokenValue,
      collectionId,
    };
  }

  function buildOfferPayload(type: OfferType) {
    const base = { ...sharedTerms(), title: title.trim() };
    switch (type) {
      case "discount":
        return {
          contentType: "discount" as const,
          ...base,
          description: description.trim() || null,
          discountPercent,
        };
      case "event":
        return {
          contentType: "event" as const,
          ...base,
          description: description.trim() || null,
          eventAt: eventAt?.toString() ?? "",
          eventLocation: eventLocation.trim() || null,
        };
      case "perk":
        return {
          contentType: "perk" as const,
          ...base,
          description: description.trim(),
        };
    }
  }

  async function postContent(payload: unknown) {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const firstFieldError = body?.fieldErrors
        ? Object.values(body.fieldErrors)[0]
        : null;
      throw new Error(body?.error ?? firstFieldError ?? "Couldn't publish");
    }
    return res.json();
  }

  async function publishMedia() {
    const built: { fileId: string; mediaType: MediaType }[] = [];
    for (let i = 0; i < files.length; i++) {
      const fileId = await uploadFile(files[i]);
      built.push({ fileId, mediaType: previews[i].mediaType });
      setProgress((i + 1) / (files.length + 1));
    }

    const body = (await postContent({
      contentType: "file",
      ...sharedTerms(),
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      items: built,
    })) as {
      content: Array<{
        $id: string;
        fileId: string | null;
        mediaType: MediaType | null;
        tier: ContentTier;
        rarity: ContentRarity | null;
        tokenValue: number | null;
        title: string | null;
        description: string | null;
      }>;
    };

    const newItems: FileItem[] = body.content.map((row) => ({
      kind: "file",
      fileId: row.fileId ?? "",
      mediaType: row.mediaType ?? "image",
      src: `/api/media/${row.fileId}/file`,
      rowId: row.$id,
      tier: row.tier,
      rarity: row.rarity,
      tokenValue: row.tokenValue,
      collectionId,
      title: row.title,
      description: row.description,
    }));
    onPublished(newItems);
  }

  async function publishOffer(type: OfferType) {
    const body = (await postContent(buildOfferPayload(type))) as {
      content: Array<{
        $id: string;
        contentType: OfferType;
        tier: ContentTier;
        rarity: ContentRarity | null;
        tokenValue: number | null;
        title: string | null;
        description: string | null;
        discountPercent: number | null;
        eventAt: string | null;
        eventLocation: string | null;
      }>;
    };
    const row = body.content[0];
    const offer: OfferItem = {
      kind: "offer",
      id: row.$id,
      contentType: row.contentType,
      tier: row.tier,
      rarity: row.rarity,
      tokenValue: row.tokenValue,
      collectionId,
      title: row.title,
      description: row.description,
      discountPercent: row.discountPercent,
      eventAt: row.eventAt,
      eventLocation: row.eventLocation,
    };
    onPublished([offer]);
  }

  async function publish() {
    if (!category) return;
    setPhase("publishing");
    setProgress(0);
    try {
      if (category === "media") await publishMedia();
      else await publishOffer(category);
      setProgress(1);
      setPhase("done");
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("idle");
    }
  }

  // --- render ---------------------------------------------------------------

  // Directional slide + fade. Forward enters from the right and exits left;
  // Back reverses. The fixed-size, clipped frame keeps both layers contained.
  const offset = reduceMotion ? 0 : 32;
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? offset : -offset, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -offset : offset, opacity: 0 }),
  };
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  const activeKey = onTerminal
    ? "terminal"
    : showChooser
      ? "chooser"
      : currentStep.id;

  function renderActive() {
    if (onTerminal) {
      return (
        <StepPublishing
          category={category ?? "media"}
          phase={phase === "done" ? "done" : "publishing"}
          progress={progress}
          count={files.length}
          offerLabel={offerLabel}
        />
      );
    }
    if (showChooser) {
      return (
        <>
          <StepHeader
            icon={PlusSignIcon}
            title="Add to your vault"
            subtitle="What would you like to share with your fans?"
          />
          <StepType onSelect={pickCategory} />
        </>
      );
    }
    return (
      <>
        <StepHeader
          icon={currentStep.icon}
          title={currentStep.title}
          subtitle={currentStep.subtitle}
        />
        {currentStep.render()}
      </>
    );
  }

  function renderFooter() {
    if (onTerminal) {
      if (phase === "publishing") {
        return (
          <div className="flex items-center justify-center gap-2 px-6 pb-6 pt-3 text-sm text-muted sm:px-8">
            <Spinner size="sm" color="current" />
            {category === "media" ? "Uploading — keep this open." : "Publishing…"}
          </div>
        );
      }
      return (
        <div className="px-6 pb-6 pt-3 sm:px-8">
          <Button className="w-full cursor-pointer" onPress={onClose}>
            View vault
          </Button>
        </div>
      );
    }
    if (showChooser) return null;
    return (
      <div className="flex items-center gap-3 px-6 pb-6 pt-3 sm:px-8">
        <Button variant="ghost" className="cursor-pointer" onPress={goBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Back
        </Button>
        <Button className="ml-auto cursor-pointer" onPress={goNext}>
          {isLast ? (staging ? "Add" : "Publish") : "Continue"}
          {!isLast ? (
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          ) : null}
        </Button>
      </div>
    );
  }

  return (
    <FlowShell
      ariaLabel="Add content"
      isDismissable={!isPublishing}
      onDismiss={onClose}
    >
      <div className="flex min-h-0 flex-col">
        <FlowStepper
          stepIndex={safeIndex}
          totalSteps={onTerminal || showChooser ? 0 : steps.length}
          canClose={!isPublishing}
          onClose={onClose}
        />

        <div className="relative h-[380px] overflow-hidden sm:h-[400px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={activeKey}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden px-6 py-2 sm:px-8"
            >
              <div className="my-auto flex w-full flex-col gap-7">
                {renderActive()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {renderFooter()}
      </div>
    </FlowShell>
  );
}

/** The centered icon + title (+ optional subtitle) that opens every step. */
function StepHeader({
  icon,
  title,
  subtitle,
}: {
  icon: IconSvgElement;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-accent/12 text-accent ring-1 ring-inset ring-accent/15">
        <HugeiconsIcon icon={icon} className="size-7" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto max-w-xs text-balance text-sm leading-relaxed text-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
