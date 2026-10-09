"use client";

import Image from "next/image";
import Link from "next/link";

import {
  EmptyState,
  RequestErrorState,
} from "@/components/feedback/request-state";
import { useHorizontalCarousel } from "../hooks/use-horizontal-carousel";
import type { Movie } from "../types";

type MovieCarouselProps = {
  title: string;
  movies: Movie[];
  sessionIdsByMovieId: Record<number, number>;
  requestFailed?: boolean;
};

function MovieCarouselState({
  title,
  requestFailed,
}: {
  title: string;
  requestFailed: boolean;
}) {
  return (
    <section className="border-b border-white/[0.08] bg-page px-16 py-10 text-white">
      <div className="mx-auto w-full max-w-[1640px]">
        <h2 className="mb-6 text-2xl leading-7 font-extrabold uppercase">
          {title}
        </h2>
        {requestFailed ? (
          <RequestErrorState
            title={`${title} could not be loaded`}
            message="Please try again to load this movie list."
          />
        ) : (
          <EmptyState
            title={`No ${title.toLowerCase()} movies`}
            message="There are no titles in this list right now. Check back soon for updated screenings."
          />
        )}
      </div>
    </section>
  );
}

function TicketIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="m3.4 8.3 5.3-5.2 2 2a2 2 0 0 0 2.8 2.8l2 2-5.3 5.2-2-2a2 2 0 0 0-2.8-2.8l-2-2Z"
        fill="currentColor"
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

function MovieCardDetails({ movie }: { movie: Movie }) {
  return (
    <>
      <div className="relative h-[330px] shrink-0 overflow-hidden rounded-xl bg-white/[0.04] transition-[height] delay-0 duration-300 ease-out group-hover/movie:h-64 group-hover/movie:delay-300 group-focus-within/movie:h-64 group-focus-within/movie:delay-0 motion-reduce:transition-none">
        {movie.posterUrl ? (
          <Image
            className="pointer-events-none object-cover"
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="236px"
          />
        ) : (
          <div className="flex size-full items-center justify-center px-5 text-center text-sm text-white/[0.45]">
            Poster unavailable
          </div>
        )}
      </div>

      <h3 className="mt-3 truncate text-base leading-5 font-bold text-white">
        {movie.title}
      </h3>
      <p className="mt-1 truncate text-[11px] leading-4 text-white/[0.48]">
        {movie.genres[0]?.name ?? movie.kind} · {movie.runtimeMinutes} min
      </p>
      <p
        className="mt-2 text-[11px] leading-4 font-semibold text-brand"
        title={movie.ageRating.description}
      >
        {movie.ageRating.code}
      </p>

      <div className="mt-0 grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,margin,opacity] delay-0 duration-300 group-hover/movie:mt-2 group-hover/movie:grid-rows-[1fr] group-hover/movie:opacity-100 group-hover/movie:delay-300 group-focus-within/movie:mt-2 group-focus-within/movie:grid-rows-[1fr] group-focus-within/movie:opacity-100 group-focus-within/movie:delay-0 motion-reduce:transition-none">
        <p className="line-clamp-3 overflow-hidden text-sm leading-5 text-white/[0.66]">
          {movie.synopsis}
        </p>
      </div>
    </>
  );
}

export function MovieCarousel({
  title,
  movies,
  sessionIdsByMovieId,
  requestFailed = false,
}: MovieCarouselProps) {
  const {
    viewportRef,
    navigation,
    scrollByPage,
    handlePointerDown,
    handlePointerMove,
    stopDragging,
  } = useHorizontalCarousel(movies.length);

  if (requestFailed || movies.length === 0) {
    return (
      <MovieCarouselState title={title} requestFailed={requestFailed} />
    );
  }

  return (
    <section className="group/carousel relative border-b border-white/[0.08] bg-page px-16 py-10">
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl leading-7 font-extrabold uppercase">
            {title}
          </h2>
          <Link
            href="/sessions"
            className="text-xs font-bold text-brand transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            See all
          </Link>
        </div>

        <div className="relative w-full">
          <div className="relative w-full overflow-hidden">
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
              aria-label={`${title} movies`}
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
            >
              {movies.map((movie) => {
                const sessionId = sessionIdsByMovieId[movie.id];

                return (
                  <article
                    key={movie.id}
                    className="group/movie flex h-[494px] w-[260px] shrink-0 snap-start flex-col rounded-2xl bg-input p-3 transition-[width] delay-0 duration-300 ease-out hover:w-[480px] hover:delay-300 focus-within:w-[480px] focus-within:delay-0 motion-reduce:transition-none"
                  >
                    {sessionId ? (
                      <Link
                        href={`/session/${sessionId}`}
                        className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        aria-label={`View details for ${movie.title}`}
                      >
                        <MovieCardDetails movie={movie} />
                      </Link>
                    ) : (
                      <div>
                        <MovieCardDetails movie={movie} />
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-white">
                        From ₾{movie.fromPrice}
                      </span>
                      {sessionId ? (
                        <Link
                          href={`/session/${sessionId}`}
                          className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-brand px-4 text-xs font-extrabold text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                          <TicketIcon />
                          Buy Ticket
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-1.5 rounded-full bg-brand px-4 text-xs font-extrabold text-white opacity-45"
                          disabled
                        >
                          <TicketIcon />
                          No sessions
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {navigation.hasOverflow ? (
            <>
              <button
                type="button"
                className="absolute top-1/2 -left-16 z-20 inline-flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/[0.52] text-white opacity-0 shadow-lg transition-[opacity,background-color] duration-200 group-hover/carousel:opacity-100 hover:bg-black/[0.72] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label={`Scroll ${title} backward`}
                onClick={() => scrollByPage(-1)}
                disabled={navigation.atStart}
              >
                <CarouselArrow direction="previous" />
              </button>
              <button
                type="button"
                className="absolute top-1/2 -right-16 z-20 inline-flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/[0.52] text-white opacity-0 shadow-lg transition-[opacity,background-color] duration-200 group-hover/carousel:opacity-100 hover:bg-black/[0.72] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label={`Scroll ${title} forward`}
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
