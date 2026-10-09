import Image from "next/image";
import Link from "next/link";

import { EmptyState, RequestErrorState } from "@/components/feedback/request-state";
import { ContentContainer } from "@/components/layout/content-container";
import { RecentlyViewedTracker } from "@/features/movies/components/recently-viewed-tracker";
import type { MovieDetail } from "@/features/movies/types";

import { getSessionDateChoices } from "../query";
import type { MovieVenueSessions, SessionDetail } from "../types";
import { MovieSessionSchedule } from "./movie-session-schedule";

type SessionDetailPageProps = {
  selectedSession: SessionDetail;
  movie: MovieDetail;
  venueGroups: MovieVenueSessions[];
  selectedDate: string;
  today: string;
  scheduleFailed: boolean;
  initialBookingSession?: SessionDetail;
};

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 4.8v3.4l2.3 1.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function formatReleaseDate(releaseDate: string) {
  const date = new Date(`${releaseDate}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return releaseDate;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function SessionDatePicker({
  sessionId,
  selectedDate,
  availableDates,
  today,
}: {
  sessionId: number;
  selectedDate: string;
  availableDates: string[];
  today: string;
}) {
  const availableDateSet = new Set(availableDates);

  return (
    <nav className="mt-6 flex gap-3" aria-label="Choose session date">
      {getSessionDateChoices(today).map((date) => {
        const isSelected = date.value === selectedDate;
        const isAvailable = availableDateSet.has(date.value);
        const className = `flex h-[88px] w-[88px] flex-col items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
          isSelected
            ? "bg-brand text-foreground"
            : isAvailable
              ? "bg-surface text-foreground/[0.72] hover:bg-foreground/[0.12]"
              : "cursor-not-allowed bg-surface text-foreground/[0.24]"
        }`;
        const content = (
          <>
            <span>{date.weekday}</span>
            <span className="mt-2 text-base font-extrabold">{date.day}</span>
          </>
        );

        if (isSelected || !isAvailable) {
          return (
            <span
              key={date.value}
              className={className}
              aria-current={isSelected ? "date" : undefined}
              aria-disabled={!isAvailable ? "true" : undefined}
              title={!isAvailable ? "No sessions on this date" : undefined}
            >
              {content}
            </span>
          );
        }

        return (
          <Link
            key={date.value}
            href={`/session/${sessionId}?date=${date.value}`}
            className={`${className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
            scroll={false}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

function DetailItem({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <dt className="text-[10px] leading-none font-semibold tracking-[0.06em] text-foreground/[0.42] uppercase">
        {label}
      </dt>
      <dd className="mt-2 text-xs leading-5 font-semibold text-foreground">{children}</dd>
    </div>
  );
}

export function SessionDetailPage({
  selectedSession,
  movie,
  venueGroups,
  selectedDate,
  today,
  scheduleFailed,
  initialBookingSession,
}: SessionDetailPageProps) {
  return (
    <main className="bg-page text-foreground">
      <RecentlyViewedTracker movie={movie} sessionId={selectedSession.id} />

      <section className="relative h-[630px] overflow-hidden bg-page">
        {movie.backdropUrl ? (
          <Image
            src={movie.backdropUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-[1.03] object-cover blur-[2px]"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,12,28,0.52)_0%,rgba(7,12,28,0.08)_58%,rgba(7,12,28,0.2)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,12,28,0.76)_0%,transparent_46%)]" />

        <ContentContainer className="relative z-[1] flex h-full items-end gap-10 pb-12">
          <div className="relative h-[416px] w-[320px] shrink-0 overflow-hidden rounded-2xl bg-foreground/[0.06] shadow-2xl">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                fill
                priority
                sizes="320px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-foreground/[0.45]">
                Poster unavailable
              </div>
            )}
          </div>

          <div className="max-w-[720px] pb-4">
            <span className="rounded-full bg-brand/[0.14] px-3 py-1.5 text-[10px] leading-none font-extrabold tracking-[0.04em] text-brand uppercase">
              Now playing
            </span>
            <h1 className="mt-6 text-[40px] leading-none font-extrabold tracking-[-0.02em] uppercase">
              {movie.title}
            </h1>
            <p className="mt-6 max-w-[680px] text-sm leading-6 text-foreground/[0.82]">
              {movie.synopsis}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full bg-brand/[0.13] px-3 py-1.5 text-[10px] font-bold text-brand"
                title={movie.ageRating.description}
              >
                {movie.ageRating.code}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.12] px-3 py-1.5 text-[10px] font-semibold">
                <ClockIcon />
                {movie.runtimeMinutes} min
              </span>
              {movie.formats.map((format) => (
                <span
                  key={format.id}
                  className="rounded-full bg-foreground/[0.12] px-3 py-1.5 text-[10px] font-semibold"
                >
                  {format.name}
                </span>
              ))}
            </div>
          </div>
        </ContentContainer>
      </section>

      <section className="min-h-[690px] py-10">
        <ContentContainer className="grid grid-cols-[1280px_400px] items-start gap-[120px]">
          <div>
            <h2 className="text-xl font-extrabold">Sessions</h2>
            <SessionDatePicker
              sessionId={selectedSession.id}
              selectedDate={selectedDate}
              availableDates={movie.availableDates}
              today={today}
            />

            {scheduleFailed ? (
              <RequestErrorState
                className="mt-8 min-h-56"
                title="Showtimes could not be loaded"
                message="Please try again to load this movie's sessions."
              />
            ) : venueGroups.length === 0 ? (
              <EmptyState
                className="mt-8 min-h-56"
                title="No sessions on this date"
                message="Choose another available date to see this movie's showtimes."
              />
            ) : (
              <MovieSessionSchedule
                venueGroups={venueGroups}
                movieTitle={movie.title}
                ageRatingCode={movie.ageRating.code}
                minimumAge={movie.ageRating.minAge}
                today={today}
                initialBookingSession={initialBookingSession}
              />
            )}
          </div>

          <aside aria-labelledby="movie-details-heading">
            <h2 id="movie-details-heading" className="text-xl font-extrabold">
              Details
            </h2>
            <dl className="mt-6 grid gap-5">
              <DetailItem label="Director">
                {movie.director ?? "Not announced"}
              </DetailItem>
              <DetailItem label="Main cast">
                {movie.cast ?? "Not announced"}
              </DetailItem>
              <DetailItem label="Duration">
                {`${movie.runtimeMinutes} minutes`}
              </DetailItem>
              <DetailItem label="Release date">
                {formatReleaseDate(movie.releaseDate)}
              </DetailItem>
              <DetailItem label="Genres">
                {movie.genres.map((genre) => genre.name).join(", ")}
              </DetailItem>
              <DetailItem label="Formats">
                {movie.formats.map((format) => format.name).join(", ")}
              </DetailItem>
              <DetailItem label="From">{`₾${formatPrice(movie.fromPrice)}`}</DetailItem>
            </dl>

            <div className="mt-6 rounded-xl bg-warning/[0.09] px-4 py-4 text-warning">
              <p className="text-[10px] font-extrabold tracking-[0.06em] uppercase">
                Rating note
              </p>
              <p className="mt-2 text-xs leading-5">
                <span className="font-extrabold">{movie.ageRating.code}</span>
                {" · "}
                {movie.ageRating.description}
              </p>
            </div>
          </aside>
        </ContentContainer>
      </section>
    </main>
  );
}
