"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
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
      <Modal.Container>
        <Modal.Dialog
          aria-label="Media viewer"
          className="!w-auto !max-w-[100vw] !border-0 !bg-transparent !p-0 !shadow-none"
        >
          <Modal.CloseTrigger />
          <div className="relative flex items-center justify-center">
            {current ? <MediaFrame item={current} /> : null}

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
        src={item.src}
        className="max-h-[90vh] max-w-[90vw] rounded-lg"
        controls
        autoPlay
        playsInline
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.src}
      alt=""
      className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
    />
  );
}
