"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AppDialog } from "@/components/overlays/app-dialog";
import { AuthApiError } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-provider";
import { getSessionFilterOptions } from "@/features/sessions/api";
import type {
  CinemaSession,
  SessionFilterOptions,
  TicketTypeSlug,
} from "@/features/sessions/types";

import { getSeatMap, holdSeats, releaseHold } from "../api";
import type { HallSeat, SeatHold, SeatMap } from "../types";
import { HallSeatMap } from "./hall-seat-map";
import {
  SeatPriceSummary,
  type SelectedSeatLine,
} from "./seat-price-summary";

type PurchaseModalProps = {
  open: boolean;
  session: CinemaSession;
  movieTitle: string;
  ageRatingCode: string;
  minimumAge: number;
  onClose: () => void;
  onAuthenticationRequired: (replay: () => void) => void;
};

function formatSessionDate(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function getRemainingSeconds(expiresAt: string) {
  return Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
}

function getSelectionKey(selection: Record<number, TicketTypeSlug>) {
  return Object.entries(selection)
    .sort(([firstSeatId], [secondSeatId]) =>
      Number(firstSeatId) - Number(secondSeatId),
    )
    .map(([seatId, ticketType]) => `${seatId}:${ticketType}`)
    .join("|");
}

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

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <ol
      className="grid grid-cols-2 overflow-hidden rounded-full bg-input text-[10px] font-bold uppercase"
      aria-label="Purchase progress"
    >
      <li
        className={`flex h-9 items-center justify-center ${
          step === 1 ? "bg-brand text-white" : "text-white/[0.45]"
        }`}
        aria-current={step === 1 ? "step" : undefined}
      >
        1. Seats
      </li>
      <li
        className={`flex h-9 items-center justify-center ${
          step === 2 ? "bg-brand text-white" : "text-white/[0.45]"
        }`}
        aria-current={step === 2 ? "step" : undefined}
      >
        2. Checkout
      </li>
    </ol>
  );
}

export function PurchaseModal({
  open,
  session,
  movieTitle,
  ageRatingCode,
  minimumAge,
  onClose,
  onAuthenticationRequired,
}: PurchaseModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [seatMap, setSeatMap] = useState<SeatMap>();
  const [config, setConfig] = useState<SessionFilterOptions>();
  const [selectedTickets, setSelectedTickets] = useState<
    Record<number, TicketTypeSlug>
  >({});
  const [hold, setHold] = useState<SeatHold>();
  const [heldSelectionKey, setHeldSelectionKey] = useState<string>();
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const holdRequestInFlightRef = useRef(false);

  const loadBookingData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const [nextSeatMap, nextConfig] = await Promise.all([
        getSeatMap(session.id),
        getSessionFilterOptions(),
      ]);
      const adultTicket =
        nextConfig.ticketTypes.find((type) => type.slug === "adult") ??
        nextConfig.ticketTypes[0];

      setSeatMap(nextSeatMap);
      setConfig(nextConfig);
      setSelectedTickets(
        adultTicket
          ? Object.fromEntries(
              nextSeatMap.sections
                .flatMap((section) => section.rows)
                .flatMap((row) => row.seats)
                .filter((seat) => seat.isMine)
                .slice(0, nextConfig.maxSeatsPerOrder)
                .map((seat) => [seat.id, adultTicket.slug]),
            )
          : {},
      );
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        onAuthenticationRequired(() => void loadBookingData());
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The seat map could not be loaded. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [onAuthenticationRequired, session.id]);

  const refreshSeatMap = useCallback(async () => {
    try {
      const refreshedMap = await getSeatMap(session.id);
      setSeatMap(refreshedMap);
      const refreshedSeats = new Map(
        refreshedMap.sections
          .flatMap((section) => section.rows)
          .flatMap((row) => row.seats)
          .map((seat) => [seat.id, seat]),
      );
      setSelectedTickets((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([seatId]) => {
            const seat = refreshedSeats.get(Number(seatId));
            return seat && (seat.state === "available" || seat.isMine);
          }),
        ),
      );
      return refreshedMap;
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        onAuthenticationRequired(() => void refreshSeatMap());
        return undefined;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The latest seat availability could not be loaded.",
      );
      return undefined;
    }
  }, [onAuthenticationRequired, session.id]);

  useEffect(() => {
    if (!open || (seatMap && seatMap.sessionId === session.id)) {
      return;
    }

    const loadTimer = window.setTimeout(() => {
      void loadBookingData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadBookingData, open, seatMap, session.id]);

  useEffect(() => {
    if (!open || !hold) {
      return;
    }

    const tick = () => {
      const remaining = getRemainingSeconds(hold.expiresAt);
      setSecondsRemaining(remaining);

      if (remaining === 0) {
        setHold(undefined);
        setHeldSelectionKey(undefined);
        setStep(1);
        setSelectedTickets({});
        setNotice("Your hold expired. Please select your seats again.");
        void refreshSeatMap();
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [hold, open, refreshSeatMap]);

  const seatContexts = new Map<
    number,
    { seat: HallSeat; sectionName: string }
  >();
  seatMap?.sections.forEach((section) => {
    section.rows.forEach((row) => {
      row.seats.forEach((seat) => {
        seatContexts.set(seat.id, { seat, sectionName: section.name });
      });
    });
  });

  function buildSelectedLines(
    selection: Record<number, TicketTypeSlug>,
  ): SelectedSeatLine[] {
    return Object.entries(selection)
      .map(([seatIdValue, ticketTypeSlug]): SelectedSeatLine | null => {
        const seatId = Number(seatIdValue);
        const context = seatContexts.get(seatId);
        const ticketType = config?.ticketTypes.find(
          (type) => type.slug === ticketTypeSlug,
        );

        if (!context || !ticketType) {
          return null;
        }

        const isTicketBlocked = Boolean(
          ticketType.blockedFromRatingAge !== null &&
            minimumAge >= ticketType.blockedFromRatingAge,
        );

        return {
          ...context,
          ticketType,
          price: Math.round(session.price * ticketType.priceRatio * 100) / 100,
          error: isTicketBlocked
            ? ticketType.note ??
              `${ticketType.name} tickets are not allowed for this film.`
            : undefined,
        };
      })
      .filter((line): line is SelectedSeatLine => line !== null)
      .sort((first, second) =>
        first.seat.code.localeCompare(second.seat.code, undefined, {
          numeric: true,
        }),
      );
  }

  const selectedLines = buildSelectedLines(selectedTickets);
  const selectedSeatIds = new Set(selectedLines.map((line) => line.seat.id));
  const subtotal = selectedLines.reduce((sum, line) => sum + line.price, 0);
  const hasTicketErrors = selectedLines.some((line) => line.error);
  const isAgeRestricted = Boolean(
    user && user.age !== null && user.age < minimumAge,
  );
  const currentSelectionKey = getSelectionKey(selectedTickets);
  const holdMatchesSelection = Boolean(
    hold?.isLive &&
      secondsRemaining > 0 &&
      heldSelectionKey === currentSelectionKey,
  );
  const canContinue = Boolean(
    user?.profileComplete &&
      !isAgeRestricted &&
      selectedLines.length > 0 &&
      !hasTicketErrors &&
      holdMatchesSelection &&
      !isHolding,
  );

  function toggleSeat(seat: HallSeat) {
    if (!config || holdRequestInFlightRef.current) {
      return;
    }

    setErrorMessage(undefined);
    setNotice(undefined);

    if (selectedTickets[seat.id]) {
      const next = { ...selectedTickets };
      delete next[seat.id];
      setSelectedTickets(next);
      setHeldSelectionKey(undefined);

      if (Object.keys(next).length === 0) {
        void releaseCurrentHold();
      } else {
        void syncHold(next);
      }
      return;
    }

    if (Object.keys(selectedTickets).length >= config.maxSeatsPerOrder) {
      setNotice(
        `You can select a maximum of ${config.maxSeatsPerOrder} seats per order.`,
      );
      return;
    }

    const adultTicket =
      config.ticketTypes.find((type) => type.slug === "adult") ??
      config.ticketTypes[0];

    if (!adultTicket) {
      setErrorMessage("Ticket types are currently unavailable. Please retry.");
      return;
    }

    const next = {
      ...selectedTickets,
      [seat.id]: adultTicket.slug,
    };
    setSelectedTickets(next);
    setHeldSelectionKey(undefined);
    void syncHold(next);
  }

  function removeSeat(seatId: number) {
    if (holdRequestInFlightRef.current) {
      return;
    }

    setErrorMessage(undefined);
    setNotice(undefined);
    const next = { ...selectedTickets };
    delete next[seatId];
    setSelectedTickets(next);
    setHeldSelectionKey(undefined);

    if (Object.keys(next).length === 0) {
      void releaseCurrentHold();
    } else {
      void syncHold(next);
    }
  }

  function changeTicketType(seatId: number, ticketType: TicketTypeSlug) {
    if (holdRequestInFlightRef.current) {
      return;
    }

    const option = config?.ticketTypes.find((type) => type.slug === ticketType);

    if (
      !option ||
      (option.blockedFromRatingAge !== null &&
        minimumAge >= option.blockedFromRatingAge)
    ) {
      const seatCode = seatContexts.get(seatId)?.seat.code ?? "This seat";
      setNotice(
        `${seatCode}: ${option?.note ?? "That ticket type is not allowed for this film."}`,
      );
      return;
    }

    setNotice(undefined);
    setErrorMessage(undefined);
    const next = { ...selectedTickets, [seatId]: ticketType };
    setSelectedTickets(next);
    setHeldSelectionKey(undefined);
    void syncHold(next);
  }

  async function syncHold(selection: Record<number, TicketTypeSlug>) {
    if (holdRequestInFlightRef.current) {
      return;
    }

    const linesForRequest = buildSelectedLines(selection);
    const hasInvalidTicket = linesForRequest.some((line) => line.error);

    if (
      !user?.profileComplete ||
      isAgeRestricted ||
      linesForRequest.length === 0 ||
      hasInvalidTicket
    ) {
      return;
    }

    holdRequestInFlightRef.current = true;
    setIsHolding(true);
    setErrorMessage(undefined);
    setNotice(undefined);

    try {
      const nextHold = await holdSeats(
        session.id,
        linesForRequest.map((line) => ({
          seatId: line.seat.id,
          ticketType: line.ticketType.slug,
        })),
      );
      setHold(nextHold);
      setHeldSelectionKey(getSelectionKey(selection));
      setSecondsRemaining(getRemainingSeconds(nextHold.expiresAt));
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        onAuthenticationRequired(() => void syncHold(selection));
        return;
      }

      if (error instanceof AuthApiError && error.status === 409) {
        const contested = new Set(error.contested ?? []);
        const lostSeats = Array.from(contested);

        setSeatMap((current) =>
          current
            ? {
                ...current,
                sections: current.sections.map((section) => ({
                  ...section,
                  rows: section.rows.map((row) => ({
                    ...row,
                    seats: row.seats.map((seat) =>
                      contested.has(seat.code)
                        ? { ...seat, state: "sold", isMine: false }
                        : seat,
                    ),
                  })),
                })),
              }
            : current,
        );
        const remainingSelection = Object.fromEntries(
          Object.entries(selection).filter(([seatId]) => {
            const code = seatContexts.get(Number(seatId))?.seat.code;
            return !code || !contested.has(code);
          }),
        );
        setSelectedTickets(remainingSelection);
        setHeldSelectionKey(undefined);
        if (Object.keys(remainingSelection).length === 0) {
          setHold(undefined);
          setSecondsRemaining(0);
        }
        setErrorMessage(
          lostSeats.length > 0
            ? `Seats ${lostSeats.join(", ")} were just taken. The remaining selection has been kept.`
            : error.message,
        );
        await refreshSeatMap();
        return;
      }

      if (error instanceof AuthApiError && error.fieldErrors) {
        const validationMessages = Object.entries(error.fieldErrors).flatMap(
          ([field, messages]) => {
            const seatIndex = Number(field.match(/^seats\.(\d+)\./)?.[1]);
            const seatCode = Number.isInteger(seatIndex)
              ? linesForRequest[seatIndex]?.seat.code
              : undefined;

            return messages.map((message) =>
              seatCode ? `${seatCode}: ${message}` : message,
            );
          },
        );

        setErrorMessage(validationMessages.join(" "));
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The seats could not be held. Please try again.",
      );
    } finally {
      holdRequestInFlightRef.current = false;
      setIsHolding(false);
    }
  }

  async function releaseCurrentHold() {
    if (holdRequestInFlightRef.current) {
      return;
    }

    if (!hold?.isLive || secondsRemaining === 0) {
      setHold(undefined);
      setHeldSelectionKey(undefined);
      setSecondsRemaining(0);
      return;
    }

    holdRequestInFlightRef.current = true;
    setIsHolding(true);
    setErrorMessage(undefined);
    setNotice(undefined);

    try {
      await releaseHold(hold.holdId);
      setHold(undefined);
      setHeldSelectionKey(undefined);
      setSecondsRemaining(0);
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        onAuthenticationRequired(() => void releaseCurrentHold());
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The held seats could not be released. Please try again.",
      );
    } finally {
      holdRequestInFlightRef.current = false;
      setIsHolding(false);
    }
  }

  function continueToCheckout() {
    if (!canContinue) {
      return;
    }

    setStep(2);
  }

  async function requestClose() {
    if (isHolding || isClosing) {
      return;
    }

    if (hold?.isLive && secondsRemaining > 0) {
      setIsClosing(true);
      setErrorMessage(undefined);

      try {
        await releaseHold(hold.holdId);
      } catch (error) {
        if (!(error instanceof AuthApiError && error.status === 401)) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "The held seats could not be released. Please try closing again.",
          );
          setIsClosing(false);
          return;
        }
      }
    }

    setHold(undefined);
    setHeldSelectionKey(undefined);
    setSecondsRemaining(0);
    setStep(1);
    onClose();
  }

  const titleId = `purchase-${session.id}-title`;
  const descriptionId = `purchase-${session.id}-description`;
  const maximumSeats = config?.maxSeatsPerOrder ?? 0;
  const shouldRetryRelease = selectedLines.length === 0 && Boolean(hold);
  const shouldRetryHold = selectedLines.length > 0 && !holdMatchesSelection;

  return (
    <AppDialog
      open={open}
      labelledBy={titleId}
      describedBy={descriptionId}
      busy={isLoading || isHolding || isClosing}
      onRequestClose={() => void requestClose()}
      className="h-[660px] w-[1260px] overflow-hidden rounded-[24px]"
    >
      <div className="flex h-full flex-col p-8">
        <header className="relative shrink-0 pr-40">
          <h2 id={titleId} className="text-lg leading-6 font-extrabold uppercase">
            {movieTitle}
          </h2>
          <p
            id={descriptionId}
            className="mt-1 text-[10px] leading-4 text-white/[0.52]"
          >
            {session.venue.name} · Hall {session.hall.name} ·{" "}
            {formatSessionDate(session.date)} · {session.time} ·{" "}
            {session.format.name} · {session.language.name}
          </p>

          <div
            className="absolute top-0 right-10 min-w-20 rounded-lg bg-input px-3 py-2 text-center"
            aria-live="polite"
          >
            <span className="block text-[8px] font-semibold tracking-[0.05em] text-white/[0.5] uppercase">
              {isHolding
                ? hold
                  ? "Updating hold"
                  : "Starting hold"
                : holdMatchesSelection
                  ? "Seats held"
                  : "Hold timer"}
            </span>
            <strong className="mt-0.5 block text-xs text-white">
              {holdMatchesSelection
                ? formatCountdown(secondsRemaining)
                : "--:--"}
            </strong>
          </div>

          <button
            type="button"
            className="absolute top-1 right-0 inline-flex size-6 cursor-pointer items-center justify-center text-white/[0.55] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-35"
            aria-label="Close purchase dialog"
            disabled={isHolding || isClosing}
            onClick={() => void requestClose()}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="mt-6 w-[760px] shrink-0">
          <StepIndicator step={step} />
        </div>

        {errorMessage ? (
          <div
            className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-brand/[0.25] bg-brand/[0.08] px-4 py-3 text-xs text-brand"
            role="alert"
          >
            <span>{errorMessage}</span>
            {step === 1 && !isLoading ? (
              <button
                type="button"
                className="shrink-0 cursor-pointer font-extrabold text-white underline underline-offset-2"
                onClick={() =>
                  void (
                    !seatMap || !config
                      ? loadBookingData()
                      : shouldRetryRelease
                        ? releaseCurrentHold()
                        : shouldRetryHold
                          ? syncHold(selectedTickets)
                          : refreshSeatMap()
                  )
                }
              >
                {!seatMap || !config
                  ? "Retry"
                  : shouldRetryRelease
                    ? "Release seats"
                    : shouldRetryHold
                      ? "Retry hold"
                      : "Refresh seats"}
              </button>
            ) : null}
          </div>
        ) : null}

        {notice ? (
          <p
            className="mt-4 rounded-xl border border-status/[0.2] bg-status/[0.08] px-4 py-3 text-xs text-status"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        {step === 2 && hold ? (
          <section className="flex flex-1 flex-col items-center justify-center text-center" aria-labelledby="hold-created-heading">
            <p className="text-xs font-extrabold tracking-[0.08em] text-success uppercase">
              Seats held
            </p>
            <h3 id="hold-created-heading" className="mt-3 text-3xl font-extrabold">
              Your selection is ready for checkout
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/[0.55]">
              Your seats are reserved for {formatCountdown(secondsRemaining)}.
              The checkout form will be implemented in the next step.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {hold.seats.map((seat) => (
                <span key={seat.seatId} className="rounded-full bg-input px-4 py-2 text-xs font-bold">
                  {seat.code} · {seat.ticketType.name} · ₾{seat.price}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="mt-8 cursor-pointer rounded-full border border-white/[0.2] px-6 py-3 text-sm font-bold transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={() => setStep(1)}
            >
              Back to seats
            </button>
          </section>
        ) : (
          <div className="mt-5 grid min-h-0 flex-1 grid-cols-[780px_1fr] gap-8">
            <section className="min-h-0 overflow-auto pr-4" aria-label="Hall seat map">
              {isLoading ? (
                <div className="flex h-full animate-pulse flex-col items-center justify-center motion-reduce:animate-none" aria-label="Loading seat map">
                  <div className="h-8 w-[88%] rounded bg-white/[0.08]" />
                  <div className="mt-10 grid grid-cols-10 gap-2">
                    {Array.from({ length: 40 }, (_, index) => (
                      <span key={index} className="h-9 w-10 rounded-lg bg-input" />
                    ))}
                  </div>
                </div>
              ) : seatMap && config ? (
                <HallSeatMap
                  seatMap={seatMap}
                  selectedSeatIds={selectedSeatIds}
                  disabled={isAgeRestricted || isHolding}
                  onToggleSeat={toggleSeat}
                />
              ) : !errorMessage ? (
                <p className="py-20 text-center text-sm text-white/[0.5]">
                  No seat map is available for this session.
                </p>
              ) : null}
            </section>

            <aside className="flex min-h-0 flex-col border-l border-white/[0.1] pl-8" aria-labelledby="seat-summary-heading">
              <div className="flex items-center justify-between gap-4">
                <h3 id="seat-summary-heading" className="text-sm font-extrabold">
                  Your seats · Max {maximumSeats || "–"}
                </h3>
                {config ? (
                  <span className="text-[9px] text-white/[0.42]">
                    {config.holdMinutes} min hold
                  </span>
                ) : null}
              </div>

              <div className="mt-4 min-h-0 flex-1">
                {config ? (
                  <SeatPriceSummary
                    lines={selectedLines}
                    ticketTypes={config.ticketTypes}
                    minimumAge={minimumAge}
                    subtotal={subtotal}
                    disabled={isHolding}
                    onRemove={removeSeat}
                    onTicketTypeChange={changeTicketType}
                  />
                ) : null}
              </div>

              {isAgeRestricted ? (
                <p className="mb-3 text-[10px] leading-4 text-brand" role="alert">
                  This film is rated {ageRatingCode}. You cannot buy tickets for
                  it with this account.
                </p>
              ) : null}
              {!user?.profileComplete ? (
                <p className="mb-3 text-[10px] leading-4 text-status" role="alert">
                  Complete your profile before continuing to checkout.
                </p>
              ) : null}

              <button
                type="button"
                className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-white/[0.28] disabled:text-white/[0.55]"
                disabled={!canContinue}
                onClick={continueToCheckout}
              >
                {isHolding ? "Updating hold…" : "Next: Checkout"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </AppDialog>
  );
}
