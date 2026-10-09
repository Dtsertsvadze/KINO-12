import { requestAuthenticated } from "@/features/auth/api";
import type {
  TicketOrder,
  TicketOrderResponse,
} from "@/features/tickets/types";

import type {
  CheckoutInput,
  HoldSeatInput,
  SeatHold,
  SeatHoldResponse,
  SeatMap,
  SeatMapResponse,
} from "./types";

export async function getSeatMap(sessionId: number): Promise<SeatMap> {
  const response = await requestAuthenticated<SeatMapResponse>(
    `/sessions/${encodeURIComponent(String(sessionId))}/seats`,
  );

  return response.data;
}

export async function holdSeats(
  sessionId: number,
  seats: HoldSeatInput[],
): Promise<SeatHold> {
  const response = await requestAuthenticated<SeatHoldResponse>(
    `/sessions/${encodeURIComponent(String(sessionId))}/holds`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seats }),
    },
  );

  return response.data;
}

export async function releaseHold(holdId: string): Promise<void> {
  await requestAuthenticated<null>(
    `/holds/${encodeURIComponent(holdId)}`,
    { method: "DELETE" },
  );
}

export async function completeOrder(
  checkout: CheckoutInput,
): Promise<TicketOrder> {
  const response = await requestAuthenticated<TicketOrderResponse>(
    "/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkout),
    },
  );

  return response.data;
}
