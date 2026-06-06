"use client";

import { AvatarBannerUploader } from "../avatar-banner-uploader";

interface StepProfileProps {
  avatarPreview: string | null;
  bannerPreview: string | null;
  onAvatarSelect: (file: File) => void;
  onBannerSelect: (file: File) => void;
  onClearBanner: () => void;
}

export function StepProfile(props: StepProfileProps) {
  return (
    <div className="flex flex-col gap-5">
      <AvatarBannerUploader {...props} />
    </div>
  );
}
