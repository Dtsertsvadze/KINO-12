import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RequestErrorState } from "@/components/feedback/request-state";
import { ContentContainer } from "@/components/layout/content-container";
import { getSessionFilterOptions, getSessions } from "@/features/sessions/api";
import { SessionsPageContent } from "@/features/sessions/components/sessions-page-content";
import {
  buildSessionsPath,
  getTodayInTbilisi,
  parseSessionsQuery,
} from "@/features/sessions/query";

export const metadata: Metadata = {
  title: "Sessions | Kino XII",
};

export default async function SessionsPage({
  searchParams,
}: PageProps<"/sessions">) {
  const rawSearchParams = await searchParams;
  const today = getTodayInTbilisi();
  const query = parseSessionsQuery(rawSearchParams, today);

  if (
    rawSearchParams.date === undefined ||
    rawSearchParams.sort === undefined ||
    rawSearchParams.page === undefined
  ) {
    redirect(buildSessionsPath(query));
  }

  const [optionsResult, sessionsResult] = await Promise.allSettled([
    getSessionFilterOptions(),
    getSessions(query),
  ]);

  if (
    optionsResult.status === "rejected" ||
    sessionsResult.status === "rejected"
  ) {
    return (
      <main className="min-h-[969px] bg-page pt-[132px] pb-24 text-foreground">
        <ContentContainer>
          <header>
            <h1 className="text-2xl leading-7 font-extrabold">Sessions</h1>
            <p className="mt-2 text-xs text-muted">
              Browse showtimes across all venues
            </p>
          </header>
          <RequestErrorState
            className="mt-9 min-h-80"
            title="Sessions could not be loaded"
            message="We could not load the cinema schedule. Please try again."
          />
        </ContentContainer>
      </main>
    );
  }

  if (
    sessionsResult.value.meta.lastPage > 0 &&
    query.page > sessionsResult.value.meta.lastPage
  ) {
    redirect(
      buildSessionsPath({
        ...query,
        page: sessionsResult.value.meta.lastPage,
      }),
    );
  }

  return (
    <SessionsPageContent
      options={optionsResult.value}
      query={query}
      response={sessionsResult.value}
      today={today}
    />
  );
}
