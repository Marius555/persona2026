"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  CloudUploadIcon,
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
  SparklesIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button, Spinner, toast } from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  OFFER_META,
  type ContentCategory,
  type FileItem,
  type OfferItem,
  type OfferType,
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
import { TierStep } from "./fields/tier-step";
import { FlowShell } from "./flow-shell";
import { FlowStepper } from "./flow-stepper";
import { StepPublishing } from "./steps/step-publishing";
import { StepType } from "./steps/step-type";

/** One field on its own step: a centered icon + title, then a single control. */
interface WizardStep {
  id: string;
  icon: IconSvgElement;
  title: string;
  render: () => React.ReactNode;
  /** Returns an error message to block Continue, or null when valid. */
  validate?: () => string | null;
}

interface AddContentFlowProps {
  /** Pre-select a category and jump straight to its first field step. */
  initialCategory?: ContentCategory | null;
  /** Newly published vault items, newest first — prepended to the library. */
  onPublished: (items: VaultItem[]) => void;
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
  onPublished,
  onClose,
}: AddContentFlowProps) {
  const reduceMotion = useReducedMotion();

  const [category, setCategory] = useState<ContentCategory | null>(
    initialCategory,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

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

  // Distribution
  const [tier, setTier] = useState<ContentTier>("exclusive");
  const [rarity, setRarity] = useState<ContentRarity>("common");
  const [tokenValue, setTokenValue] = useState(0);

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

  function resetForAnother() {
    objectUrls.current.forEach(URL.revokeObjectURL);
    objectUrls.current = [];
    setFiles([]);
    setPreviews([]);
    setTitle("");
    setDescription("");
    setDiscountPercent(20);
    setEventAt(null);
    setEventLocation("");
    setTier("exclusive");
    setRarity("common");
    setTokenValue(0);
    setStepError(null);
    setPhase("idle");
    setProgress(0);
    setDirection(1);
    setCategory(null);
    setStepIndex(0);
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
            step={5}
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
        validate: () => (eventAt ? null : "Pick a date and time."),
        render: () => (
          <EventDateStep
            value={eventAt}
            onChange={(v) => {
              setEventAt(v);
              clearError();
            }}
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

    // Distribution — appended for every category.
    steps.push({
      id: "dist-tier",
      icon: SparklesIcon,
      title: "How do fans get this?",
      render: () => <TierStep tier={tier} onChange={setTier} />,
    });
    if (tier === "gamble") {
      steps.push({
        id: "dist-rarity",
        icon: Diamond01Icon,
        title: "Pick a rarity",
        render: () => <RarityStep rarity={rarity} onChange={setRarity} />,
      });
    }
    steps.push({
      id: "dist-value",
      icon: Coins01Icon,
      title: tier === "gamble" ? "Set the pot value" : "Set a price",
      render: () => (
        <NumberFieldStep
          label={tier === "gamble" ? "Pot value (tokens)" : "Price (tokens)"}
          value={tokenValue}
          onChange={setTokenValue}
          minValue={0}
          maxValue={1_000_000}
          step={10}
          description={
            tier === "gamble"
              ? "Tokens this drop is worth when a fan wins it."
              : "Starting token price — the agent adapts it per fan."
          }
        />
      ),
    });

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
    setCategory(next);
    setStepError(null);
    setDirection(1);
    setStepIndex(0);
  }

  function goNext() {
    const err = currentStep?.validate?.();
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    if (isLast) {
      void publish();
      return;
    }
    setDirection(1);
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    setStepError(null);
    if (safeIndex === 0) {
      if (initialCategory) {
        onClose();
        return;
      }
      setDirection(-1);
      setCategory(null);
      return;
    }
    setDirection(-1);
    setStepIndex((i) => i - 1);
  }

  // --- publish --------------------------------------------------------------

  function sharedTerms() {
    return {
      tier,
      rarity: tier === "gamble" ? rarity : undefined,
      tokenValue,
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

    await postContent({
      contentType: "file",
      ...sharedTerms(),
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      items: built,
    });

    const newItems: FileItem[] = built.map((it) => ({
      kind: "file",
      fileId: it.fileId,
      mediaType: it.mediaType,
      src: `/api/media/${it.fileId}/file`,
    }));
    onPublished(newItems);
  }

  async function publishOffer(type: OfferType) {
    const body = (await postContent(buildOfferPayload(type))) as {
      content: Array<{
        $id: string;
        contentType: OfferType;
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
    setDirection(1);
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

  const variants = {
    enter: (dir: number) => ({
      x: reduceMotion ? 0 : dir > 0 ? 48 : -48,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: reduceMotion ? 0 : dir > 0 ? -48 : 48,
      opacity: 0,
    }),
  };
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 32 };

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
          previews={previews}
          offerLabel={offerLabel}
        />
      );
    }
    if (showChooser) {
      return (
        <>
          <StepHeader icon={PlusSignIcon} title="Add to your vault" />
          <StepType onSelect={pickCategory} />
        </>
      );
    }
    return (
      <>
        <StepHeader icon={currentStep.icon} title={currentStep.title} />
        {currentStep.render()}
      </>
    );
  }

  function renderFooter() {
    if (onTerminal) {
      if (phase === "publishing") {
        return (
          <div className="flex items-center justify-center gap-2 px-6 pb-6 pt-2 text-sm text-muted">
            <Spinner size="sm" color="current" />
            {category === "media" ? "Uploading — keep this open." : "Publishing…"}
          </div>
        );
      }
      return (
        <div className="flex items-center gap-3 px-6 pb-6 pt-2">
          <Button
            variant="ghost"
            className="cursor-pointer"
            onPress={resetForAnother}
          >
            <HugeiconsIcon icon={CloudUploadIcon} className="size-4" />
            Add more
          </Button>
          <Button className="ml-auto cursor-pointer" onPress={onClose}>
            View vault
          </Button>
        </div>
      );
    }
    if (showChooser) return null;
    return (
      <div className="flex items-center gap-3 px-6 pb-6 pt-2">
        <Button variant="ghost" className="cursor-pointer" onPress={goBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Back
        </Button>
        <Button className="ml-auto cursor-pointer" onPress={goNext}>
          {isLast ? "Publish" : "Continue"}
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
      <motion.div
        layout={!reduceMotion}
        transition={{
          layout: reduceMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        }}
        className="flex min-h-0 flex-col"
      >
        <FlowStepper
          stepIndex={safeIndex}
          totalSteps={onTerminal || showChooser ? 0 : steps.length}
          canClose={!isPublishing}
          onClose={onClose}
        />

        <div className="max-h-[68vh] overflow-y-auto overflow-x-hidden px-6 pb-2 pt-1">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={activeKey}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col gap-6"
            >
              {renderActive()}
            </motion.div>
          </AnimatePresence>
        </div>

        {renderFooter()}
      </motion.div>
    </FlowShell>
  );
}

/** The centered icon + title that opens every step (onboarding pattern). */
function StepHeader({
  icon,
  title,
}: {
  icon: IconSvgElement;
  title: string;
}) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-accent/12 text-accent">
        <HugeiconsIcon icon={icon} className="size-8" />
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
    </header>
  );
}
