import type {
  SessionsQuery,
  SessionSort,
  SessionTimeBand,
} from "./types";

type RawSearchParams = Record<string, string | string[] | undefined>;

const sessionSorts = new Set<SessionSort>([
  "time_asc",
  "time_desc",
  "price_asc",
  "price_desc",
  "title_asc",
]);

const timeBands = new Set<SessionTimeBand>([
  "morning",
  "afternoon",
  "evening",
]);

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function listValue(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return Array.from(
    new Set(
      values
        .flatMap((item) => item.split(","))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function parsePage(value: string | undefined) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function isDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function getTodayInTbilisi() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tbilisi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function parseSessionsQuery(
  searchParams: RawSearchParams,
  today = getTodayInTbilisi(),
): SessionsQuery {
  const date = firstValue(searchParams.date);
  const sort = firstValue(searchParams.sort);
  const selectedTimeBands = listValue(searchParams.time).filter(
    (value): value is SessionTimeBand =>
      timeBands.has(value as SessionTimeBand),
  );

  return {
    venue: listValue(searchParams.venue),
    date: isDate(date) ? date : today,
    format: listValue(searchParams.format),
    language: listValue(searchParams.language),
    time: selectedTimeBands,
    sort: sessionSorts.has(sort as SessionSort)
      ? (sort as SessionSort)
      : "time_asc",
    page: parsePage(firstValue(searchParams.page)),
  };
}

export function buildSessionsPath(query: SessionsQuery) {
  const params = new URLSearchParams();

  if (query.venue.length > 0) {
    params.set("venue", query.venue.join(","));
  }
  params.set("date", query.date);
  if (query.format.length > 0) {
    params.set("format", query.format.join(","));
  }
  if (query.language.length > 0) {
    params.set("language", query.language.join(","));
  }
  if (query.time.length > 0) {
    params.set("time", query.time.join(","));
  }
  params.set("sort", query.sort);
  params.set("page", String(query.page));

  return `/sessions?${params.toString().replaceAll("%2C", ",")}`;
}

export function getActiveFilterCount(query: SessionsQuery) {
  return (
    query.venue.length +
    query.format.length +
    query.language.length +
    query.time.length
  );
}

export function getSessionDateChoices(today: string) {
  const start = new Date(`${today}T12:00:00Z`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);

    return {
      value: date.toISOString().slice(0, 10),
      weekday: new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }).format(date),
      day: String(date.getUTCDate()),
    };
  });
}
