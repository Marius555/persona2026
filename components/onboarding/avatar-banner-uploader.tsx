"use client";

import {
  Camera01Icon,
  Cancel01Icon,
  ImageAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "@heroui/react";
import { useRef, useState } from "react";

import { AvatarCropModal } from "./avatar-crop-modal";
import { NEUTRAL_GRADIENT } from "./constants";

interface UploaderProps {
  avatarPreview: string | null;
  bannerPreview: string | null;
  onAvatarSelect: (file: File) => void;
  onBannerSelect: (file: File) => void;
  onClearBanner: () => void;
}

/**
 * Facebook-style profile editor: landscape banner behind, square avatar with a
 * surface-coloured ring overlapping in front. Each slot opens a hidden file
 * input. Re-clicking a slot replaces its image.
 */
export function AvatarBannerUploader({
  avatarPreview,
  bannerPreview,
  onAvatarSelect,
  onBannerSelect,
  onClearBanner,
}: UploaderProps) {
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  function pick(
    event: React.ChangeEvent<HTMLInputElement>,
    onSelect: (file: File) => void,
  ) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.danger("Please choose an image file.");
      return;
    }
    onSelect(file);
  }

  // Avatars go through the crop modal before being applied.
  function pickAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.danger("Please choose an image file.");
      return;
    }
    setPendingAvatar(file);
    setCropOpen(true);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {/* Banner */}
      <div
        className="relative aspect-[3/1] w-full bg-cover bg-center"
        style={
          bannerPreview
            ? { backgroundImage: `url(${bannerPreview})` }
            : { background: NEUTRAL_GRADIENT }
        }
      >
        <div className="absolute right-2 top-2 flex gap-1.5">
          {bannerPreview ? (
            <button
              type="button"
              aria-label="Remove banner"
              onClick={onClearBanner}
              className="grid size-8 cursor-pointer place-items-center rounded-full bg-overlay/80 text-overlay-foreground backdrop-blur transition-colors hover:bg-overlay"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={bannerPreview ? "Change banner" : "Add banner"}
            onClick={() => bannerInput.current?.click()}
            className="grid size-8 cursor-pointer place-items-center rounded-full bg-overlay/80 text-overlay-foreground backdrop-blur transition-colors hover:bg-overlay"
          >
            <HugeiconsIcon icon={Camera01Icon} className="size-4" />
          </button>
        </div>

        {!bannerPreview ? (
          <button
            type="button"
            onClick={() => bannerInput.current?.click()}
            className="absolute inset-0 grid cursor-pointer place-items-center text-overlay-foreground/80 transition-colors hover:text-overlay-foreground"
          >
            <span className="flex flex-col items-center gap-1 text-xs font-medium">
              <HugeiconsIcon icon={ImageAdd01Icon} className="size-6" />
              Add a banner
            </span>
          </button>
        ) : null}
      </div>

      {/* Avatar (overlaps the banner) */}
      <div className="relative px-4 pb-5">
        <div className="-mt-10 inline-block">
          <button
            type="button"
            aria-label={avatarPreview ? "Change avatar" : "Add avatar"}
            onClick={() => avatarInput.current?.click()}
            className="group relative block size-20 cursor-pointer overflow-hidden rounded-full bg-surface-secondary ring-4 ring-surface"
          >
            {avatarPreview ? (
              <>
                <span
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatarPreview})` }}
                />
                {/* Camera only appears on hover, over the existing image. */}
                <span className="absolute inset-0 grid place-items-center bg-overlay/0 text-transparent transition-colors group-hover:bg-overlay/40 group-hover:text-overlay-foreground">
                  <HugeiconsIcon icon={Camera01Icon} className="size-5" />
                </span>
              </>
            ) : (
              /* Single placeholder icon; hover just darkens. */
              <span className="absolute inset-0 grid place-items-center bg-transparent text-muted transition-colors group-hover:bg-overlay/10 group-hover:text-foreground">
                <HugeiconsIcon icon={Camera01Icon} className="size-6" />
              </span>
            )}
          </button>
        </div>
      </div>

      <input
        ref={avatarInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pickAvatar}
      />
      <input
        ref={bannerInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e, onBannerSelect)}
      />

      <AvatarCropModal
        file={pendingAvatar}
        isOpen={cropOpen}
        onOpenChange={setCropOpen}
        onCropped={onAvatarSelect}
      />
    </div>
  );
}
