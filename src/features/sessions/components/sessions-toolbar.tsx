"use client";

import type {
  SessionsQuery,
  SessionSort,
  SessionFilterOptions,
} from "../types";
import { useSessionsNavigation } from "./use-sessions-navigation";

type SessionsToolbarProps = {
  query: SessionsQuery;
  sorts: SessionFilterOptions["sorts"];
  totalSessions: number;
};

export function SessionsToolbar({
  query,
  sorts,
  totalSessions,
}: SessionsToolbarProps) {
  const { isPending, navigate } = useSessionsNavigation();

  return (
    <div
      className="flex min-h-8 items-center justify-between gap-8"
      aria-busy={isPending}
    >
      <p className="text-xs font-semibold text-white" aria-live="polite">
        {totalSessions === 0
          ? "No sessions found"
          : `Showing ${totalSessions} ${totalSessions === 1 ? "session" : "sessions"}`}
      </p>

      <label className="flex items-center gap-2 text-xs text-white/[0.48]">
        <span>{isPending ? "Updating:" : "Sort:"}</span>
        <span className="relative">
          <select
            className="cursor-pointer appearance-none bg-transparent py-1 pr-5 font-bold text-white outline-none disabled:cursor-wait disabled:opacity-55"
            value={query.sort}
            disabled={isPending}
            onChange={(event) =>
              navigate({
                ...query,
                sort: event.target.value as SessionSort,
                page: 1,
              })
            }
          >
            {sorts.map((sort) => (
              <option key={sort.id} value={sort.id} className="bg-input text-white">
                {sort.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-0 size-3 -translate-y-1/2 text-white/[0.58]"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="m3 4.5 3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </label>
    </div>
  );
}
