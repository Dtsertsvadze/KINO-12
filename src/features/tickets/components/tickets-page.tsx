"use client";

import { useEffect, useRef, useState } from "react";

import { EmptyState } from "@/components/feedback/request-state";
import { AuthApiError } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-provider";
import { ProfilePageShell } from "@/features/profile/components/profile-page-shell";

import { getTickets, refundOrder } from "../api";
import type { TicketFilter, TicketOrder } from "../types";
import { RefundDialog } from "./refund-dialog";
import { TicketCard } from "./ticket-card";

type TicketsByFilter = Record<TicketFilter, TicketOrder[]>;

const initialTickets: TicketsByFilter = {
  upcoming: [],
  past: [],
};

function TicketsSkeleton() {
  return (
    <div
      className="grid gap-6"
      aria-label="Loading your tickets"
      aria-busy="true"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="grid min-h-[204px] animate-pulse grid-cols-[128px_1fr_316px] overflow-hidden rounded-[28px] bg-input motion-reduce:animate-none"
        >
          <div className="m-6 mr-0 h-[156px] w-[112px] rounded-xl bg-white/[0.07]" />
          <div className="px-6 py-7">
            <div className="h-6 w-64 rounded bg-white/[0.08]" />
            <div className="mt-6 h-10 w-3/4 rounded bg-white/[0.055]" />
            <div className="mt-5 h-6 w-1/2 rounded bg-white/[0.055]" />
          </div>
          <div className="border-l border-dashed border-white/[0.08] px-7 py-7">
            <div className="h-5 w-24 rounded bg-white/[0.07]" />
            <div className="mt-6 h-7 w-full rounded bg-white/[0.06]" />
            <div className="mt-5 h-10 w-full rounded-full bg-white/[0.07]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TicketsPage() {
  const {
    user,
    isLoading: isAuthLoading,
    authError,
    openLogin,
    retryAuthentication,
    signOut,
  } = useAuth();
  const [activeFilter, setActiveFilter] = useState<TicketFilter>("upcoming");
  const [tickets, setTickets] = useState<TicketsByFilter>(initialTickets);
  const [loadedUserId, setLoadedUserId] = useState<number>();
  const [isTicketsLoading, setIsTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<{
    userId: number;
    message: string;
  }>();
  const [requestVersion, setRequestVersion] = useState(0);
  const [refundTarget, setRefundTarget] = useState<TicketOrder>();
  const [refundError, setRefundError] = useState<string>();
  const [isRefunding, setIsRefunding] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>();
  const refundInFlightRef = useRef(false);

  useEffect(() => {
    if (!isAuthLoading && !authError && !user) {
      openLogin();
    }
  }, [authError, isAuthLoading, openLogin, user]);

  useEffect(() => {
    if (isAuthLoading || authError || !user) {
      return;
    }

    let isCurrent = true;

    Promise.all([getTickets("upcoming"), getTickets("past")])
      .then(([upcoming, past]) => {
        if (isCurrent) {
          setTickets({ upcoming, past });
          setLoadedUserId(user.id);
          setTicketsError(undefined);
        }
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }

        if (error instanceof AuthApiError && error.status === 401) {
          setTickets(initialTickets);
          setLoadedUserId(undefined);
          setIsTicketsLoading(true);
          void signOut().then(() => openLogin());
          return;
        }

        setTicketsError({
          userId: user.id,
          message:
            error instanceof Error
              ? error.message
              : "Your tickets could not be loaded. Please try again.",
        });
      })
      .finally(() => {
        if (isCurrent) {
          setIsTicketsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [authError, isAuthLoading, openLogin, requestVersion, signOut, user]);

  function retryTickets() {
    setIsTicketsLoading(true);
    setTicketsError(undefined);
    setRequestVersion((version) => version + 1);
  }

  function openRefundDialog(order: TicketOrder) {
    setRefundError(undefined);
    setSuccessMessage(undefined);
    setRefundTarget(order);
  }

  function closeRefundDialog() {
    if (refundInFlightRef.current) {
      return;
    }

    setRefundTarget(undefined);
    setRefundError(undefined);
  }

  async function submitRefund(order: TicketOrder) {
    if (refundInFlightRef.current) {
      return;
    }

    refundInFlightRef.current = true;
    setIsRefunding(true);
    setRefundError(undefined);

    try {
      await refundOrder(order.reference);
      setRefundTarget(undefined);
      setSuccessMessage(`Order #${order.reference} was refunded successfully.`);
      setIsTicketsLoading(true);
      setRequestVersion((version) => version + 1);
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        await signOut();
        setRefundTarget(undefined);
        openLogin(() => {
          setRefundTarget(order);
          window.setTimeout(() => void submitRefund(order), 0);
        });
        return;
      }

      setRefundError(
        error instanceof Error
          ? error.message
          : "The refund could not be completed. Please try again.",
      );
    } finally {
      refundInFlightRef.current = false;
      setIsRefunding(false);
    }
  }

  const visibleTickets = tickets[activeFilter];
  const currentTicketsError =
    ticketsError && ticketsError.userId === user?.id
      ? ticketsError.message
      : undefined;
  const hasCurrentUserTickets = loadedUserId === user?.id;
  const ticketCount =
    !isTicketsLoading && hasCurrentUserTickets
      ? tickets.upcoming.length
      : undefined;

  return (
    <ProfilePageShell activeTab="tickets" ticketCount={ticketCount}>
      <section className="min-h-[700px]" aria-labelledby="profile-tab-tickets">
        {!isAuthLoading && user ? (
          <div
            className="inline-flex rounded-xl bg-input p-1"
            role="tablist"
            aria-label="Ticket history"
          >
            {(["upcoming", "past"] as const).map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  id={`ticket-tab-${filter}`}
                  type="button"
                  className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-4 text-xs font-bold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    isActive
                      ? "bg-white/[0.09] text-white"
                      : "text-white/[0.44] hover:text-white"
                  }`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`ticket-panel-${filter}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                  <span className="text-[10px] text-white/[0.52]">
                    {hasCurrentUserTickets ? tickets[filter].length : "–"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {successMessage ? (
          <p
            className="mt-5 rounded-xl border border-success/[0.2] bg-success/[0.08] px-4 py-3 text-sm text-success"
            role="status"
          >
            {successMessage}
          </p>
        ) : null}

        <div
          id={`ticket-panel-${activeFilter}`}
          className="mt-6"
          role={!isAuthLoading && user ? "tabpanel" : undefined}
          aria-labelledby={
            !isAuthLoading && user
              ? `ticket-tab-${activeFilter}`
              : undefined
          }
        >
          {isAuthLoading ? (
            <TicketsSkeleton />
          ) : authError ? (
            <div
              className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-brand/[0.18] bg-brand/[0.05] px-8 text-center"
              role="alert"
            >
              <p className="text-sm text-white/[0.68]">{authError}</p>
              <button
                type="button"
                className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-brand px-5 text-xs font-extrabold text-white hover:bg-brand-hover"
                onClick={retryAuthentication}
              >
                Try again
              </button>
            </div>
          ) : !user ? (
            <EmptyState
              title="Log in to view your tickets"
              message="Your upcoming and past tickets are linked to your Kino XII account."
            />
          ) : currentTicketsError ? (
            <div
              className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-brand/[0.18] bg-brand/[0.05] px-8 text-center"
              role="alert"
            >
              <h2 className="text-lg font-bold">Tickets could not be loaded</h2>
              <p className="mt-2 text-sm text-white/[0.58]">
                {currentTicketsError}
              </p>
              <button
                type="button"
                className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-brand px-5 text-xs font-extrabold text-white hover:bg-brand-hover"
                onClick={retryTickets}
              >
                Try again
              </button>
            </div>
          ) : isTicketsLoading || !hasCurrentUserTickets ? (
            <TicketsSkeleton />
          ) : visibleTickets.length === 0 ? (
            <EmptyState
              title={
                activeFilter === "upcoming"
                  ? "No upcoming tickets"
                  : "No past tickets"
              }
              message={
                activeFilter === "upcoming"
                  ? "Book a session and your next cinema visit will appear here."
                  : "Completed and refunded orders will appear here."
              }
              action={
                activeFilter === "upcoming"
                  ? { href: "/sessions", label: "Browse sessions" }
                  : undefined
              }
            />
          ) : (
            <div className="grid gap-6">
              {visibleTickets.map((order) => (
                <TicketCard
                  key={order.id}
                  order={order}
                  showRefund={activeFilter === "upcoming"}
                  isRefunding={isRefunding && refundTarget?.id === order.id}
                  onRefund={openRefundDialog}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <RefundDialog
        order={refundTarget}
        isSubmitting={isRefunding}
        errorMessage={refundError}
        onClose={closeRefundDialog}
        onConfirm={(order) => void submitRefund(order)}
      />
    </ProfilePageShell>
  );
}
