import type { Movie } from "@/features/movies/types";
import type {
  CinemaSession,
  TicketTypeSlug,
  VenueSummary,
} from "@/features/sessions/types";

export type SeatState = "available" | "sold" | "held" | "unavailable";

export type HallSeat = {
  id: number;
  code: string;
  label: string;
  state: SeatState;
  aisleAfter: boolean;
  isMine: boolean;
};

export type SeatRow = {
  label: string;
  seats: HallSeat[];
};

export type SeatSection = {
  name: string;
  rows: SeatRow[];
};

export type SeatMap = {
  sessionId: number;
  hall: {
    id: number;
    name: string;
    venue: VenueSummary;
  };
  sections: SeatSection[];
};

export type SeatMapResponse = {
  data: SeatMap;
};

export type HoldSeatInput = {
  seatId: number;
  ticketType: TicketTypeSlug;
};

export type SeatHold = {
  holdId: string;
  sessionId: number;
  expiresAt: string;
  secondsRemaining: number;
  isLive: boolean;
  subtotal: number;
  seats: Array<{
    seatId: number;
    code: string;
    ticketType: {
      slug: TicketTypeSlug;
      name: string;
    };
    price: number;
  }>;
};

export type SeatHoldResponse = {
  data: SeatHold;
};

export type CheckoutInput = {
  holdId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export type CompletedOrder = {
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

export type CompletedOrderResponse = {
  data: CompletedOrder;
};
