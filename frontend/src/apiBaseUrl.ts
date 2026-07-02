export function getApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
  const fallbackBaseUrl = import.meta.env.DEV ? "http://localhost:8000" : "";

  return (configuredBaseUrl || fallbackBaseUrl).replace(/\/$/, "");
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
