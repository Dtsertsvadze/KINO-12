"use client";

import { useEffect } from "react";

import { addRecentlyViewedMovie } from "../recently-viewed-storage";
import type { MovieDetail } from "../types";

type RecentlyViewedTrackerProps = {
  movie: MovieDetail;
  sessionId: number;
};

export function RecentlyViewedTracker({
  movie,
  sessionId,
}: RecentlyViewedTrackerProps) {
  const genre = movie.genres[0]?.name ?? movie.kind;

  useEffect(() => {
    addRecentlyViewedMovie({
      id: movie.id,
      sessionId,
      title: movie.title,
      posterUrl: movie.posterUrl,
      runtimeMinutes: movie.runtimeMinutes,
      genre,
      ageRatingCode: movie.ageRating.code,
      viewedAt: Date.now(),
    });
  }, [
    genre,
    movie.ageRating.code,
    movie.id,
    movie.posterUrl,
    movie.runtimeMinutes,
    movie.title,
    sessionId,
  ]);

  return null;
}
