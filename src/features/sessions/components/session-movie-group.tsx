import Image from "next/image";
import Link from "next/link";

import type {
  CinemaSession,
  SessionMovieGroup as SessionMovieGroupType,
} from "../types";

function SeatIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" viewBox="0 0 16 16" fill="none">
      <path
        d="M2.5 5.5h11v5h-11zM5 3.5h6M4 10.5v2M12 10.5v2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function SessionCard({ session }: { session: CinemaSession }) {
  const availabilityTone = session.seatsLeft <= 10 ? "text-brand" : "text-success";
  const label = `${session.time}, ${session.venue.name}, Hall ${session.hall.name}, ${session.format.name}, ${session.language.name}${session.isSoldOut ? ", sold out" : ""}`;
  const className = `flex h-[116px] w-[270px] shrink-0 flex-col rounded-xl bg-input p-4 ${
    session.isSoldOut
      ? "cursor-not-allowed opacity-35"
      : "cursor-pointer transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
  }`;
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <time
          className="text-base leading-none font-extrabold text-white"
          dateTime={session.startsAt}
        >
          {session.time}
        </time>
        <span className="rounded-full bg-white/[0.09] px-2 py-1 text-[9px] leading-none font-semibold text-white">
          {session.format.name}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[10px] leading-none">
        <span className="truncate text-white/[0.5]">{session.language.name}</span>
        {session.isSoldOut ? (
          <span className="shrink-0 text-white/[0.55]">Sold out</span>
        ) : (
          <span className={`flex shrink-0 items-center gap-1 font-semibold ${availabilityTone}`}>
            <SeatIcon />
            {session.seatsLeft} left
          </span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <span className="truncate text-[10px] font-semibold text-white/[0.72]">
          {session.venue.name} · Hall {session.hall.name}
        </span>
        <span className="shrink-0 text-xs font-extrabold text-white">
          from ₾{formatPrice(session.price)}
        </span>
      </div>
    </>
  );

  if (session.isSoldOut) {
    return (
      <div className={className} aria-label={label} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/session/${session.id}`}
      className={className}
      aria-label={`View ${label}`}
    >
      {content}
    </Link>
  );
}

export function SessionMovieGroup({
  group,
}: {
  group: SessionMovieGroupType;
}) {
  const { movie, sessions } = group;
  const detailSession =
    sessions.find((session) => !session.isSoldOut) ?? sessions[0];

  return (
    <section className="border-b border-white/[0.1] py-9 first:pt-6 last:border-b-0">
      <Link
        href={`/session/${detailSession.id}`}
        className="group/movie-summary flex w-fit items-center gap-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        aria-label={`View details for ${movie.title}`}
      >
        <div className="relative h-[84px] w-16 shrink-0 overflow-hidden rounded-lg bg-white/[0.05]">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center px-2 text-center text-[9px] text-white/[0.42]">
              No poster
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="truncate text-base font-extrabold text-white transition-colors group-hover/movie-summary:text-brand">
              {movie.title}
            </h2>
            <span
              className="shrink-0 rounded-full bg-brand/[0.12] px-2 py-1 text-[9px] leading-none font-bold text-brand"
              title={movie.ageRating.description}
            >
              {movie.ageRating.code}
            </span>
          </div>
          <p className="mt-2 text-xs text-white/[0.48]">
            {movie.runtimeMinutes} min
          </p>
        </div>
      </Link>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </section>
  );
}
