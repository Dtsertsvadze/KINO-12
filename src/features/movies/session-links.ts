import { getMovieVenueSessions } from "@/features/sessions/api";
import { getSessionDateChoices } from "@/features/sessions/query";

import { getMovieDetail } from "./api";
import type { Movie } from "./types";

export async function getMovieSessionIds(
  movies: Movie[],
  today: string,
): Promise<Record<number, number>> {
  const nextSevenDates = new Set(
    getSessionDateChoices(today).map((date) => date.value),
  );
  const uniqueMovies = Array.from(
    new Map(movies.map((movie) => [movie.id, movie])).values(),
  );

  const entries = await Promise.all(
    uniqueMovies.map(async (movie): Promise<[number, number] | null> => {
      try {
        const detail = await getMovieDetail(movie.slug);
        const firstAvailableDate = detail.availableDates.find((date) =>
          nextSevenDates.has(date),
        );

        if (!firstAvailableDate) {
          return null;
        }

        const venueGroups = await getMovieVenueSessions(
          movie.slug,
          firstAvailableDate,
        );
        const sessions = venueGroups
          .flatMap((group) => group.sessions)
          .sort((first, second) =>
            first.startsAt.localeCompare(second.startsAt),
          );
        const session =
          sessions.find((candidate) => !candidate.isSoldOut) ?? sessions[0];

        return session ? [movie.id, session.id] : null;
      } catch {
        return null;
      }
    }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is [number, number] => entry !== null),
  );
}
