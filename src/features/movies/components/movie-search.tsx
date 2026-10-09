"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getTodayInTbilisi } from "@/features/sessions/query";

import { searchMovies } from "../api";
import { getFirstMovieSessionId } from "../session-links";
import type { Movie } from "../types";

type SearchStatus = "idle" | "loading" | "success" | "error";

type NavigationFailure = {
  movie: Movie;
  message: string;
  canRetry: boolean;
};

function SearchIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`${className} shrink-0`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-3" viewBox="0 0 16 16" fill="none">
      <path
        d="m4.5 4.5 7 7m0-7-7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function BrowseSessionsLink({ onClick }: { onClick: () => void }) {
  return (
    <Link
      href="/sessions"
      className="mt-5 inline-flex h-9 items-center justify-center rounded-full bg-surface px-5 text-xs font-bold transition-colors hover:bg-foreground/[0.16] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      onClick={onClick}
    >
      Browse all sessions
    </Link>
  );
}

function IdleSearchState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center px-6 py-7 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-surface text-muted">
        <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20" fill="none">
          <path
            d="M4.5 6h11M8 3.8h4M6 6l.7 10h6.6L14 6M8.4 8.5v5m3.2-5v5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.3"
          />
        </svg>
      </span>
      <p className="mt-4 text-xs font-extrabold">What do you want to watch?</p>
      <p className="mt-1 text-[11px] text-muted">
        Search by title, director or cast
      </p>
      <BrowseSessionsLink onClick={onClose} />
    </div>
  );
}

function SearchLoadingState() {
  return (
    <div className="px-4 py-4" role="status" aria-label="Searching movies">
      <div className="mb-3 h-2.5 w-28 animate-pulse rounded-full bg-light-tint motion-reduce:animate-none" />
      <div className="grid gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex h-14 items-center gap-3">
            <div className="h-14 w-10 animate-pulse rounded-md bg-light-tint motion-reduce:animate-none" />
            <div className="flex-1">
              <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-light-tint motion-reduce:animate-none" />
              <div className="mt-2 h-2 w-1/3 animate-pulse rounded-full bg-foreground/[0.07] motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoResultsState({ query, onClose }: { query: string; onClose: () => void }) {
  return (
    <div className="flex min-h-[210px] flex-col items-center justify-center px-6 py-7 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-surface text-muted">
        <SearchIcon className="size-4" />
      </span>
      <p className="mt-4 text-xs font-extrabold">
        No results for “{query.trim()}”
      </p>
      <p className="mt-1 text-[11px] text-muted">
        Check the spelling or try another film or live event.
      </p>
      <BrowseSessionsLink onClick={onClose} />
    </div>
  );
}

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

export function MovieSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openingMovieIdRef = useRef<number | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [retryKey, setRetryKey] = useState(0);
  const [openingMovieId, setOpeningMovieId] = useState<number | null>(null);
  const [navigationFailure, setNavigationFailure] =
    useState<NavigationFailure>();

  useEffect(() => {
    const controller = new AbortController();
    const requestQuery = query;
    const timeoutId = window.setTimeout(() => {
      void searchMovies(requestQuery, controller.signal)
        .then((movies) => {
          setResults(movies);
          setStatus("success");
          setActiveIndex(-1);
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          setResults([]);
          setStatus("error");
          setActiveIndex(-1);
        });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, retryKey]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function closeSearch() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setResults([]);
    setStatus(value.trim() ? "loading" : "idle");
    setActiveIndex(-1);
    setNavigationFailure(undefined);
    setIsOpen(true);
  }

  function clearSearch() {
    handleQueryChange("");
    inputRef.current?.focus();
  }

  async function openMovie(movie: Movie) {
    if (movie.isComingSoon || openingMovieIdRef.current !== null) {
      return;
    }

    openingMovieIdRef.current = movie.id;
    setOpeningMovieId(movie.id);
    setNavigationFailure(undefined);

    try {
      const sessionId = await getFirstMovieSessionId(
        movie,
        getTodayInTbilisi(),
      );

      if (!sessionId) {
        setNavigationFailure({
          movie,
          message: "No upcoming sessions are available for this title.",
          canRetry: false,
        });
        return;
      }

      setIsOpen(false);
      setQuery("");
      setResults([]);
      setStatus("idle");
      router.push(`/session/${sessionId}`);
    } catch {
      setNavigationFailure({
        movie,
        message: `Could not open ${movie.title}. Please try again.`,
        canRetry: true,
      });
    } finally {
      openingMovieIdRef.current = null;
      setOpeningMovieId(null);
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      void openMovie(results[activeIndex]);
    }
  }

  const hasQuery = query.trim().length > 0;
  const activeResultId =
    activeIndex >= 0 ? `movie-search-result-${results[activeIndex]?.id}` : undefined;

  return (
    <div ref={containerRef} className="relative w-[380px]">
      <div className="flex h-[41px] items-center gap-2 rounded-full border border-foreground/[0.04] bg-foreground/[0.14] px-3 py-1.5 text-xs leading-none font-normal text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[10px] transition-colors focus-within:border-foreground/[0.2] focus-within:bg-foreground/[0.18]">
        <SearchIcon />
        <input
          ref={inputRef}
          type="search"
          name="movie-search"
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
          placeholder="Search films and live events"
          value={query}
          role="combobox"
          aria-label="Search films and live events"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="movie-search-listbox"
          aria-activedescendant={activeResultId}
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        {hasQuery ? (
          <button
            type="button"
            className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground/[0.16] text-muted transition-colors hover:bg-foreground/[0.24] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
            aria-label="Clear search"
            onClick={clearSearch}
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div
          className="absolute top-[calc(100%+8px)] left-0 z-50 w-full overflow-hidden rounded-xl border border-foreground/[0.12] bg-page shadow-[0_18px_50px_rgba(0,0,0,0.42)]"
        >
          {!hasQuery ? (
            <IdleSearchState onClose={closeSearch} />
          ) : status === "loading" ? (
            <SearchLoadingState />
          ) : status === "error" ? (
            <div className="flex min-h-[170px] flex-col items-center justify-center px-6 py-7 text-center" role="alert">
              <p className="text-xs font-extrabold">Search is unavailable</p>
              <p className="mt-1 text-[11px] text-muted">
                We could not load results. Please try again.
              </p>
              <button
                type="button"
                className="mt-5 h-9 cursor-pointer rounded-full bg-brand px-5 text-xs font-bold transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={() => {
                  setStatus("loading");
                  setRetryKey((current) => current + 1);
                }}
              >
                Retry
              </button>
            </div>
          ) : results.length === 0 ? (
            <NoResultsState query={query} onClose={closeSearch} />
          ) : (
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between px-1 text-[9px] font-semibold tracking-[0.08em] text-muted uppercase">
                <span>Films &amp; Events</span>
                <span>
                  {results.length} {results.length === 1 ? "result" : "results"}
                </span>
              </div>

              <div
                id="movie-search-listbox"
                role="listbox"
                aria-label="Movie search results"
              >
                {results.map((movie, index) => {
                  const isActive = index === activeIndex;
                  const isOpening = openingMovieId === movie.id;

                  return (
                    <button
                      key={movie.id}
                      id={`movie-search-result-${movie.id}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={movie.isComingSoon}
                      className={`flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors ${
                        movie.isComingSoon
                          ? "cursor-default"
                          : "cursor-pointer hover:bg-foreground/[0.07]"
                      } ${isActive ? "bg-foreground/[0.07]" : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => void openMovie(movie)}
                    >
                      <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-foreground/[0.06]">
                        {movie.posterUrl ? (
                          <Image
                            src={movie.posterUrl}
                            alt={`${movie.title} poster`}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center px-1 text-center text-[8px] text-muted">
                            No poster
                          </span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-foreground">
                          {movie.title}
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-muted">
                          {movie.kind === "film" ? "Film" : "Event"} · {movie.ageRating.code} · {movie.runtimeMinutes} min
                        </span>
                      </span>

                      <span
                        className={`shrink-0 text-[10px] font-bold ${
                          movie.isComingSoon ? "text-warning" : "text-foreground"
                        }`}
                      >
                        {movie.isComingSoon
                          ? "Coming Soon"
                          : isOpening
                            ? "Opening…"
                            : `from ₾${formatPrice(movie.fromPrice)}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {navigationFailure ? (
                <div
                  className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-error/[0.1] px-3 py-2 text-[10px] text-error"
                  role="alert"
                >
                  <span>{navigationFailure.message}</span>
                  {navigationFailure.canRetry ? (
                    <button
                      type="button"
                      className="shrink-0 cursor-pointer font-extrabold underline underline-offset-2"
                      onClick={() => void openMovie(navigationFailure.movie)}
                    >
                      Try again
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
