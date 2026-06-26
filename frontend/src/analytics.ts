import { getStoredCookieConsent } from "./components/CookieConsent";

const ANALYTICS_STORAGE_KEY = "analytics-anonymous-id-v1";

type AnalyticsEventType = "page_view" | "contact_submit";

type AnalyticsPayload = {
  event_type: AnalyticsEventType;
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
  const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
  return baseUrl.replace(/\/$/, "");
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

export function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  path: string
): void {
  if (!analyticsAllowed()) {
    return;
  }

  const payload: AnalyticsPayload = {
    event_type: eventType,
    path,
    referrer: document.referrer || "",
    language: navigator.language || "",
    screen_width: window.screen?.width ?? 0,
    screen_height: window.screen?.height ?? 0,
    anonymous_id: getAnonymousId(),
  };

  fetch(`${getApiBaseUrl()}/api/analytics/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics must never break UX.
  });
}

export function trackPageView(path: string): void {
  trackAnalyticsEvent("page_view", path);
}