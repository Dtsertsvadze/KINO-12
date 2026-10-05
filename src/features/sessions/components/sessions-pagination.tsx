"use client";

import type { SessionsQuery, SessionsMeta } from "../types";
import { useSessionsNavigation } from "./use-sessions-navigation";

type SessionsPaginationProps = {
  query: SessionsQuery;
  meta: SessionsMeta;
};

function getVisiblePages(currentPage: number, lastPage: number) {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  return Array.from(
    new Set([1, currentPage - 1, currentPage, currentPage + 1, lastPage]),
  )
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((first, second) => first - second);
}

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
      <path
        d={direction === "previous" ? "m10 3-5 5 5 5" : "m6 3 5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SessionsPagination({ query, meta }: SessionsPaginationProps) {
  const { isPending, navigate } = useSessionsNavigation();
  const pages = getVisiblePages(meta.currentPage, meta.lastPage);

  if (meta.lastPage <= 1) {
    return null;
  }

  function goToPage(page: number) {
    navigate({ ...query, page });
  }

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-3"
      aria-label="Sessions pagination"
      aria-busy={isPending}
    >
      <button
        type="button"
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-input text-white transition-colors hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Previous page"
        disabled={isPending || meta.currentPage <= 1}
        onClick={() => goToPage(meta.currentPage - 1)}
      >
        <ArrowIcon direction="previous" />
      </button>

      {pages.map((page, index) => {
        const previousPage = pages[index - 1];
        const hasGap = previousPage !== undefined && page - previousPage > 1;

        return (
          <span key={page} className="contents">
            {hasGap ? (
              <span className="px-1 text-xs text-white/[0.45]" aria-hidden="true">
                …
              </span>
            ) : null}
            <button
              type="button"
              className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-colors disabled:cursor-wait ${
                page === meta.currentPage
                  ? "bg-brand text-white"
                  : "text-white/[0.7] hover:bg-white/[0.08] hover:text-white"
              }`}
              aria-label={`Page ${page}`}
              aria-current={page === meta.currentPage ? "page" : undefined}
              disabled={isPending || page === meta.currentPage}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-input text-white transition-colors hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Next page"
        disabled={isPending || meta.currentPage >= meta.lastPage}
        onClick={() => goToPage(meta.currentPage + 1)}
      >
        <ArrowIcon direction="next" />
      </button>

      <span className="ml-3 text-xs text-white/[0.48]">
        Page {meta.currentPage} of {meta.lastPage}
      </span>
    </nav>
  );
}
