"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  getRecentlyViewedMoviesServerSnapshot,
  getRecentlyViewedMoviesSnapshot,
  subscribeToRecentlyViewedMovies,
} from "../recently-viewed-storage";

export function RecentlyViewedSection() {
  const movies = useSyncExternalStore(
    subscribeToRecentlyViewedMovies,
    getRecentlyViewedMoviesSnapshot,
    getRecentlyViewedMoviesServerSnapshot,
  );

  if (movies.length === 0) {
    return null;
  }

  return (
    <section
      className="border-b border-foreground/[0.08] bg-page px-16 py-9 text-foreground"
      aria-labelledby="recently-viewed-heading"
    >
      <div className="mx-auto w-full max-w-[1640px]">
        <h2
          id="recently-viewed-heading"
          className="text-2xl leading-7 font-extrabold"
        >
          Recently viewed
        </h2>

        <div className="mt-5 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {movies.map((movie) => (
            <article key={movie.id} className="shrink-0">
              <Link
                href={`/session/${movie.sessionId}`}
                className="flex h-[72px] w-[274px] items-center gap-2 rounded-2xl bg-surface p-2 transition-colors hover:bg-foreground/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
                    <span className="flex size-full items-center justify-center px-2 text-center text-[9px] text-foreground/[0.45]">
                      No poster
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-xs leading-4 font-extrabold uppercase">
                    {movie.title}
                  </h3>
                  <p className="mt-0.5 truncate text-[10px] leading-4 text-foreground/[0.5]">
                    {movie.genre} · {movie.runtimeMinutes} min
                  </p>
                  <span
                    className="mt-0.5 inline-flex rounded-full bg-brand/[0.12] px-2 py-0.5 text-[9px] leading-3 font-bold text-brand"
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
