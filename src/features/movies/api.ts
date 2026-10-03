import { getApiUrl } from "@/config/api";
import type { FeaturedMovie, FeaturedMoviesResponse } from "./types";

export async function getFeaturedMovies(): Promise<FeaturedMovie[]> {
  const response = await fetch(getApiUrl("/movies/featured"), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Featured movies request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as FeaturedMoviesResponse;
  return payload.data;
}
