"use client";

import {
  Cancel01Icon,
  PlayCircleIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";

export interface ContentItem {
  file: File;
  url: string;
  kind: "image" | "video";
}

interface StepContentProps {
  items: ContentItem[];
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export function StepContent({ items, error, onAdd, onRemove }: StepContentProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Fixed-height scroll area so the step card never grows as files pile up. */}
      <div className="max-h-64 overflow-y-auto pr-1">
        <div className="grid grid-cols-3 gap-2">
          {items.map((item, index) => (
            <div
              key={item.url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-secondary/40"
            >
              {item.kind === "video" ? (
                <>
                  <video
                    src={item.url}
                    className="size-full object-cover"
                    muted
                    playsInline
                  />
                  <span className="pointer-events-none absolute inset-0 grid place-items-center text-overlay-foreground/90">
                    <HugeiconsIcon icon={PlayCircleIcon} className="size-7" />
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
                onClick={() => onRemove(index)}
                className="absolute right-1.5 top-1.5 grid size-7 cursor-pointer place-items-center rounded-full bg-overlay/80 text-overlay-foreground backdrop-blur transition-colors hover:bg-overlay"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
              </button>
            </div>
          ))}

          {/* Add tile trails the content — centered when there's nothing yet, then
              pushed to the next free cell as content fills the grid left-to-right. */}
          <button
            type="button"
            onClick={openPicker}
            className={[
              "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-focus",
              items.length === 0 ? "col-start-2" : "",
              error
                ? "border-danger/60 bg-danger/5"
                : "border-border bg-surface-secondary/40 hover:border-accent/50",
            ].join(" ")}
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-5 text-accent" />
            <span className="text-xs text-muted">Add more</span>
          </button>
        </div>
      </div>

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          onAdd(files);
        }}
      />
    </div>
  );
}
