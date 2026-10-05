import { getApiUrl } from "@/config/api";
import { requestAuthenticated } from "@/features/auth/api";
import type { Movie, MoviesResponse } from "./types";

async function getMovies(path: `/${string}`, requestName: string) {
  const response = await fetch(getApiUrl(path), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${requestName} request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as MoviesResponse;
  return payload.data;
}

export function getFeaturedMovies(): Promise<Movie[]> {
  return getMovies("/movies/featured", "Featured movies");
}

export function getNowPlayingMovies(): Promise<Movie[]> {
  return getMovies("/movies/now-playing", "Now-playing movies");
}

export function getComingSoonMovies(): Promise<Movie[]> {
  return getMovies("/movies/coming-soon", "Coming-soon movies");
}

export async function getAuthenticatedComingSoonMovies(): Promise<Movie[]> {
  const response = await requestAuthenticated<MoviesResponse>(
    "/movies/coming-soon",
  );

  return response.data;
}

export async function notifyMovie(movieSlug: string): Promise<void> {
  await requestAuthenticated(
    `/movies/${encodeURIComponent(movieSlug)}/notify`,
    { method: "POST" },
  );
}
