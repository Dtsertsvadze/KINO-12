export function getApiUrl(path: `/${string}`) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL;

  if (!apiBaseUrl) {
    throw new Error("The API URL is not configured.");
  }

  return `${apiBaseUrl.replace(/\/$/, "")}${path}`;
}
