"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Modal } from "@heroui/react";
import { useEffect } from "react";

import type { FileItem } from "../content-meta";

interface ItemViewerProps {
  /** The media files the carousel cycles through (photos & videos only). */
  files: FileItem[];
  /** Index of the open file, or null when the viewer is closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/**
 * A full-size media lightbox: clicking a photo/video opens it edge-to-edge over a
 * dark backdrop, with prev/next arrows (and Arrow keys) cycling through the media.
 */
export function ItemViewer({
  files,
  index,
  onClose,
  onIndexChange,
}: ItemViewerProps) {
  const open = index !== null && index >= 0 && index < files.length;
  const count = files.length;

  // Arrow-key navigation while the lightbox is open (Esc is handled by Modal).
  useEffect(() => {
    if (!open || count < 2 || index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") onIndexChange((index! - 1 + count) % count);
      else if (e.key === "ArrowRight") onIndexChange((index! + 1) % count);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, count, index, onIndexChange]);

  const current = open ? files[index] : null;

  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      variant="blur"
      className="bg-black/90"
    >
      <Modal.Container placement="center">
        <Modal.Dialog
          aria-label="Media viewer"
          className="!h-[88vh] !w-[94vw] !max-w-[1100px] !border-0 !bg-transparent !p-0 !shadow-none"
        >
          {/* Fixed frame: the box stays a constant size so swapping between
              portrait/landscape media doesn't resize the window — only the
              image inside changes, fitting via object-contain. */}
          <div className="relative flex size-full items-center justify-center">
            {current ? <MediaFrame item={current} /> : null}

            {/* Explicit close button layered above the media — the default
                CloseTrigger sits behind the centered image and can't be
                clicked where the image overlaps it. */}
            <Button
              isIconOnly
              variant="secondary"
              aria-label="Close"
              onPress={onClose}
              className="absolute right-2 top-2 z-20 size-10 rounded-full shadow-sm"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
            </Button>

            {count > 1 && index !== null ? (
              <>
                <Button
                  isIconOnly
                  variant="secondary"
                  aria-label="Previous"
                  onPress={() => onIndexChange((index - 1 + count) % count)}
                  className="absolute left-2 top-1/2 size-10 -translate-y-1/2 rounded-full shadow-sm"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
                </Button>
                <Button
                  isIconOnly
                  variant="secondary"
                  aria-label="Next"
                  onPress={() => onIndexChange((index + 1) % count)}
                  className="absolute right-2 top-1/2 size-10 -translate-y-1/2 rounded-full shadow-sm"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                </Button>
              </>
            ) : null}
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function MediaFrame({ item }: { item: FileItem }) {
  if (item.mediaType === "video") {
    return (
      <video
        // Re-mount on source change so the fade restarts for each media item.
        key={item.src}
        src={item.src}
        className="max-h-full max-w-full rounded-lg media-fade-in"
        controls
        autoPlay
        playsInline
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={item.src}
      src={item.src}
      alt=""
      className="max-h-full max-w-full rounded-lg object-contain media-fade-in"
    />
  );
}
