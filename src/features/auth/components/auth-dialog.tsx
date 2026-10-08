"use client";

import type { ReactNode } from "react";

import { AppDialog } from "@/components/overlays/app-dialog";

type AuthDialogProps = {
  open: boolean;
  title: string;
  description: string;
  titleId: string;
  variant: "login" | "register";
  onRequestClose: () => void;
  children: ReactNode;
};

export function AuthDialog({
  open,
  title,
  description,
  titleId,
  variant,
  onRequestClose,
  children,
}: AuthDialogProps) {
  const descriptionId = `${titleId}-description`;
  const isRegisterDialog = variant === "register";

  return (
    <AppDialog
      open={open}
      labelledBy={titleId}
      describedBy={descriptionId}
      onRequestClose={onRequestClose}
      className={`overflow-y-auto rounded-[28px] ${
        isRegisterDialog
          ? "h-[558px] w-[475px]"
          : "h-[399px] w-[403px]"
      }`}
    >
      <div
        className="relative flex h-full flex-col p-8"
      >
        <button
          type="button"
          className="absolute top-8 right-8 inline-flex size-5 cursor-pointer items-center justify-center text-white/[0.7] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Close dialog"
          onClick={onRequestClose}
        >
          <svg
            aria-hidden="true"
            className="size-4"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="m5 5 10 10M15 5 5 15"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.6"
            />
          </svg>
        </button>

        <div className="mb-6 pr-10">
          <h2
            id={titleId}
            className="text-base leading-5 font-bold"
          >
            {title}
          </h2>
          <p
            id={descriptionId}
            className="mt-1 text-[10px] leading-4 text-white/[0.52]"
          >
            {description}
          </p>
        </div>

        {children}
      </div>
    </AppDialog>
  );
}
