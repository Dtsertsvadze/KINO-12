import { getApiUrl } from "@/config/api";

import type {
  FilterOptionsResponse,
  MovieVenueSessions,
  MovieVenueSessionsResponse,
  SessionFilterOptions,
  SessionDetail,
  SessionResponse,
  SessionsQuery,
  SessionsResponse,
} from "./types";

export class SessionsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SessionsApiError";
    this.status = status;
  }
}

let filterOptionsRequest: Promise<SessionFilterOptions> | undefined;

async function requestSessionsApi<T>(path: `/${string}`, requestName: string) {
  let response: Response;

  try {
    response = await fetch(getApiUrl(path), {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    throw new SessionsApiError(
      `${requestName} could not reach the cinema service.`,
      0,
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new SessionsApiError(
      payload?.message ?? `${requestName} failed. Please try again.`,
      response.status,
    );
  }

  return payload as T;
}

export function getSessionFilterOptions(): Promise<SessionFilterOptions> {
  if (!filterOptionsRequest) {
    filterOptionsRequest = requestSessionsApi<FilterOptionsResponse>(
      "/filter-options",
      "Filter options",
    )
      .then((response) => response.data)
      .catch((error: unknown) => {
        filterOptionsRequest = undefined;
        throw error;
      });
  }

  return filterOptionsRequest;
}

export function getSessions(query: SessionsQuery): Promise<SessionsResponse> {
  const params = new URLSearchParams({
    date: query.date,
    sort: query.sort,
    page: String(query.page),
  });

  query.venue.forEach((slug) => params.append("venues[]", slug));
  query.format.forEach((slug) => params.append("formats[]", slug));
  query.language.forEach((slug) => params.append("languages[]", slug));
  query.time.forEach((band) => params.append("bands[]", band));

  return requestSessionsApi<SessionsResponse>(
    `/sessions?${params.toString()}`,
    "Sessions",
  );
}

export async function getSession(sessionId: string): Promise<SessionDetail> {
  const response = await requestSessionsApi<SessionResponse>(
    `/sessions/${encodeURIComponent(sessionId)}`,
    "Session",
  );

  return response.data;
}

export async function getMovieVenueSessions(
  movieSlug: string,
  date: string,
): Promise<MovieVenueSessions[]> {
  const params = new URLSearchParams({ date });
  const response = await requestSessionsApi<MovieVenueSessionsResponse>(
    `/movies/${encodeURIComponent(movieSlug)}/sessions?${params.toString()}`,
    "Movie sessions",
  );

  return response.data;
}
