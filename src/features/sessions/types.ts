import type { Movie, MovieFormat } from "@/features/movies/types";

export type SessionSort =
  | "time_asc"
  | "time_desc"
  | "price_asc"
  | "price_desc"
  | "title_asc";

export type SessionTimeBand = "morning" | "afternoon" | "evening";

export type VenueSummary = {
  id: number;
  slug: string;
  name: string;
  city: string;
};

export type FilterVenue = VenueSummary & {
  formats: MovieFormat[];
};

export type SessionLanguage = {
  id: number;
  slug: string;
  name: string;
  code: string;
};

export type CinemaSession = {
  id: number;
  startsAt: string;
  date: string;
  time: string;
  timeBand: SessionTimeBand;
  price: number;
  seatsLeft: number;
  isSoldOut: boolean;
  hall: {
    id: number;
    name: string;
  };
  venue: VenueSummary;
  format: MovieFormat;
  language: SessionLanguage;
};

export type SessionDetail = CinemaSession & {
  movie: Movie;
};

export type SessionResponse = {
  data: SessionDetail;
};

export type MovieVenueSessions = {
  venue: VenueSummary;
  sessions: CinemaSession[];
};

export type MovieVenueSessionsResponse = {
  data: MovieVenueSessions[];
};

export type SessionMovieGroup = {
  movie: Movie;
  sessions: CinemaSession[];
};

export type SessionsMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  totalSessions: number;
  totalMovies: number;
  date: string;
};

export type SessionsResponse = {
  data: SessionMovieGroup[];
  meta: SessionsMeta;
};

export type SessionFilterOptions = {
  venues: FilterVenue[];
  formats: MovieFormat[];
  languages: SessionLanguage[];
  timeBands: Array<{
    id: SessionTimeBand;
    label: string;
  }>;
  sorts: Array<{
    id: SessionSort;
    label: string;
  }>;
};

export type FilterOptionsResponse = {
  data: SessionFilterOptions;
};

export type SessionsQuery = {
  venue: string[];
  date: string;
  format: string[];
  language: string[];
  time: SessionTimeBand[];
  sort: SessionSort;
  page: number;
};
