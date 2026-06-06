"use client";

import { Button, Label, Modal, Slider } from "@heroui/react";
import { useEffect, useRef, useState } from "react";

interface AvatarCropModalProps {
  /** Source image the user just picked. */
  file: File | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the square-cropped image when the user applies. */
  onCropped: (file: File) => void;
}

const OUTPUT_SIZE = 512;
const MAX_ZOOM = 3;

type Offset = { x: number; y: number };

/**
 * Facebook-style avatar cropper: the picked image is shown inside a square
 * viewport that the user can pan (drag) and zoom (slider). A circular guide
 * shows the round avatar crop. On apply, the visible square is rendered to a
 * canvas and handed back as a fresh PNG File.
 */
export function AvatarCropModal({
  file,
  isOpen,
  onOpenChange,
  onCropped,
}: AvatarCropModalProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  // The loaded image is tied to the file it came from, so a stale (revoked)
  // URL from a previous pick is never rendered.
  const [loaded, setLoaded] = useState<{
    file: File;
    url: string;
    w: number;
    h: number;
  } | null>(null);
  const [vp, setVp] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });

  // Create an object URL for the picked file and read its natural size. State is
  // only set inside the load callback, never synchronously in the effect body.
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      setLoaded({ file, url, w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Measure the (square) viewport while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVp(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, loaded]);

  const active = loaded && loaded.file === file ? loaded : null;
  const src = active?.url ?? null;
  const natural = active ? { w: active.w, h: active.h } : null;

  // Base "cover" scale so the image always fills the viewport at zoom 1.
  const coverScale =
    natural && vp ? Math.max(vp / natural.w, vp / natural.h) : 1;
  const displayW = natural ? natural.w * coverScale * zoom : 0;
  const displayH = natural ? natural.h * coverScale * zoom : 0;

  // Recenter when a fresh image loads or the viewport size changes. Resetting
  // state during render (guarded by a key) is the supported alternative to an
  // effect for "reset state when a prop changes".
  const initKey = natural && vp ? `${natural.w}x${natural.h}@${vp}` : "";
  const [initedKey, setInitedKey] = useState("");
  if (initKey && initKey !== initedKey) {
    setInitedKey(initKey);
    setZoom(1);
    setOffset({
      x: (vp - natural!.w * coverScale) / 2,
      y: (vp - natural!.h * coverScale) / 2,
    });
  }

  function clamp(x: number, y: number, dw: number, dh: number): Offset {
    const minX = Math.min(0, vp - dw);
    const minY = Math.min(0, vp - dh);
    return {
      x: Math.min(0, Math.max(minX, x)),
      y: Math.min(0, Math.max(minY, y)),
    };
  }

  function handleZoom(next: number) {
    if (!natural || !vp) {
      setZoom(next);
      return;
    }
    const newW = natural.w * coverScale * next;
    const newH = natural.h * coverScale * next;
    // Keep the point under the viewport center fixed while zooming.
    const fx = (vp / 2 - offset.x) / displayW;
    const fy = (vp / 2 - offset.y) / displayH;
    setZoom(next);
    setOffset(clamp(vp / 2 - fx * newW, vp / 2 - fy * newH, newW, newH));
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const nx = drag.current.ox + (e.clientX - drag.current.x);
    const ny = drag.current.oy + (e.clientY - drag.current.y);
    setOffset(clamp(nx, ny, displayW, displayH));
  }
  function onPointerUp() {
    drag.current = null;
  }

  async function handleApply() {
    if (!src || !natural || !vp) return;
    const displayScale = coverScale * zoom;
    const sSize = vp / displayScale; // source square, in natural px
    const sx = -offset.x / displayScale;
    const sy = -offset.y / displayScale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = src;
    await img.decode().catch(() => {});
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const base = (file?.name ?? "avatar").replace(/\.[^.]+$/, "") || "avatar";
      onCropped(new File([blob], `${base}.png`, { type: "image/png" }));
      onOpenChange(false);
    }, "image/png");
  }

  const ready = !!natural && vp > 0;

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement="center">
        <Modal.Dialog className="sm:max-w-sm">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Position your photo</Modal.Heading>
            <p className="mt-1.5 text-sm leading-5 text-muted">
              Drag to reposition and zoom so your face sits inside the circle.
            </p>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-5">
            <div
              ref={viewportRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="relative mx-auto aspect-square w-full max-w-[280px] cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-black active:cursor-grabbing"
            >
              {src ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left select-none"
                  style={{
                    width: displayW || undefined,
                    height: displayH || undefined,
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                  }}
                />
              ) : null}
              {/* Circular guide: dims everything outside the round crop. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-overlay-foreground/60"
                style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }}
              />
            </div>

            <Slider
              className="w-full"
              value={zoom}
              onChange={(v) => handleZoom(Array.isArray(v) ? v[0] : v)}
              minValue={1}
              maxValue={MAX_ZOOM}
              step={0.01}
              isDisabled={!ready}
            >
              <Label>Zoom</Label>
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onPress={handleApply} isDisabled={!ready}>
              Apply
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
