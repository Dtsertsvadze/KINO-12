import { EmptyState } from "@/components/feedback/request-state";
import { ContentContainer } from "@/components/layout/content-container";

import {
  buildSessionsPath,
  getActiveFilterCount,
  getSessionDateChoices,
} from "../query";
import type {
  SessionFilterOptions,
  SessionsQuery,
  SessionsResponse,
} from "../types";
import { FilterSidebar } from "./filter-sidebar";
import { SessionMovieGroup } from "./session-movie-group";
import { SessionsPagination } from "./sessions-pagination";
import { SessionsToolbar } from "./sessions-toolbar";

type SessionsPageContentProps = {
  options: SessionFilterOptions;
  query: SessionsQuery;
  response: SessionsResponse;
  today: string;
};

export function SessionsPageContent({
  options,
  query,
  response,
  today,
}: SessionsPageContentProps) {
  const activeFilterCount = getActiveFilterCount(query);
  const clearFiltersPath = buildSessionsPath({
    ...query,
    venue: [],
    format: [],
    language: [],
    time: [],
    page: 1,
  });

  return (
    <main className="min-h-[969px] bg-page pt-[132px] pb-24 text-foreground">
      <ContentContainer>
        <header>
          <h1 className="text-2xl leading-7 font-extrabold">Sessions</h1>
          <p className="mt-2 text-xs text-muted">
            Browse showtimes across all venues
          </p>
        </header>

        <div className="mt-9 grid grid-cols-[350px_1394px] items-start gap-14">
          <FilterSidebar
            options={options}
            query={query}
            dates={getSessionDateChoices(today)}
          />

          <section className="min-w-0" aria-label="Available sessions">
            <SessionsToolbar
              query={query}
              sorts={options.sorts}
              totalSessions={response.meta.totalSessions}
            />

            {response.data.length === 0 ? (
              <EmptyState
                className="mt-7 min-h-80"
                title="No sessions found"
                message="Try another date or remove some filters to see more showtimes."
                action={
                  activeFilterCount > 0
                    ? { href: clearFiltersPath, label: "Clear filters" }
                    : undefined
                }
              />
            ) : (
              <div>
                {response.data.map((group) => (
                  <SessionMovieGroup key={group.movie.id} group={group} />
                ))}
              </div>
            )}

            <SessionsPagination query={query} meta={response.meta} />
          </section>
        </div>
      </ContentContainer>
    </main>
  );
}
