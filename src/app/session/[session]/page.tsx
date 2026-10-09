import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMovieDetail } from "@/features/movies/api";
import {
  getMovieVenueSessions,
  getSession,
  SessionsApiError,
} from "@/features/sessions/api";
import { SessionDetailPage } from "@/features/sessions/components/session-detail-page";
import {
  getSessionDateChoices,
  getTodayInTbilisi,
} from "@/features/sessions/query";
import type { SessionDetail } from "@/features/sessions/types";

export const metadata: Metadata = {
  title: "Session | Kino XII",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SessionPage({
  params,
  searchParams,
}: PageProps<"/session/[session]">) {
  const { session: sessionId } = await params;
  const rawSearchParams = await searchParams;

  let selectedSession: SessionDetail;

  try {
    selectedSession = await getSession(sessionId);
  } catch (error) {
    if (error instanceof SessionsApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const today = getTodayInTbilisi();
  const validDates = new Set(
    getSessionDateChoices(today).map((date) => date.value),
  );
  const requestedDate = firstValue(rawSearchParams.date);
  const shouldOpenBooking = firstValue(rawSearchParams.booking) === "1";
  const selectedDate =
    requestedDate && validDates.has(requestedDate)
      ? requestedDate
      : validDates.has(selectedSession.date)
        ? selectedSession.date
        : today;

  const [movieResult, scheduleResult] = await Promise.allSettled([
    getMovieDetail(selectedSession.movie.slug),
    getMovieVenueSessions(selectedSession.movie.slug, selectedDate),
  ]);

  if (movieResult.status === "rejected") {
    throw movieResult.reason;
  }

  return (
    <SessionDetailPage
      selectedSession={selectedSession}
      movie={movieResult.value}
      venueGroups={
        scheduleResult.status === "fulfilled" ? scheduleResult.value : []
      }
      selectedDate={selectedDate}
      today={today}
      scheduleFailed={scheduleResult.status === "rejected"}
      initialBookingSession={shouldOpenBooking ? selectedSession : undefined}
    />
  );
}
