export function getApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (import.meta.env.VITE_USE_API_PROXY === "true") {
    return "";
  }

  const fallbackBaseUrl = import.meta.env.DEV ? "http://localhost:8000" : "";

  return fallbackBaseUrl.replace(/\/$/, "");
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
