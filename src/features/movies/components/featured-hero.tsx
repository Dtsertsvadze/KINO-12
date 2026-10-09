"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
} from "react";

import {
  EmptyState,
  RequestErrorState,
} from "@/components/feedback/request-state";
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

function AnimatedMovieDetails({ movie }: { movie: Movie }) {
  const detailsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = detailsRef.current;

    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const animation = element.animate(
      [
        { opacity: 0, transform: "translateY(32px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 560,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );

    return () => animation.cancel();
  }, []);

  return (
    <div ref={detailsRef}>
      <h1 className="mt-5 text-[44px] leading-none font-extrabold tracking-[-0.02em] uppercase">
        {movie.title}
      </h1>

      <div className="mt-5 flex items-center gap-2.5 text-[11px] leading-none font-bold uppercase">
        <span className="rounded-full bg-brand px-3 py-1.5 text-foreground">
          {movie.ageRating.code}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.1] px-3 py-1.5 text-foreground/[0.9]">
          <ClockIcon />
          {movie.runtimeMinutes} min
        </span>
        {movie.formats.map((format) => (
          <span
            key={format.id}
            className="rounded-full bg-foreground/[0.1] px-3 py-1.5 text-foreground/[0.9]"
          >
            {format.name}
          </span>
        ))}
      </div>

      <p className="mt-5 line-clamp-3 max-w-[610px] text-sm leading-5 text-foreground/[0.9]">
        {movie.synopsis}
      </p>
    </div>
  );
}

type FeaturedHeroProps = {
  movies: Movie[];
  sessionIdsByMovieId: Record<number, number>;
  requestFailed?: boolean;
};

export function FeaturedHero({
  movies,
  sessionIdsByMovieId,
  requestFailed = false,
}: FeaturedHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomedIndex, setZoomedIndex] = useState<number>();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let entranceFrame: number | undefined;
    const preparationFrame = window.requestAnimationFrame(() => {
      entranceFrame = window.requestAnimationFrame(() => {
        setZoomedIndex(activeIndex);
      });
    });

    return () => {
      window.cancelAnimationFrame(preparationFrame);

      if (entranceFrame !== undefined) {
        window.cancelAnimationFrame(entranceFrame);
      }
    };
  }, [activeIndex]);

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

  if (requestFailed) {
    return (
      <section className="h-[760px] bg-page p-16 text-foreground">
        <RequestErrorState
          className="h-full"
          title="Featured movies could not be loaded"
          message="Please retry the request to restore the featured movie preview."
        />
      </section>
    );
  }

  if (movies.length === 0) {
    return (
      <section className="h-[760px] bg-page p-16 text-foreground">
        <EmptyState
          className="h-full"
          title="No featured movies"
          message="There are no featured titles available right now. Check back soon for the next premiere."
        />
      </section>
    );
  }

  const activeMovie = movies[activeIndex] ?? movies[0];

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
      className="relative h-[760px] overflow-hidden bg-page text-foreground"
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
            className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
            aria-hidden={index !== activeIndex}
          >
            <div
              className={`absolute inset-0 transition-transform duration-[6200ms] ease-linear motion-reduce:transform-none motion-reduce:transition-none ${
                index === activeIndex && zoomedIndex === index
                  ? "scale-[1.07]"
                  : "scale-100"
              }`}
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
        <article key={activeMovie.id} className="absolute inset-0">
          <p className="inline-flex rounded-full bg-brand/[0.12] px-3 py-1 text-[10px] leading-none font-bold tracking-[0.06em] text-brand uppercase">
            Premiere · {formatPremiereDate(activeMovie.releaseDate)}
          </p>

          <AnimatedMovieDetails
            key={activeMovie.id}
            movie={activeMovie}
          />

          <div className="mt-6 flex items-center gap-3">
            {sessionIdsByMovieId[activeMovie.id] ? (
              <Link
                href={`/session/${sessionIdsByMovieId[activeMovie.id]}`}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-extrabold text-foreground transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <TicketIcon />
                Buy tickets
              </Link>
            ) : (
              <button
                type="button"
                className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-extrabold text-foreground opacity-45"
                disabled
              >
                <TicketIcon />
                No sessions
              </button>
            )}
            <Link
              href="/sessions"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-foreground/[0.12] px-6 text-sm font-bold text-foreground transition-colors hover:bg-foreground/[0.2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              All sessions
            </Link>
          </div>
        </article>
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
                      : "bg-foreground/[0.88] group-hover:bg-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full bg-scrim/[0.28] text-foreground transition-colors duration-200 hover:bg-scrim/[0.48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
              className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full bg-scrim/[0.28] text-foreground transition-colors duration-200 hover:bg-scrim/[0.48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
