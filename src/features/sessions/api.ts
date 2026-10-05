import { getApiUrl } from "@/config/api";

import type {
  FilterOptionsResponse,
  SessionFilterOptions,
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

export async function getSessionFilterOptions(): Promise<SessionFilterOptions> {
  const response = await requestSessionsApi<FilterOptionsResponse>(
    "/filter-options",
    "Filter options",
  );

  return response.data;
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
