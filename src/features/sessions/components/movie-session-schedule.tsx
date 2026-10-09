"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-provider";
import type { AuthUser } from "@/features/auth/types";
import { PurchaseModal } from "@/features/booking/components/purchase-modal";

import type { CinemaSession, MovieVenueSessions } from "../types";

type MovieSessionScheduleProps = {
  venueGroups: MovieVenueSessions[];
  movieTitle: string;
  ageRatingCode: string;
  minimumAge: number;
  today: string;
  initialBookingSession?: CinemaSession;
};

function SeatIcon() {
  return (
    <svg aria-hidden="true" className="size-3" viewBox="0 0 16 16" fill="none">
      <path
        d="M2.5 5.5h11v5h-11zM5 3.5h6M4 10.5v2M12 10.5v2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function calculateAge(dateOfBirth: string | null, today: string) {
  if (!dateOfBirth) {
    return null;
  }

  const [birthYear, birthMonth, birthDay] = dateOfBirth.split("-").map(Number);
  const [currentYear, currentMonth, currentDay] = today.split("-").map(Number);

  if (
    !birthYear ||
    !birthMonth ||
    !birthDay ||
    !currentYear ||
    !currentMonth ||
    !currentDay
  ) {
    return null;
  }

  const hasHadBirthday =
    currentMonth > birthMonth ||
    (currentMonth === birthMonth && currentDay >= birthDay);

  return currentYear - birthYear - (hasHadBirthday ? 0 : 1);
}

function SessionTicket({
  session,
  isUnavailable,
  onSelect,
}: {
  session: CinemaSession;
  isUnavailable: boolean;
  onSelect: (session: CinemaSession) => void;
}) {
  const availabilityTone =
    session.seatsLeft <= 10 ? "text-brand" : "text-white/[0.55]";
  const label = `${session.time}, Hall ${session.hall.name}, ${session.format.name}, ${session.language.name}, ₾${formatPrice(session.price)}${session.isSoldOut ? ", sold out" : `, ${session.seatsLeft} seats left`}`;

  return (
    <button
      type="button"
      className={`grid h-[74px] w-[200px] shrink-0 grid-cols-[124px_80px] overflow-hidden rounded-lg border border-white/[0.08] bg-page/[0.82] ${
        isUnavailable
          ? "cursor-not-allowed opacity-35"
          : "cursor-pointer transition-colors hover:border-white/[0.28] hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      }`}
      aria-label={label}
      disabled={isUnavailable}
      onClick={() => onSelect(session)}
    >
      <div className="flex flex-col justify-center px-4">
        <time
          className="text-base leading-none font-extrabold text-white"
          dateTime={session.startsAt}
        >
          {session.time}
        </time>
        <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] leading-none text-white/[0.5]">
          <span>{session.language.code}</span>
          <span className="rounded-full bg-white/[0.1] px-2 py-1 font-semibold text-white/[0.62]">
            {session.format.name}
          </span>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center border-l border-dashed border-white/[0.5]">
        <span
          aria-hidden="true"
          className="absolute -top-[5px] -left-[5px] size-2.5 rounded-full bg-input"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-[5px] -left-[5px] size-2.5 rounded-full bg-input"
        />
        <span className="text-sm leading-none font-extrabold text-brand">
          ₾ {formatPrice(session.price)}
        </span>
        <span
          className={`mt-2.5 flex items-center gap-1 text-[9px] leading-none ${availabilityTone}`}
        >
          {session.isSoldOut ? (
            "Sold out"
          ) : (
            <>
              <SeatIcon />
              {session.seatsLeft} left
            </>
          )}
        </span>
      </div>
    </button>
  );
}

function VenueSchedule({
  group,
  isAgeRestricted,
  isAuthLoading,
  onSelectSession,
}: {
  group: MovieVenueSessions;
  isAgeRestricted: boolean;
  isAuthLoading: boolean;
  onSelectSession: (session: CinemaSession) => void;
}) {
  const sessionsByHall = new Map<string, CinemaSession[]>();

  group.sessions.forEach((session) => {
    const sessions = sessionsByHall.get(session.hall.name) ?? [];
    sessions.push(session);
    sessionsByHall.set(session.hall.name, sessions);
  });

  return (
    <section className="mt-8" aria-labelledby={`venue-${group.venue.id}`}>
      <h3
        id={`venue-${group.venue.id}`}
        className="text-sm font-extrabold text-white"
      >
        {group.venue.name}
      </h3>
      <div className="mt-3 flex flex-wrap gap-3">
        {Array.from(sessionsByHall.entries()).map(([hallName, sessions]) => (
          <div key={hallName} className="rounded-xl bg-input p-3">
            <h4 className="mb-2 text-[10px] font-semibold text-white/[0.66]">
              Hall {hallName}
            </h4>
            <div className="flex gap-2">
              {sessions.map((session) => (
                <SessionTicket
                  key={session.id}
                  session={session}
                  isUnavailable={
                    session.isSoldOut || isAgeRestricted || isAuthLoading
                  }
                  onSelect={onSelectSession}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MovieSessionSchedule({
  venueGroups,
  movieTitle,
  ageRatingCode,
  minimumAge,
  today,
  initialBookingSession,
}: MovieSessionScheduleProps) {
  const router = useRouter();
  const { user, isLoading, openLogin, signOut } = useAuth();
  const [activeSession, setActiveSession] = useState<CinemaSession>();
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const autoOpenAttemptedRef = useRef(false);
  const calculatedAge = calculateAge(user?.dateOfBirth ?? null, today);
  const accountAge = calculatedAge ?? user?.age ?? null;
  const isAgeRestricted = Boolean(
    !isLoading &&
    user &&
    minimumAge > 0 &&
    accountAge !== null &&
    accountAge < minimumAge,
  );

  const openPurchaseForUser = useCallback(
    (session: CinemaSession, authenticatedUser: AuthUser) => {
      if (!authenticatedUser.profileComplete) {
        router.push("/profile");
        return;
      }

      if (
        authenticatedUser.age !== null &&
        authenticatedUser.age < minimumAge
      ) {
        return;
      }

      setActiveSession(session);
      setIsPurchaseOpen(true);
    },
    [minimumAge, router],
  );

  useEffect(() => {
    if (
      !initialBookingSession ||
      isLoading ||
      autoOpenAttemptedRef.current
    ) {
      return;
    }

    const openTimer = window.setTimeout(() => {
      if (autoOpenAttemptedRef.current) {
        return;
      }

      autoOpenAttemptedRef.current = true;

      if (!user) {
        openLogin((authenticatedUser) =>
          openPurchaseForUser(initialBookingSession, authenticatedUser),
        );
        return;
      }

      openPurchaseForUser(initialBookingSession, user);
    }, 0);

    return () => window.clearTimeout(openTimer);
  }, [
    initialBookingSession,
    isLoading,
    openLogin,
    openPurchaseForUser,
    user,
  ]);

  function selectSession(session: CinemaSession) {
    if (isLoading || session.isSoldOut) {
      return;
    }

    if (!user) {
      openLogin((authenticatedUser) =>
        openPurchaseForUser(session, authenticatedUser),
      );
      return;
    }

    openPurchaseForUser(session, user);
  }

  const handleAuthenticationRequired = useCallback(
    async (replay: () => void) => {
      if (!activeSession) {
        return;
      }

      setIsPurchaseOpen(false);
      await signOut();
      openLogin((authenticatedUser) => {
        if (
          !authenticatedUser.profileComplete ||
          (authenticatedUser.age !== null && authenticatedUser.age < minimumAge)
        ) {
          openPurchaseForUser(activeSession, authenticatedUser);
          return;
        }

        setIsPurchaseOpen(true);
        window.setTimeout(replay, 0);
      });
    },
    [activeSession, minimumAge, openLogin, openPurchaseForUser, signOut],
  );

  function closePurchase() {
    setIsPurchaseOpen(false);
    setActiveSession(undefined);
  }

  return (
    <div aria-busy={isLoading}>
      {isAgeRestricted ? (
        <p
          className="mt-8 rounded-xl border border-status/[0.18] bg-status/[0.09] px-4 py-3 text-sm font-semibold text-status"
          role="status"
        >
          This film is rated {ageRatingCode}. You cannot buy tickets for it with
          this account.
        </p>
      ) : null}

      {venueGroups.map((group) => (
        <VenueSchedule
          key={group.venue.id}
          group={group}
          isAgeRestricted={isAgeRestricted}
          isAuthLoading={isLoading}
          onSelectSession={selectSession}
        />
      ))}

      {activeSession ? (
        <PurchaseModal
          key={activeSession.id}
          open={isPurchaseOpen}
          session={activeSession}
          movieTitle={movieTitle}
          ageRatingCode={ageRatingCode}
          minimumAge={minimumAge}
          onClose={closePurchase}
          onAuthenticationRequired={(replay) =>
            void handleAuthenticationRequired(replay)
          }
        />
      ) : null}
    </div>
  );
}
