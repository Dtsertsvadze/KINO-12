export type VenueFormat = {
  id: number;
  slug: string;
  name: string;
  priceUplift: number;
};

export type PreferredVenue = {
  id: number;
  slug: string;
  name: string;
  city: string;
  formats: VenueFormat[];
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  fullName: string | null;
  mobileNumber: string | null;
  dateOfBirth: string | null;
  age: number | null;
  preferredVenue: PreferredVenue | null;
  profileComplete: boolean;
};

export type LaravelAuthResponse = {
  data: {
    user: AuthUser;
    token: string;
  };
};

export type LaravelCurrentUserResponse = {
  data: AuthUser;
};

export type AuthFormErrors = Record<string, string[]>;
