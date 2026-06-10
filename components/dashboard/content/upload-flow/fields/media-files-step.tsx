"use client";

import {
  Cancel01Icon,
  Image01Icon,
  PlayCircleIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";

import type { MediaType } from "@/lib/validation/content";

export interface MediaPreview {
  url: string;
  mediaType: MediaType;
}

interface MediaFilesStepProps {
  previews: MediaPreview[];
  error?: string;
  /** Raw picked/dropped files — the parent validates and stages them. */
  onAddFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
}

/** The media-picker grid: a full-width prompt when empty, then a tile grid. */
export function MediaFilesStep({
  previews,
  error,
  onAddFiles,
  onRemove,
}: MediaFilesStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length) onAddFiles(picked);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files ?? []);
    if (dropped.length) onAddFiles(dropped);
  }

  const dragProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: handleDrop,
  };

  const isEmpty = previews.length === 0;

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
        <button
          type="button"
          aria-label="Add files"
          onClick={openPicker}
          {...dragProps}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-9 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus ${
            dragOver
              ? "border-accent bg-accent/5 text-accent"
              : error
                ? "border-danger/60 text-muted"
                : "border-border bg-surface-secondary/30 text-muted hover:border-accent/50 hover:text-accent"
          }`}
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-accent/12 text-accent">
            <HugeiconsIcon icon={Image01Icon} className="size-5" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            Add photos or clips
          </span>
          <span className="text-xs text-muted">Drop here or click to browse</span>
        </button>
      ) : (
        <div className="grid max-h-[244px] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
          {previews.map((item, i) => (
            <div
              key={item.url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-secondary"
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
                className="absolute right-1 top-1 grid size-5 cursor-pointer place-items-center rounded-full bg-overlay/70 text-overlay-foreground opacity-0 transition-opacity hover:bg-overlay group-hover:opacity-100"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            aria-label="Add more files"
            onClick={openPicker}
            {...dragProps}
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus ${
              dragOver
                ? "border-accent bg-accent/5 text-accent"
                : "border-border bg-surface-secondary/40 text-muted hover:border-accent/50 hover:text-accent"
            }`}
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-5 text-accent" />
            <span className="text-[11px]">Add</span>
          </button>
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
