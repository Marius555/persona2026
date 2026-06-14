"use client";

import {
  Cancel01Icon,
  PlayCircleIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";

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
 * The media picker: a single centered "+ Add" tile when empty, then a row of
 * thumbnails (left) with the "+ Add" tile trailing on the right. No drag-and-drop.
 */
export function MediaFilesStep({
  previews,
  error,
  onAddFiles,
  onRemove,
}: MediaFilesStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length) onAddFiles(picked);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const isEmpty = previews.length === 0;

  const addTile = (
    <button
      type="button"
      aria-label="Add files"
      onClick={openPicker}
      className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-gradient-to-b from-surface-secondary/60 to-surface-secondary/30 text-muted outline-none transition-transform focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
    >
      <HugeiconsIcon icon={PlusSignIcon} className="size-5 text-accent" />
      <span className="text-[11px] font-medium">Add</span>
    </button>
  );

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

      {isEmpty ? (
        <div className="flex justify-center py-2">
          <div className="w-24">{addTile}</div>
        </div>
      ) : (
        <div className="grid max-h-[244px] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
          {previews.map((item, i) => (
            <div
              key={item.url}
              className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-secondary"
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
                    <HugeiconsIcon icon={PlayCircleIcon} className="size-5" />
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
                className="absolute right-1 top-1 grid size-5 cursor-pointer place-items-center rounded-full bg-overlay/80 text-overlay-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
              </button>
            </div>
          ))}
          {addTile}
        </div>
      )}

      <p className={`text-xs ${error ? "text-danger" : "text-muted"}`}>
        {error ??
          `Images and video clips, up to 20.${
            isEmpty ? "" : ` ${previews.length} added.`
          }`}
      </p>
    </div>
  );
}
