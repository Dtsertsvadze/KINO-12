"use client";

import { useTransition } from "react";

export default function Error({ retry }: { retry: () => void }) {
  const [isRetrying, startTransition] = useTransition();

  return (
    <main className="flex min-h-[1080px] items-center justify-center bg-page px-16 text-foreground">
      <div className="flex min-h-64 w-full max-w-[720px] flex-col items-center justify-center rounded-3xl border border-error/[0.18] bg-error/[0.1] px-10 text-center">
        <h1 className="text-2xl font-extrabold">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          We could not load this page. Please try again.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-brand px-6 text-sm font-extrabold text-foreground transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
          disabled={isRetrying}
          onClick={() => startTransition(retry)}
        >
          {isRetrying ? "Retrying…" : "Try again"}
        </button>
      </div>
    </main>
  );
}
