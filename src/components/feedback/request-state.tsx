"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type RequestErrorStateProps = {
  title?: string;
  message: string;
  className?: string;
};

type EmptyStateProps = {
  title: string;
  message: string;
  action?: {
    href: string;
    label: string;
  };
  className?: string;
};

export function RequestErrorState({
  title = "Something went wrong",
  message,
  className = "",
}: RequestErrorStateProps) {
  const router = useRouter();
  const [isRetrying, startTransition] = useTransition();

  return (
    <div
      className={`flex min-h-44 flex-col items-center justify-center rounded-2xl border border-brand/[0.18] bg-brand/[0.05] px-8 text-center ${className}`}
      role="alert"
    >
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-5 text-white/[0.58]">
        {message}
      </p>
      <button
        type="button"
        className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-brand px-5 text-xs font-extrabold text-white transition-colors hover:bg-brand/[0.85] disabled:cursor-wait disabled:opacity-60"
        disabled={isRetrying}
        onClick={() => startTransition(() => router.refresh())}
      >
        {isRetrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-44 flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] px-8 text-center ${className}`}
    >
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-5 text-white/[0.58]">
        {message}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-brand px-5 text-xs font-extrabold text-white transition-colors hover:bg-brand/[0.85] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
