"use client";

import Image from "next/image";
import { useEffect, useState, type FocusEvent } from "react";

import type { Movie } from "../types";

const SLIDE_DURATION_MS = 6500;

function formatPremiereDate(releaseDate: string) {
  const [year, month, day] = releaseDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 4.8v3.4l2.3 1.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 20 20" fill="none">
      <path
        d="m3.4 8.3 5.3-5.2 2 2a2 2 0 0 0 2.8 2.8l2 2-5.3 5.2-2-2a2 2 0 0 0-2.8-2.8l-2-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

type FeaturedHeroProps = {
  movies: Movie[];
};

export function FeaturedHero({ movies }: FeaturedHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (movies.length < 2 || isPaused) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % movies.length);
    }, SLIDE_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, movies.length]);

  if (movies.length === 0) {
    return (
      <section className="flex h-[760px] items-center justify-center bg-page text-sm text-white/[0.58]">
        Featured movies are unavailable right now.
      </section>
    );
  }

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + movies.length) % movies.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % movies.length);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsPaused(false);
    }
  };

  return (
    <section
      className="relative h-[760px] overflow-hidden bg-page text-white"
      aria-roledescription="carousel"
      aria-label="Featured movies"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={handleBlur}
    >
      <div className="absolute inset-0">
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
              index === activeIndex
                ? "scale-100 opacity-100"
                : "scale-[1.025] opacity-0"
            }`}
            aria-hidden={index !== activeIndex}
          >
            {movie.backdropUrl ? (
              <Image
                className="object-cover object-center"
                src={movie.backdropUrl}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,10,18,0.95)_0%,rgba(5,10,18,0.75)_29%,rgba(5,10,18,0.2)_61%,rgba(5,10,18,0.03)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,18,0.36)_0%,transparent_31%,transparent_66%,rgba(5,10,18,0.58)_100%)]" />

      <div
        className="absolute top-[318px] left-20 h-[300px] w-[620px]"
        aria-live={isPaused ? "polite" : "off"}
        aria-atomic="true"
      >
        {movies.map((movie, index) => (
          <article
            key={movie.id}
            className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
              index === activeIndex
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-3 opacity-0"
            }`}
            aria-hidden={index !== activeIndex}
          >
            <p className="inline-flex rounded-full bg-brand/[0.12] px-3 py-1 text-[10px] leading-none font-bold tracking-[0.06em] text-brand uppercase">
              Premiere · {formatPremiereDate(movie.releaseDate)}
            </p>

            <h1 className="mt-5 text-[44px] leading-none font-extrabold tracking-[-0.02em] uppercase">
              {movie.title}
            </h1>

            <div className="mt-5 flex items-center gap-2.5 text-[11px] leading-none font-bold uppercase">
              <span className="rounded-full bg-brand px-3 py-1.5 text-white">
                {movie.ageRating.code}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.1] px-3 py-1.5 text-white/[0.9]">
                <ClockIcon />
                {movie.runtimeMinutes} min
              </span>
              {movie.formats.map((format) => (
                <span
                  key={format.id}
                  className="rounded-full bg-white/[0.1] px-3 py-1.5 text-white/[0.9]"
                >
                  {format.name}
                </span>
              ))}
            </div>

            <p className="mt-5 line-clamp-3 max-w-[610px] text-sm leading-5 text-white/[0.9]">
              {movie.synopsis}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 cursor-default items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-extrabold text-white"
                disabled
              >
                <TicketIcon />
                Buy tickets
              </button>
              <button
                type="button"
                className="inline-flex h-11 cursor-default items-center justify-center rounded-full bg-white/[0.12] px-6 text-sm font-bold text-white"
                disabled
              >
                All sessions
              </button>
            </div>
          </article>
        ))}
      </div>

      {movies.length > 1 ? (
        <div className="absolute right-20 bottom-12 left-20 flex items-center gap-8">
          <div className="flex flex-1 items-center gap-2" aria-label="Choose featured movie">
            {movies.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                className="group flex h-8 flex-1 cursor-pointer items-center"
                aria-label={`Show ${movie.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
              >
                <span
                  className={`h-1 w-full rounded-full transition-colors duration-300 ${
                    index === activeIndex
                      ? "bg-brand"
                      : "bg-white/[0.88] group-hover:bg-white"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/[0.28] text-white transition-colors duration-200 hover:bg-black/[0.48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Previous featured movie"
              onClick={showPrevious}
            >
              <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20" fill="none">
                <path
                  d="m12.5 5-5 5 5 5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full bg-black/[0.28] text-white transition-colors duration-200 hover:bg-black/[0.48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Next featured movie"
              onClick={showNext}
            >
              <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20" fill="none">
                <path
                  d="m7.5 5 5 5-5 5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
