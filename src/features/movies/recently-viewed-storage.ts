import type { RecentlyViewedMovie } from "./types";

const RECENTLY_VIEWED_STORAGE_KEY = "kino-xii:recently-viewed:v1";
const RECENTLY_VIEWED_CHANGED_EVENT = "kino-xii:recently-viewed-changed";
const MAX_RECENTLY_VIEWED_MOVIES = 6;
const EMPTY_RECENTLY_VIEWED_MOVIES: readonly RecentlyViewedMovie[] = [];

let cachedValue: string | null | undefined;
let cachedMovies: readonly RecentlyViewedMovie[] = EMPTY_RECENTLY_VIEWED_MOVIES;

function isRecentlyViewedMovie(value: unknown): value is RecentlyViewedMovie {
  if (!value || typeof value !== "object") {
    return false;
  }

  const movie = value as Record<string, unknown>;

  return (
    typeof movie.id === "number" &&
    typeof movie.sessionId === "number" &&
    typeof movie.title === "string" &&
    (typeof movie.posterUrl === "string" || movie.posterUrl === null) &&
    typeof movie.runtimeMinutes === "number" &&
    typeof movie.genre === "string" &&
    typeof movie.ageRatingCode === "string" &&
    typeof movie.viewedAt === "number"
  );
}

function parseRecentlyViewedMovies(value: string | null) {
  if (!value) {
    return EMPTY_RECENTLY_VIEWED_MOVIES;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return EMPTY_RECENTLY_VIEWED_MOVIES;
    }

    return parsed
      .filter(isRecentlyViewedMovie)
      .slice(0, MAX_RECENTLY_VIEWED_MOVIES);
  } catch {
    return EMPTY_RECENTLY_VIEWED_MOVIES;
  }
}

export function getRecentlyViewedMoviesSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_RECENTLY_VIEWED_MOVIES;
  }

  try {
    const storedValue = window.localStorage.getItem(
      RECENTLY_VIEWED_STORAGE_KEY,
    );

    if (storedValue !== cachedValue) {
      cachedValue = storedValue;
      cachedMovies = parseRecentlyViewedMovies(storedValue);
    }

    return cachedMovies;
  } catch {
    return EMPTY_RECENTLY_VIEWED_MOVIES;
  }
}

export function getRecentlyViewedMoviesServerSnapshot() {
  return EMPTY_RECENTLY_VIEWED_MOVIES;
}

export function subscribeToRecentlyViewedMovies(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === RECENTLY_VIEWED_STORAGE_KEY ||
      event.key === null
    ) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(RECENTLY_VIEWED_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(RECENTLY_VIEWED_CHANGED_EVENT, onStoreChange);
  };
}

export function addRecentlyViewedMovie(movie: RecentlyViewedMovie) {
  if (typeof window === "undefined") {
    return;
  }

  const movies = getRecentlyViewedMoviesSnapshot();
  const nextMovies = [
    movie,
    ...movies.filter((recentMovie) => recentMovie.id !== movie.id),
  ].slice(0, MAX_RECENTLY_VIEWED_MOVIES);
  const serializedMovies = JSON.stringify(nextMovies);

  try {
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      serializedMovies,
    );
    cachedValue = serializedMovies;
    cachedMovies = nextMovies;
    window.dispatchEvent(new Event(RECENTLY_VIEWED_CHANGED_EVENT));
  } catch {
    // A blocked or full localStorage must not prevent viewing a movie.
  }
}
