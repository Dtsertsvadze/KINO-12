import { requestAuthenticated } from "@/features/auth/api";

import type {
  TicketFilter,
  TicketOrder,
  TicketOrderResponse,
  TicketsResponse,
} from "./types";

export async function getTickets(
  filter: TicketFilter,
): Promise<TicketOrder[]> {
  const params = new URLSearchParams({ filter });
  const response = await requestAuthenticated<TicketsResponse>(
    `/tickets?${params.toString()}`,
  );

  return response.data;
}

export async function refundOrder(reference: string): Promise<TicketOrder> {
  const response = await requestAuthenticated<TicketOrderResponse>(
    `/orders/${encodeURIComponent(reference)}/refund`,
    { method: "POST" },
  );

  return response.data;
}
