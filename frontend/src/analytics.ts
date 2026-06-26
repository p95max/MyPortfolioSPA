import { getStoredCookieConsent } from "./components/CookieConsent";

const ANALYTICS_STORAGE_KEY = "analytics-anonymous-id-v1";

type AnalyticsPayload = {
  event_type: "page_view";
  path: string;
  referrer: string;
  language: string;
  screen_width: number;
  screen_height: number;
  anonymous_id: string;
};

function analyticsAllowed(): boolean {
  return getStoredCookieConsent()?.analytics === true;
}

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? "http://localhost:8000";
}

function getAnonymousId(): string {
  const existingId = localStorage.getItem(ANALYTICS_STORAGE_KEY);

  if (existingId) {
    return existingId;
  }

  const newId =
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(ANALYTICS_STORAGE_KEY, newId);

  return newId;
}

export function trackPageView(path: string): void {
  if (!analyticsAllowed()) {
    return;
  }

  const payload: AnalyticsPayload = {
    event_type: "page_view",
    path,
    referrer: document.referrer || "",
    language: navigator.language || "",
    screen_width: window.screen?.width ?? 0,
    screen_height: window.screen?.height ?? 0,
    anonymous_id: getAnonymousId(),
  };

  const endpoint = `${getApiBaseUrl()}/api/analytics/`;
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics must never break UX.
  });
}