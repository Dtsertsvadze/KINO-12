"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  getRecentlyViewedMoviesServerSnapshot,
  getRecentlyViewedMoviesSnapshot,
  subscribeToRecentlyViewedMovies,
} from "../recently-viewed-storage";
import { useHorizontalCarousel } from "../hooks/use-horizontal-carousel";

function CarouselArrow({ direction }: { direction: "previous" | "next" }) {
  const isPrevious = direction === "previous";

  return (
    <svg aria-hidden="true" className="size-6" viewBox="0 0 20 20" fill="none">
      <path
        d={isPrevious ? "m12.5 5-5 5 5 5" : "m7.5 5 5 5-5 5"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function RecentlyViewedSection() {
  const movies = useSyncExternalStore(
    subscribeToRecentlyViewedMovies,
    getRecentlyViewedMoviesSnapshot,
    getRecentlyViewedMoviesServerSnapshot,
  );
  const {
    viewportRef,
    navigation,
    scrollByPage,
    handlePointerDown,
    handlePointerMove,
    stopDragging,
  } = useHorizontalCarousel(movies.length);

  if (movies.length === 0) {
    return null;
  }

  return (
    <section
      className="border-b border-foreground/[0.08] bg-page px-16 py-9 text-foreground"
      aria-labelledby="recently-viewed-heading"
    >
      <div className="mx-auto w-full max-w-[1640px]">
        <div className="flex items-center justify-between gap-6">
          <h2
            id="recently-viewed-heading"
            className="text-2xl leading-7 font-extrabold"
          >
            Recently viewed
          </h2>

          {navigation.hasOverflow ? (
            <nav
              className="flex items-center gap-2"
              aria-label="Recently viewed navigation"
            >
              <button
                type="button"
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default disabled:opacity-35"
                aria-label="Scroll recently viewed backward"
                disabled={navigation.atStart}
                onClick={() => scrollByPage(-1)}
              >
                <CarouselArrow direction="previous" />
              </button>
              <button
                type="button"
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-foreground/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default disabled:opacity-35"
                aria-label="Scroll recently viewed forward"
                disabled={navigation.atEnd}
                onClick={() => scrollByPage(1)}
              >
                <CarouselArrow direction="next" />
              </button>
            </nav>
          ) : null}
        </div>

        <div
          ref={viewportRef}
          className="mt-5 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-label="Recently viewed movies"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          {movies.map((movie) => (
            <article
              key={movie.id}
              className="w-[calc((100%-4rem)/5)] shrink-0 snap-start"
            >
              <Link
                href={`/session/${movie.sessionId}`}
                className="flex h-[72px] w-full items-center gap-2 rounded-2xl bg-surface p-2 transition-colors hover:bg-light-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-label={`View ${movie.title}`}
              >
                <div className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-xl bg-foreground/[0.05]">
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt={`${movie.title} poster`}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center px-2 text-center text-[9px] text-muted">
                      No poster
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-xs leading-4 font-extrabold uppercase">
                    {movie.title}
                  </h3>
                  <p className="mt-0.5 truncate text-[10px] leading-4 text-muted">
                    {movie.genre} · {movie.runtimeMinutes} min
                  </p>
                  <span
                    className="mt-0.5 inline-flex rounded-full bg-brand-tint px-2 py-0.5 text-[9px] leading-3 font-bold text-brand"
                    aria-label={`Rated ${movie.ageRatingCode}`}
                  >
                    {movie.ageRatingCode}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
