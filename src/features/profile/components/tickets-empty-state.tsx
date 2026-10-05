"use client";

import { useEffect } from "react";

import { EmptyState } from "@/components/feedback/request-state";
import { useAuth } from "@/features/auth/auth-provider";

export function TicketsEmptyState() {
  const {
    user,
    isLoading,
    authError,
    openLogin,
    retryAuthentication,
  } = useAuth();

  useEffect(() => {
    if (!isLoading && !authError && !user) {
      openLogin();
    }
  }, [authError, isLoading, openLogin, user]);

  if (isLoading) {
    return (
      <div
        className="h-52 animate-pulse rounded-2xl bg-white/[0.04] motion-reduce:animate-none"
        aria-label="Loading your tickets"
        aria-busy="true"
      />
    );
  }

  if (authError) {
    return (
      <div
        className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-brand/[0.18] bg-brand/[0.05] px-8 text-center"
        role="alert"
      >
        <p className="text-sm text-white/[0.68]">{authError}</p>
        <button
          type="button"
          className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-brand px-5 text-xs font-extrabold text-white hover:bg-brand/[0.85]"
          onClick={retryAuthentication}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Log in to view your tickets"
        message="Your upcoming and past tickets are linked to your Kino XII account."
      />
    );
  }

  return (
    <EmptyState
      title="No tickets to show"
      message="Your upcoming and past tickets will appear here after you book a session."
      action={{ href: "/", label: "Browse movies" }}
    />
  );
}
