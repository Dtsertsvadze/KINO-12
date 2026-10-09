"use client";

import { useEffect, useRef, type ReactNode } from "react";

type AppDialogProps = {
  open: boolean;
  labelledBy: string;
  describedBy?: string;
  className?: string;
  busy?: boolean;
  onRequestClose: () => void;
  children: ReactNode;
};

export function AppDialog({
  open,
  labelledBy,
  describedBy,
  className = "",
  busy = false,
  onRequestClose,
  children,
}: AppDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleOverlayClick(event: React.MouseEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current;

    if (!dialog || event.target !== event.currentTarget) {
      return;
    }

    const bounds = dialog.getBoundingClientRect();
    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedOutside) {
      onRequestClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={`fixed inset-0 m-auto border border-white/[0.1] bg-page p-0 text-white shadow-[0_32px_100px_rgba(0,0,0,0.55)] backdrop:bg-black/[0.78] backdrop:backdrop-blur-sm ${className}`}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
      onClick={handleOverlayClick}
    >
      {children}
    </dialog>
  );
}
