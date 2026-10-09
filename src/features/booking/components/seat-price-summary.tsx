import type {
  TicketType,
  TicketTypeSlug,
} from "@/features/sessions/types";

import type { HallSeat } from "../types";

export type SelectedSeatLine = {
  seat: HallSeat;
  sectionName: string;
  ticketType: TicketType;
  price: number;
  error?: string;
};

type SeatPriceSummaryProps = {
  lines: SelectedSeatLine[];
  ticketTypes: TicketType[];
  minimumAge: number;
  subtotal: number;
  disabled?: boolean;
  onRemove: (seatId: number) => void;
  onTicketTypeChange: (seatId: number, ticketType: TicketTypeSlug) => void;
};

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

export function SeatPriceSummary({
  lines,
  ticketTypes,
  minimumAge,
  subtotal,
  disabled = false,
  onRemove,
  onTicketTypeChange,
}: SeatPriceSummaryProps) {
  return (
    <div>
      {lines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-foreground/[0.12] px-4 py-6 text-xs leading-5 text-muted">
          Pick up to three seats from the map. Each seat can carry its own
          ticket type.
        </div>
      ) : (
        <div className="max-h-[330px] space-y-3 overflow-y-auto pr-1">
          {lines.map((line) => (
            <article key={line.seat.id} className="rounded-xl bg-surface p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-foreground">
                    Seat {line.seat.code}
                  </h4>
                  <p className="mt-1 text-[10px] text-muted">
                    {line.sectionName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-foreground">
                    ₾{formatPrice(line.price)}
                  </span>
                  <button
                    type="button"
                    className="inline-flex size-5 cursor-pointer items-center justify-center rounded text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-35"
                    aria-label={`Remove seat ${line.seat.code}`}
                    disabled={disabled}
                    onClick={() => onRemove(line.seat.id)}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {ticketTypes.map((ticketType) => {
                  const isBlocked = Boolean(
                    ticketType.blockedFromRatingAge !== null &&
                      minimumAge >= ticketType.blockedFromRatingAge,
                  );
                  const isSelected = line.ticketType.slug === ticketType.slug;

                  return (
                    <button
                      key={ticketType.id}
                      type="button"
                      className={`rounded-full px-3 py-1.5 text-[9px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                        isSelected
                          ? "bg-brand text-foreground"
                          : "bg-page text-muted hover:text-foreground"
                      } ${isBlocked || disabled ? "cursor-not-allowed opacity-35" : "cursor-pointer"}`}
                      title={
                        isBlocked ? ticketType.note ?? undefined : undefined
                      }
                      disabled={isBlocked || disabled}
                      onClick={() =>
                        onTicketTypeChange(line.seat.id, ticketType.slug)
                      }
                    >
                      {ticketType.name}{" "}
                      {Math.round(ticketType.priceRatio * 100)}%
                    </button>
                  );
                })}
              </div>

              {line.error ? (
                <p
                  className="mt-2 text-[10px] leading-4 text-error"
                  role="alert"
                >
                  {line.seat.code}: {line.error}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-foreground/[0.1] pt-4">
        <span className="text-[10px] font-semibold tracking-[0.05em] text-muted uppercase">
          Subtotal
        </span>
        <strong className="text-xl font-extrabold text-foreground">
          ₾{formatPrice(subtotal)}
        </strong>
      </div>
    </div>
  );
}
