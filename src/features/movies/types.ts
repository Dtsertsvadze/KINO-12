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
  synopsis: string;
};

export type MoviesResponse = {
  data: Movie[];
};
