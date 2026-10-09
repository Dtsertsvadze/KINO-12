"use client";

import type { ReactNode } from "react";

import {
  getActiveFilterCount,
  type getSessionDateChoices,
} from "../query";
import type {
  SessionFilterOptions,
  SessionsQuery,
  SessionTimeBand,
} from "../types";
import { useSessionsNavigation } from "./use-sessions-navigation";

type FilterSidebarProps = {
  options: SessionFilterOptions;
  query: SessionsQuery;
  dates: ReturnType<typeof getSessionDateChoices>;
};

type FilterSectionProps = {
  title: string;
  children: ReactNode;
  withDivider?: boolean;
};

type FilterCheckboxProps = {
  checked: boolean;
  disabled: boolean;
  label: ReactNode;
  onChange: () => void;
};

function FilterSection({
  title,
  children,
  withDivider = true,
}: FilterSectionProps) {
  return (
    <fieldset
      className={withDivider ? "border-b border-foreground/[0.08] pb-6" : undefined}
    >
      <legend className="mb-3 text-[10px] leading-none font-semibold tracking-[0.08em] text-foreground/[0.5] uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function FilterCheckbox({
  checked,
  disabled,
  label,
  onChange,
}: FilterCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs leading-4 text-foreground">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-foreground/[0.34] bg-transparent transition-colors peer-checked:border-brand peer-checked:bg-brand peer-checked:[&>svg]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand peer-disabled:cursor-wait peer-disabled:opacity-50">
        <svg
          aria-hidden="true"
          className="size-3 opacity-0"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="m2.5 6.1 2.1 2.1 4.9-5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label}
    </label>
  );
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((currentValue) => currentValue !== value)
    : [...values, value];
}

export function FilterSidebar({
  options,
  query,
  dates,
}: FilterSidebarProps) {
  const { isPending, navigate } = useSessionsNavigation();
  const activeFilterCount = getActiveFilterCount(query);
  const selectedVenues = options.venues.filter((venue) =>
    query.venue.includes(venue.slug),
  );
  const availableFormatSlugs = new Set(
    selectedVenues.flatMap((venue) =>
      venue.formats.map((format) => format.slug),
    ),
  );
  const visibleFormats =
    selectedVenues.length === 0
      ? options.formats
      : options.formats.filter((format) =>
          availableFormatSlugs.has(format.slug),
        );

  function updateVenues(slug: string) {
    const venue = toggleValue(query.venue, slug);
    const nextSelectedVenues = options.venues.filter((option) =>
      venue.includes(option.slug),
    );
    const nextAvailableFormats = new Set(
      nextSelectedVenues.flatMap((option) =>
        option.formats.map((format) => format.slug),
      ),
    );
    const format =
      nextSelectedVenues.length === 0
        ? query.format
        : query.format.filter((selectedFormat) =>
            nextAvailableFormats.has(selectedFormat),
          );

    navigate({ ...query, venue, format, page: 1 });
  }

  function updateFormats(slug: string) {
    navigate({
      ...query,
      format: toggleValue(query.format, slug),
      page: 1,
    });
  }

  function updateLanguages(slug: string) {
    navigate({
      ...query,
      language: toggleValue(query.language, slug),
      page: 1,
    });
  }

  function updateTimeBands(band: SessionTimeBand) {
    navigate({
      ...query,
      time: toggleValue(query.time, band) as SessionTimeBand[],
      page: 1,
    });
  }

  function clearFilters() {
    navigate({
      ...query,
      venue: [],
      format: [],
      language: [],
      time: [],
      page: 1,
    });
  }

  return (
    <aside
      className="sticky top-6 self-start rounded-[20px] bg-surface px-6 py-7 text-foreground"
      aria-busy={isPending}
    >
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-base font-extrabold">Filters</h2>
        {isPending ? (
          <span className="text-[10px] font-semibold text-foreground/[0.48]" role="status">
            Updating…
          </span>
        ) : null}
      </div>

      <div className="grid gap-6">
        <FilterSection title="Venue">
          <div className="grid gap-3">
            {options.venues.map((venue) => (
              <FilterCheckbox
                key={venue.id}
                checked={query.venue.includes(venue.slug)}
                disabled={isPending}
                onChange={() => updateVenues(venue.slug)}
                label={
                  <span>
                    {venue.name}
                    <span className="ml-1 text-foreground/[0.42]">· {venue.city}</span>
                  </span>
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Date">
          <div className="grid grid-cols-7 gap-1.5">
            {dates.map((date) => {
              const isSelected = query.date === date.value;

              return (
                <button
                  key={date.value}
                  type="button"
                  className={`flex h-[58px] cursor-pointer flex-col items-center justify-center rounded-lg text-[10px] font-semibold transition-colors disabled:cursor-wait disabled:opacity-55 ${
                    isSelected
                      ? "bg-brand text-foreground"
                      : "bg-foreground/[0.045] text-foreground/[0.72] hover:bg-foreground/[0.09]"
                  }`}
                  aria-pressed={isSelected}
                  disabled={isPending}
                  onClick={() =>
                    navigate({ ...query, date: date.value, page: 1 })
                  }
                >
                  <span>{date.weekday}</span>
                  <span className="mt-1.5 text-xs font-extrabold">{date.day}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Format">
          <div className="grid gap-3">
            {visibleFormats.map((format) => (
              <FilterCheckbox
                key={format.id}
                checked={query.format.includes(format.slug)}
                disabled={isPending}
                onChange={() => updateFormats(format.slug)}
                label={format.name}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Language">
          <div className="grid gap-3">
            {options.languages.map((language) => (
              <FilterCheckbox
                key={language.id}
                checked={query.language.includes(language.slug)}
                disabled={isPending}
                onChange={() => updateLanguages(language.slug)}
                label={language.name}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Time of Day" withDivider={false}>
          <div className="grid gap-3">
            {options.timeBands.map((timeBand) => (
              <FilterCheckbox
                key={timeBand.id}
                checked={query.time.includes(timeBand.id)}
                disabled={isPending}
                onChange={() => updateTimeBands(timeBand.id)}
                label={timeBand.label}
              />
            ))}
          </div>
        </FilterSection>
      </div>

      <div className="mt-7 border-t border-foreground/[0.08] pt-6 text-center">
        {activeFilterCount > 0 ? (
          <button
            type="button"
            className="flex h-9 w-full cursor-pointer items-center justify-center rounded-full border border-foreground/[0.72] text-xs font-semibold transition-colors hover:bg-foreground/[0.08] disabled:cursor-wait disabled:opacity-55"
            disabled={isPending}
            onClick={clearFilters}
          >
            Clear all filters
          </button>
        ) : null}
        <p className="mt-3 text-[10px] text-foreground/[0.48]" aria-live="polite">
          {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} active
        </p>
      </div>
    </aside>
  );
}
