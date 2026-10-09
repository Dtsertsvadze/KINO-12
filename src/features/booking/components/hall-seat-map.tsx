import { Fragment } from "react";

import type { HallSeat, SeatMap } from "../types";

type HallSeatMapProps = {
  seatMap: SeatMap;
  selectedSeatIds: Set<number>;
  disabled?: boolean;
  onToggleSeat: (seat: HallSeat) => void;
};

const seatStateClasses = {
  available:
    "border-foreground/[0.14] bg-surface text-foreground hover:border-foreground/[0.38] hover:bg-foreground/[0.13]",
  sold:
    "cursor-not-allowed border-transparent bg-foreground/[0.08] text-foreground/[0.24]",
  held:
    "cursor-not-allowed border-transparent bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0_4px,rgba(255,255,255,0.1)_4px_6px)] text-foreground/[0.28]",
};

function LegendItem({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <li className="flex items-center gap-2 text-[10px] text-foreground/[0.55]">
      <span
        aria-hidden="true"
        className={`size-5 shrink-0 overflow-hidden rounded-md ${className}`}
      />
      {label}
    </li>
  );
}

export function HallSeatMap({
  seatMap,
  selectedSeatIds,
  disabled = false,
  onToggleSeat,
}: HallSeatMapProps) {
  const hasSeats = seatMap.sections.some((section) =>
    section.rows.some((row) => row.seats.length > 0),
  );

  return (
    <div>
      <div className="mx-auto mb-8 flex h-8 w-[88%] items-center justify-center rounded-b-lg bg-foreground/[0.13] text-[10px] font-semibold tracking-[0.08em] text-foreground/[0.62] uppercase shadow-[0_10px_24px_rgba(255,255,255,0.04)]">
        Screen
      </div>

      {hasSeats ? (
        <div className="space-y-8">
          {seatMap.sections.map((section, sectionIndex) => (
            <section
              key={section.name}
              aria-labelledby={`seat-section-${sectionIndex}`}
            >
              <h4
                id={`seat-section-${sectionIndex}`}
                className="mb-3 text-[11px] font-semibold tracking-[0.04em] text-foreground/[0.58] uppercase"
              >
                {section.name}
              </h4>

              <div className="space-y-2">
                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="w-5 shrink-0 text-center text-[11px] font-bold text-foreground/[0.58]">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {row.seats.map((seat) => {
                        if (seat.state === "unavailable") {
                          return (
                            <Fragment key={seat.id}>
                              <span
                                className="h-9 w-10 shrink-0"
                                aria-label={`${seat.code} unavailable`}
                                role="img"
                              />
                              {seat.aisleAfter ? (
                                <span
                                  aria-hidden="true"
                                  className="w-4 shrink-0"
                                />
                              ) : null}
                            </Fragment>
                          );
                        }

                        const isSelected = selectedSeatIds.has(seat.id);
                        const isBlocked =
                          disabled ||
                          (seat.state !== "available" && !seat.isMine);

                        return (
                          <Fragment key={seat.id}>
                            <button
                              type="button"
                              className={`h-9 w-10 shrink-0 rounded-lg border text-[11px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                                isSelected
                                  ? "border-transparent bg-brand text-foreground"
                                  : seat.isMine
                                    ? seatStateClasses.available
                                    : seatStateClasses[seat.state]
                              }`}
                              aria-label={`${seat.code}, ${isSelected ? "selected" : seat.state}`}
                              aria-pressed={isSelected}
                              disabled={isBlocked}
                              onClick={() => onToggleSeat(seat)}
                            >
                              {seat.label}
                            </button>
                            {seat.aisleAfter ? (
                              <span
                                aria-hidden="true"
                                className="w-4 shrink-0"
                              />
                            ) : null}
                          </Fragment>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-foreground/[0.12] px-6 py-12 text-center text-sm text-foreground/[0.5]">
          This hall does not currently have selectable seats.
        </p>
      )}

      <ul
        className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        aria-label="Seat legend"
      >
        <LegendItem
          label="Available"
          className="border-2 border-foreground/[0.3] bg-surface"
        />
        <LegendItem label="Selected" className="bg-brand" />
        <LegendItem label="Sold" className="bg-foreground/[0.08]" />
        <LegendItem
          label="Held by another user"
          className="bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0_4px,rgba(255,255,255,0.2)_4px_7px)]"
        />
      </ul>
    </div>
  );
}
