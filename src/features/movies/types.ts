export type MovieGenre = {
  id: number;
  slug: string;
  name: string;
};

export type MovieFormat = {
  id: number;
  slug: string;
  name: string;
  priceUplift: number;
};

export type MovieAgeRating = {
  code: string;
  minAge: number;
  description: string;
};

export type Movie = {
  id: number;
  slug: string;
  title: string;
  kind: "film" | "event";
  runtimeMinutes: number;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  isComingSoon: boolean;
  isNotified: boolean;
  isFeatured: boolean;
  fromPrice: number;
  ageRating: MovieAgeRating;
  genres: MovieGenre[];
  formats: MovieFormat[];
  synopsis?: string;
};

export type MoviesResponse = {
  data: Movie[];
};

export type MovieDetail = Movie & {
  synopsis: string;
  director: string | null;
  cast: string | null;
  availableDates: string[];
};

export type MovieDetailResponse = {
  data: MovieDetail;
};

export type RecentlyViewedMovie = {
  id: number;
  sessionId: number;
  title: string;
  posterUrl: string | null;
  runtimeMinutes: number;
  genre: string;
  ageRatingCode: string;
  viewedAt: number;
};
