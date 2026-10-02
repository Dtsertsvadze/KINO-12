import type {
  AuthFormErrors,
  AuthUser,
  LaravelAuthResponse,
  LaravelCurrentUserResponse,
  PreferredVenue,
} from "./types";

type LoginCredentials = {
  email: string;
  password: string;
};

type ApiErrorResponse = {
  message?: string;
  errors?: AuthFormErrors;
};

type LaravelVenueOptionsResponse = {
  data: {
    venues: PreferredVenue[];
  };
};

const TOKEN_STORAGE_KEY = "kinoxii_access_token";

function getApiBaseUrl() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL;

  if (!apiBaseUrl) {
    throw new AuthApiError("The API URL is not configured.", 0);
  }

  return apiBaseUrl.replace(/\/$/, "");
}

function getAccessToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function storeAccessToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function removeAccessToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export class AuthApiError extends Error {
  status: number;
  fieldErrors?: AuthFormErrors;

  constructor(
    message: string,
    status: number,
    fieldErrors?: AuthFormErrors,
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function requestAuth<T>(
  path: `/${string}`,
  init?: RequestInit,
  authenticated = false,
): Promise<T> {
  let response: Response;
  const headers = new Headers(init?.headers);

  headers.set("Accept", "application/json");

  if (authenticated) {
    const token = getAccessToken();

    if (!token) {
      throw new AuthApiError("Your session has expired. Please log in.", 401);
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      headers,
    });
  } catch {
    throw new AuthApiError(
      "Unable to reach the service. Check your connection and try again.",
      0,
    );
  }

  const payload: unknown =
    response.status === 204
      ? null
      : await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload as ApiErrorResponse | null;

    if (authenticated && response.status === 401) {
      removeAccessToken();
    }

    throw new AuthApiError(
      error?.message ?? "Something went wrong. Please try again.",
      response.status,
      error?.errors,
    );
  }

  return payload as T;
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await requestAuth<LaravelAuthResponse>("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  storeAccessToken(response.data.token);
  return response.data.user;
}

export async function register(formData: FormData): Promise<AuthUser> {
  const response = await requestAuth<LaravelAuthResponse>("/register", {
    method: "POST",
    body: formData,
  });

  storeAccessToken(response.data.token);
  return response.data.user;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!getAccessToken()) {
    return null;
  }

  try {
    const response = await requestAuth<LaravelCurrentUserResponse>(
      "/me",
      undefined,
      true,
    );

    return response.data;
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function getVenueOptions(): Promise<PreferredVenue[]> {
  const response = await requestAuth<LaravelVenueOptionsResponse>(
    "/filter-options",
  );

  return response.data.venues;
}

export async function updateProfile(formData: FormData): Promise<AuthUser> {
  const response = await requestAuth<LaravelCurrentUserResponse>(
    "/profile",
    {
      method: "PUT",
      body: formData,
    },
    true,
  );

  return response.data;
}

export async function logout(): Promise<void> {
  if (!getAccessToken()) {
    return;
  }

  try {
    await requestAuth<null>("/logout", { method: "POST" }, true);
  } finally {
    removeAccessToken();
  }
}
