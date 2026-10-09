import Image from "next/image";

import type { TicketOrder } from "../types";

type TicketCardProps = {
  order: TicketOrder;
  showRefund: boolean;
  isRefunding: boolean;
  onRefund: (order: TicketOrder) => void;
};

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function formatSessionDate(dateValue: string, time: string) {
  const date = new Date(`${dateValue}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return `${dateValue} · ${time}`;
  }

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);

  return `${formattedDate} · ${time}`;
}

function formatRefundDeadline(startsAt: string) {
  const start = new Date(startsAt);

  if (Number.isNaN(start.getTime())) {
    return "Refunds close two hours before the screening.";
  }

  const deadline = new Date(start.getTime() - 2 * 60 * 60 * 1000);
  const formattedDeadline = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tbilisi",
  }).format(deadline);

  return `Refundable until ${formattedDeadline}`;
}

export function TicketCard({
  order,
  showRefund,
  isRefunding,
  onRefund,
}: TicketCardProps) {
  const { movie } = order.session;
  const refundHint = order.isRefundable
    ? formatRefundDeadline(order.session.startsAt)
    : "Refund unavailable within two hours of the screening.";

  return (
    <article className="grid min-h-[204px] grid-cols-[128px_1fr_316px] overflow-hidden rounded-[28px] bg-input">
      <div className="relative m-6 mr-0 h-[156px] w-[112px] overflow-hidden rounded-xl bg-white/[0.05]">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center px-3 text-center text-[10px] text-white/[0.42]">
            Poster unavailable
          </div>
        )}
      </div>

      <div className="min-w-0 px-6 py-7">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="truncate text-xl leading-6 font-extrabold uppercase">
            {movie.title}
          </h2>
          <span
            className="rounded-full bg-brand/[0.12] px-2.5 py-1 text-[10px] leading-none font-bold text-brand"
            title={movie.ageRating.description}
          >
            {movie.ageRating.code}
          </span>
          <span className="text-xs text-white/[0.46]">
            {movie.runtimeMinutes} min
          </span>
        </div>

        <dl className="mt-5 flex flex-wrap items-start gap-x-6 gap-y-3">
          <div className="max-w-[260px]">
            <dt className="text-[10px] font-semibold tracking-[0.06em] text-white/[0.42] uppercase">
              Date
            </dt>
            <dd className="mt-1 text-xs font-semibold text-white">
              {formatSessionDate(order.session.date, order.session.time)}
            </dd>
          </div>
          <div className="max-w-[260px]">
            <dt className="text-[10px] font-semibold tracking-[0.06em] text-white/[0.42] uppercase">
              Venue
            </dt>
            <dd className="mt-1 truncate text-xs font-semibold text-white">
              {order.session.venue.name} · Hall {order.session.hall.name}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.06em] text-white/[0.42] uppercase">
              Format
            </dt>
            <dd className="mt-1 truncate text-xs font-semibold text-white">
              {order.session.format.name} · {order.session.language.name}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold tracking-[0.06em] text-white/[0.42] uppercase">
            Seats
          </span>
          {order.tickets.map((ticket) => (
            <span
              key={ticket.id}
              className="rounded-md bg-white/[0.1] px-2.5 py-1 text-[10px] font-semibold text-white/[0.82]"
            >
              {ticket.seatCode} · {ticket.ticketType.name}
            </span>
          ))}
        </div>
      </div>

      <aside className="flex flex-col border-l border-dashed border-white/[0.1] px-7 py-7">
        <span className="text-[10px] font-semibold tracking-[0.06em] text-white/[0.42] uppercase">
          Order
        </span>
        <strong className="mt-1 text-xs text-white">#{order.reference}</strong>

        <div className="mt-5 flex items-end justify-between gap-4">
          <span className="text-xs text-white/[0.52]">Total paid</span>
          <strong className="text-2xl leading-none font-extrabold text-white">
            ₾{formatPrice(order.totalPrice)}
          </strong>
        </div>

        {showRefund ? (
          <>
            <button
              type="button"
              className="mt-4 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full bg-white/[0.1] text-xs font-extrabold text-white transition-colors hover:bg-white/[0.17] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:text-white/[0.28] disabled:hover:bg-white/[0.1]"
              disabled={!order.isRefundable || isRefunding}
              aria-describedby={`refund-hint-${order.id}`}
              onClick={() => onRefund(order)}
            >
              {isRefunding ? "Refunding…" : "Refund"}
            </button>
            <p
              id={`refund-hint-${order.id}`}
              className="mt-3 text-center text-[9px] leading-4 text-white/[0.4]"
            >
              {refundHint}
            </p>
          </>
        ) : (
          <p className="mt-auto text-[10px] font-semibold text-white/[0.42]">
            {order.status === "refunded" ? "Refunded" : "Completed"}
          </p>
        )}
      </aside>
    </article>
  );
}
