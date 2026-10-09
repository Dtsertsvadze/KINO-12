import type { Movie } from "@/features/movies/types";
import type {
  CinemaSession,
  TicketTypeSlug,
} from "@/features/sessions/types";

export type TicketFilter = "upcoming" | "past";

export type TicketOrder = {
  id: number;
  reference: string;
  status: "paid" | "refunded";
  totalPrice: number;
  paidAt: string;
  refundedAt: string | null;
  isUpcoming: boolean;
  isRefundable: boolean;
  cardLastFour: string;
  contact: {
    fullName: string;
    email: string;
    mobileNumber: string;
  };
  session: CinemaSession & {
    movie: Movie;
  };
  tickets: Array<{
    id: number;
    seatCode: string;
    ticketType: {
      slug: TicketTypeSlug;
      name: string;
    };
    price: number;
  }>;
};

export type TicketOrderResponse = {
  data: TicketOrder;
};

export type TicketsResponse = {
  data: TicketOrder[];
};
