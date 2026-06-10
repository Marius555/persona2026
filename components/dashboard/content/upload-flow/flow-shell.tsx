"use client";

import { Drawer, Modal } from "@heroui/react";

import { useIsMobile } from "./use-is-mobile";

interface FlowShellProps {
  /** Accessible label for the dialog. */
  ariaLabel: string;
  /** Whether the overlay can be dismissed (off while uploading). */
  isDismissable: boolean;
  /** Fires when the user dismisses the overlay (backdrop / escape / drag). */
  onDismiss: () => void;
  children: React.ReactNode;
}

/**
 * Responsive overlay for the add-content wizard: a centered modal on desktop and
 * a bottom sheet drawer (with a drag handle) on mobile. Both share the same body
 * contract — a `flex max-h-[…] flex-col p-0` column so the wizard can lay out its
 * own header / scroll area / footer. Mirrors the breakpoint-driven treatment used
 * by `dashboard-shell.tsx`.
 */
export function FlowShell({
  ariaLabel,
  isDismissable,
  onDismiss,
  children,
}: FlowShellProps) {
  const isMobile = useIsMobile();

  function handleOpenChange(open: boolean) {
    if (!open && isDismissable) onDismiss();
  }

  if (isMobile) {
    return (
      <Drawer.Backdrop
        isOpen
        isDismissable={isDismissable}
        onOpenChange={handleOpenChange}
      >
        <Drawer.Content placement="bottom">
          <Drawer.Dialog
            aria-label={ariaLabel}
            className="flex max-h-[90vh] flex-col overflow-hidden p-0!"
          >
            <Drawer.Handle />
            {children}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    );
  }

  return (
    <Modal.Backdrop
      isOpen
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={!isDismissable}
      onOpenChange={handleOpenChange}
    >
      <Modal.Container size="lg">
        <Modal.Dialog
          aria-label={ariaLabel}
          className="flex max-h-[88vh] flex-col overflow-hidden p-0! sm:max-w-md"
        >
          {children}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
