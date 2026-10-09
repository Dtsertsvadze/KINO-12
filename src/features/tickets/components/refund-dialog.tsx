"use client";

import { AppDialog } from "@/components/overlays/app-dialog";

import type { TicketOrder } from "../types";

type RefundDialogProps = {
  order?: TicketOrder;
  isSubmitting: boolean;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: (order: TicketOrder) => void;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 20 20" fill="none">
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function RefundDialog({
  order,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: RefundDialogProps) {
  const titleId = `refund-${order?.id ?? "order"}-title`;
  const descriptionId = `refund-${order?.id ?? "order"}-description`;

  function requestClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  return (
    <AppDialog
      open={Boolean(order)}
      labelledBy={titleId}
      describedBy={descriptionId}
      busy={isSubmitting}
      onRequestClose={requestClose}
      className="h-[330px] w-[475px] overflow-hidden rounded-[28px]"
    >
      <div className="relative flex h-full flex-col p-8">
        <button
          type="button"
          className="absolute top-8 right-8 inline-flex size-5 cursor-pointer items-center justify-center text-white/[0.65] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-35"
          aria-label="Close refund dialog"
          disabled={isSubmitting}
          onClick={requestClose}
        >
          <CloseIcon />
        </button>

        <h2 id={titleId} className="pr-10 text-xl font-extrabold">
          Are you sure you want to refund this order?
        </h2>
        <div
          id={descriptionId}
          className="mt-3 space-y-1 text-sm leading-6 text-white/[0.58]"
        >
          <p>Order #{order?.reference}</p>
          <p>This action cannot be undone.</p>
        </div>

        {errorMessage ? (
          <p
            className="mt-4 rounded-xl border border-brand/[0.22] bg-brand/[0.08] px-4 py-3 text-xs leading-5 text-brand"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-auto grid grid-cols-2 gap-3">
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-input text-xs font-extrabold text-white transition-colors hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-50"
            disabled={isSubmitting}
            onClick={requestClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-brand text-xs font-extrabold text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-55"
            disabled={isSubmitting || !order}
            onClick={() => order && onConfirm(order)}
          >
            {isSubmitting ? "Refunding…" : "Confirm refund"}
          </button>
        </div>
      </div>
    </AppDialog>
  );
}
