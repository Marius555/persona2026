"use client";

import {
  Cancel01Icon,
  PlayCircleIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { ScrollArrow } from "../../scroll-arrow";
import { useScrollArrows } from "../../use-scroll-arrows";
import type { MediaType } from "@/lib/validation/content";

export interface MediaPreview {
  url: string;
  mediaType: MediaType;
}

interface MediaFilesStepProps {
  previews: MediaPreview[];
  error?: string;
  /** Raw picked files — the parent validates and stages them. */
  onAddFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
}

/**
 * The media picker: a single horizontal line of equal-sized thumbnails with the
 * "+ Add" tile trailing on the right. The row scrolls (with left/right arrows on
 * overflow) so every upload stays on one line, and tiles animate in/out — the
 * "+ Add" tile keeps its size and slides as files are added. No drag-and-drop.
 */
export function MediaFilesStep({
  previews,
  error,
  onAddFiles,
  onRemove,
}: MediaFilesStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollerRef, contentRef, overflow, scrollByDir } = useScrollArrows();

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length) onAddFiles(picked);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleInput}
      />

      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto scrollbar-hide py-1"
        >
          <motion.div
            ref={contentRef}
            layout={!reduceMotion}
            className="mx-auto flex flex-nowrap gap-3"
          >
            <AnimatePresence initial={false}>
              {previews.map((item, i) => (
                <motion.div
                  key={item.url}
                  layout={!reduceMotion}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={transition}
                  className="relative size-28 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-secondary"
                >
                  {item.mediaType === "video" ? (
                    <>
                      <video
                        src={item.url}
                        className="size-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <span className="pointer-events-none absolute inset-0 grid place-items-center text-overlay-foreground/90">
                        <HugeiconsIcon icon={PlayCircleIcon} className="size-6" />
                      </span>
                    </>
                  ) : (
                    <span
                      className="block size-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.url})` }}
                    />
                  )}
                  <button
                    type="button"
                    aria-label="Remove file"
                    onClick={() => onRemove(i)}
                    className="absolute right-1.5 top-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-overlay/80 text-overlay-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              type="button"
              aria-label="Add files"
              onClick={openPicker}
              layout={!reduceMotion}
              transition={transition}
              className="flex size-28 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-gradient-to-b from-surface-secondary/60 to-surface-secondary/30 text-muted outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-7 text-accent" />
              <span className="text-xs font-medium">Add</span>
            </motion.button>
          </motion.div>
        </div>

        {overflow.left ? (
          <ScrollArrow dir={-1} onPress={() => scrollByDir(-1)} />
        ) : null}
        {overflow.right ? (
          <ScrollArrow dir={1} onPress={() => scrollByDir(1)} />
        ) : null}
      </div>

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
