import Image from "next/image";

import type { TicketOrder } from "@/features/tickets/types";

type OrderConfirmationProps = {
  order: TicketOrder;
  titleId: string;
  descriptionId: string;
  onClose: () => void;
  onViewTickets: () => void;
};

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function formatOrderDate(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 20 20" fill="none">
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <span className="inline-flex size-12 items-center justify-center rounded-full bg-success text-page">
      <svg aria-hidden="true" className="size-6" viewBox="0 0 24 24" fill="none">
        <path
          d="m6.5 12.3 3.4 3.3 7.6-7.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
      </svg>
    </span>
  );
}

export function OrderConfirmation({
  order,
  titleId,
  descriptionId,
  onClose,
  onViewTickets,
}: OrderConfirmationProps) {
  return (
    <article className="relative flex h-full flex-col items-center px-14 py-10 text-center">
      <button
        type="button"
        className="absolute top-7 right-7 inline-flex size-7 cursor-pointer items-center justify-center text-foreground/[0.55] transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label="Close order confirmation"
        onClick={onClose}
      >
        <CloseIcon />
      </button>

      <SuccessIcon />
      <h2 id={titleId} className="mt-4 text-xl font-extrabold">
        Booking confirmed!
      </h2>
      <p id={descriptionId} className="mt-2 text-xs text-foreground/[0.5]">
        Your tickets are ready. Keep this order reference for your records.
      </p>
      <span className="mt-4 rounded-full bg-surface px-5 py-2 text-[10px] font-extrabold tracking-[0.08em] text-foreground/[0.72] uppercase">
        Order {order.reference}
      </span>

      <section
        className="mt-5 w-[620px] rounded-xl bg-surface p-4 text-left"
        aria-label="Confirmed order summary"
      >
        <div className="flex items-center gap-3 border-b border-foreground/[0.08] pb-3">
          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-foreground/[0.06]">
            {order.session.movie.posterUrl ? (
              <Image
                src={order.session.movie.posterUrl}
                alt={`${order.session.movie.title} poster`}
                fill
                sizes="44px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase">
              {order.session.movie.title}
            </h3>
            <p className="mt-1 text-[9px] leading-4 text-foreground/[0.48]">
              {order.session.venue.name} · Hall {order.session.hall.name} ·{" "}
              {formatOrderDate(order.session.date)} · {order.session.time}
            </p>
          </div>
        </div>

        <dl className="mt-3 grid gap-2 text-[10px]">
          <div className="flex items-start justify-between gap-5">
            <dt className="text-foreground/[0.45]">Seats</dt>
            <dd className="text-right font-semibold text-foreground">
              {order.tickets.map((ticket) => ticket.seatCode).join(", ")}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-5">
            <dt className="text-foreground/[0.45]">Tickets</dt>
            <dd className="grid gap-1 text-right font-semibold text-foreground">
              {order.tickets.map((ticket) => (
                <span key={ticket.id}>
                  {ticket.seatCode} · {ticket.ticketType.name} · ₾
                  {formatPrice(ticket.price)}
                </span>
              ))}
            </dd>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-foreground/[0.08] pt-3">
            <dt className="font-semibold tracking-[0.05em] text-foreground/[0.58] uppercase">
              Total paid
            </dt>
            <dd className="text-base font-extrabold text-foreground">
              ₾{formatPrice(order.totalPrice)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-foreground/[0.45]">Payment card</dt>
            <dd className="font-semibold text-foreground">
              •••• {order.cardLastFour}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-brand px-6 text-xs font-extrabold text-foreground transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={onViewTickets}
        >
          My Tickets
        </button>
        <button
          type="button"
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-surface px-6 text-xs font-extrabold text-foreground transition-colors hover:bg-foreground/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </article>
  );
}
