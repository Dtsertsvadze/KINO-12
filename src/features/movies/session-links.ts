import { getMovieVenueSessions } from "@/features/sessions/api";
import { getSessionDateChoices } from "@/features/sessions/query";

import { getMovieDetail } from "./api";
import type { Movie } from "./types";

export async function getFirstMovieSessionId(movie: Movie, today: string) {
  const nextSevenDates = new Set(
    getSessionDateChoices(today).map((date) => date.value),
  );
  const detail = await getMovieDetail(movie.slug);
  const firstAvailableDate = detail.availableDates.find((date) =>
    nextSevenDates.has(date),
  );

  if (!firstAvailableDate) {
    return undefined;
  }

  const venueGroups = await getMovieVenueSessions(
    movie.slug,
    firstAvailableDate,
  );
  const sessions = venueGroups
    .flatMap((group) => group.sessions)
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt));
  const session =
    sessions.find((candidate) => !candidate.isSoldOut) ?? sessions[0];

  return session?.id;
}

export async function getMovieSessionIds(
  movies: Movie[],
  today: string,
): Promise<Record<number, number>> {
  const uniqueMovies = Array.from(
    new Map(movies.map((movie) => [movie.id, movie])).values(),
  );

  const entries = await Promise.all(
    uniqueMovies.map(async (movie): Promise<[number, number] | null> => {
      try {
        const sessionId = await getFirstMovieSessionId(movie, today);

        return sessionId ? [movie.id, sessionId] : null;
      } catch {
        return null;
      }
    }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is [number, number] => entry !== null),
  );
}
