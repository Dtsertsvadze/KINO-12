"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  EmptyState,
  RequestErrorState,
} from "@/components/feedback/request-state";
import { AuthApiError } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-provider";
import { getAuthenticatedComingSoonMovies, notifyMovie } from "../api";
import { useHorizontalCarousel } from "../hooks/use-horizontal-carousel";
import type { Movie } from "../types";

type ComingSoonCarouselProps = {
  movies: Movie[];
  requestFailed?: boolean;
};

function formatReleaseDate(releaseDate: string) {
  const [year, month, day] = releaseDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(date.getTime())) {
    return releaseDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 20 20" fill="none">
      <path
        d="M5.8 8.2a4.2 4.2 0 1 1 8.4 0c0 4.5 1.8 5 1.8 5H4s1.8-.5 1.8-5ZM8.2 15.4a2 2 0 0 0 3.6 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 20 20" fill="none">
      <path
        d="m4.5 10.2 3.4 3.4 7.6-7.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CarouselArrow({ direction }: { direction: "previous" | "next" }) {
  const isPrevious = direction === "previous";

  return (
    <svg aria-hidden="true" className="size-7" viewBox="0 0 20 20" fill="none">
      <path
        d={isPrevious ? "m12.5 5-5 5 5 5" : "m7.5 5 5 5-5 5"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ComingSoonCarousel({
  movies,
  requestFailed = false,
}: ComingSoonCarouselProps) {
  const { user, isLoading: isAuthLoading, openLogin, signOut } = useAuth();
  const [notifiedMovieIds, setNotifiedMovieIds] = useState(
    () =>
      new Set(
        movies.filter((movie) => movie.isNotified).map((movie) => movie.id),
      ),
  );
  const [submittingMovieIds, setSubmittingMovieIds] = useState(
    () => new Set<number>(),
  );
  const [notificationErrors, setNotificationErrors] = useState<
    Record<number, string>
  >({});
  const [isRefreshingNotifications, setIsRefreshingNotifications] =
    useState(false);
  const [notificationRefreshError, setNotificationRefreshError] =
    useState<string>();
  const inFlightMovieIdsRef = useRef(new Set<number>());
  const notificationRefreshIdRef = useRef(0);
  const {
    viewportRef,
    navigation,
    scrollByPage,
    handlePointerDown,
    handlePointerMove,
    stopDragging,
  } = useHorizontalCarousel(movies.length);

  const refreshNotificationStatus = useCallback(async () => {
    if (!user) {
      return;
    }

    const refreshId = notificationRefreshIdRef.current + 1;
    notificationRefreshIdRef.current = refreshId;
    setIsRefreshingNotifications(true);
    setNotificationRefreshError(undefined);

    try {
      const personalizedMovies = await getAuthenticatedComingSoonMovies();
      if (notificationRefreshIdRef.current === refreshId) {
        setNotifiedMovieIds(
          new Set(
            personalizedMovies
              .filter((movie) => movie.isNotified)
              .map((movie) => movie.id),
          ),
        );
      }
    } catch (error) {
      if (notificationRefreshIdRef.current === refreshId) {
        setNotificationRefreshError(
          error instanceof Error
            ? error.message
            : "Could not refresh reminder status.",
        );
      }
      throw error;
    } finally {
      if (notificationRefreshIdRef.current === refreshId) {
        setIsRefreshingNotifications(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void refreshNotificationStatus().catch(async (error: unknown) => {
      if (error instanceof AuthApiError && error.status === 401) {
        await signOut();
        openLogin();
      }
    });
  }, [openLogin, refreshNotificationStatus, signOut, user]);

  const subscribeToMovie = useCallback(
    async (movie: Pick<Movie, "id" | "slug">) => {
      if (inFlightMovieIdsRef.current.has(movie.id)) {
        return;
      }

      inFlightMovieIdsRef.current.add(movie.id);
      setSubmittingMovieIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(movie.id);
        return nextIds;
      });
      setNotificationErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[movie.id];
        return nextErrors;
      });

      try {
        await notifyMovie(movie.slug);
        await refreshNotificationStatus();
      } catch (error) {
        if (error instanceof AuthApiError && error.status === 401) {
          await signOut();
          openLogin(() => subscribeToMovie(movie));
        } else {
          setNotificationErrors((currentErrors) => ({
            ...currentErrors,
            [movie.id]:
              error instanceof Error
                ? error.message
                : "Could not set the reminder. Try again.",
          }));
        }
      } finally {
        inFlightMovieIdsRef.current.delete(movie.id);
        setSubmittingMovieIds((currentIds) => {
          const nextIds = new Set(currentIds);
          nextIds.delete(movie.id);
          return nextIds;
        });
      }
    },
    [openLogin, refreshNotificationStatus, signOut],
  );

  function handleNotify(movie: Pick<Movie, "id" | "slug">) {
    if (
      isAuthLoading ||
      notifiedMovieIds.has(movie.id) ||
      submittingMovieIds.has(movie.id)
    ) {
      return;
    }

    if (!user) {
      openLogin(() => subscribeToMovie(movie));
      return;
    }

    void subscribeToMovie(movie);
  }

  if (requestFailed || movies.length === 0) {
    return (
      <section className="border-b border-white/[0.08] bg-page px-16 py-10 text-white">
        <div className="mx-auto w-full max-w-[1640px]">
          <h2 className="mb-6 text-2xl leading-7 font-extrabold uppercase">
            Coming Soon...
          </h2>
          {requestFailed ? (
            <RequestErrorState
              title="Coming soon movies could not be loaded"
              message="Please try again to load upcoming releases."
            />
          ) : (
            <EmptyState
              title="No upcoming releases"
              message="No coming-soon titles have been announced yet. Check back soon for new releases."
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="group/carousel border-b border-white/[0.08] bg-page px-16 py-10">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl leading-7 font-extrabold uppercase">
            Coming Soon...
          </h2>
          {isAuthLoading || isRefreshingNotifications ? (
            <span className="text-xs font-semibold text-white/[0.5]" role="status">
              Checking reminders…
            </span>
          ) : notificationRefreshError ? (
            <button
              type="button"
              className="cursor-pointer text-xs font-bold text-brand hover:brightness-125"
              onClick={() => void refreshNotificationStatus().catch(() => undefined)}
            >
              Retry reminder status
            </button>
          ) : (
            <span className="text-xs font-bold text-brand">See all</span>
          )}
        </div>

        <div className="relative w-full">
          <div className="relative overflow-hidden">
            <div
              ref={viewportRef}
              className="flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto pr-[4%] pb-1 select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, black 0%, black 96%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, black 0%, black 96%, transparent 100%)",
              }}
              role="region"
              aria-label="Coming soon movies"
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
            >
              {movies.map((movie) => (
                <article
                  key={movie.id}
                  className="flex h-44 w-[500px] shrink-0 snap-start gap-4 rounded-2xl bg-input p-3"
                >
                  <div className="relative h-full w-60 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                    {movie.posterUrl ? (
                      <Image
                        className="pointer-events-none object-cover"
                        src={movie.posterUrl}
                        alt={`${movie.title} poster`}
                        fill
                        sizes="240px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center px-4 text-center text-xs text-white/[0.45]">
                        Poster unavailable
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col py-1">
                    <p className="text-[10px] leading-3 font-extrabold tracking-[0.02em] text-brand uppercase">
                      In cinemas {formatReleaseDate(movie.releaseDate)}
                    </p>
                    <h3 className="mt-2 truncate text-sm leading-4 font-bold text-white">
                      {movie.title}
                    </h3>
                    <p className="mt-1 truncate text-[11px] leading-4 text-white/[0.5]">
                      {movie.genres[0]?.name ?? movie.kind} ·{" "}
                      {movie.runtimeMinutes} min
                    </p>
                    <span
                      className="mt-2 w-fit rounded-full bg-brand/[0.12] px-2 py-1 text-[10px] leading-none font-bold text-brand"
                      title={movie.ageRating.description}
                    >
                      {movie.ageRating.code}
                    </span>

                    <button
                      type="button"
                      className={`mt-auto inline-flex h-8 w-fit cursor-default items-center justify-center gap-1.5 rounded-full px-3 text-[11px] font-bold text-white ${
                        notifiedMovieIds.has(movie.id)
                          ? "bg-white/[0.16]"
                          : notificationErrors[movie.id]
                            ? "cursor-pointer border border-brand transition-colors hover:bg-brand/[0.08]"
                            : "cursor-pointer border border-white/[0.72] transition-colors hover:bg-white/[0.08]"
                      }`}
                      title={notificationErrors[movie.id]}
                      aria-live="polite"
                      onClick={() => handleNotify(movie)}
                      disabled={
                        isAuthLoading ||
                        submittingMovieIds.has(movie.id) ||
                        notifiedMovieIds.has(movie.id)
                      }
                    >
                      {notifiedMovieIds.has(movie.id) ? (
                        <CheckIcon />
                      ) : (
                        <BellIcon />
                      )}
                      {notifiedMovieIds.has(movie.id)
                        ? "Reminder set"
                        : submittingMovieIds.has(movie.id)
                          ? "Setting reminder..."
                          : notificationErrors[movie.id]
                            ? "Try again"
                            : "Notify Me"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {navigation.hasOverflow ? (
            <>
              <button
                type="button"
                className="absolute top-1/2 -left-16 z-20 inline-flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/[0.52] text-white opacity-0 shadow-lg transition-[opacity,background-color] duration-200 group-hover/carousel:opacity-100 hover:bg-black/[0.72] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Scroll coming soon movies backward"
                onClick={() => scrollByPage(-1)}
                disabled={navigation.atStart}
              >
                <CarouselArrow direction="previous" />
              </button>
              <button
                type="button"
                className="absolute top-1/2 -right-16 z-20 inline-flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/[0.52] text-white opacity-0 shadow-lg transition-[opacity,background-color] duration-200 group-hover/carousel:opacity-100 hover:bg-black/[0.72] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Scroll coming soon movies forward"
                onClick={() => scrollByPage(1)}
                disabled={navigation.atEnd}
              >
                <CarouselArrow direction="next" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
