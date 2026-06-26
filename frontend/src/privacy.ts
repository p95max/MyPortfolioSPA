export const CONSENT_STORAGE_KEY = "cookie-consent-v1";
export const ANALYTICS_STORAGE_KEY = "analytics-anonymous-id-v1";
export const ANALYTICS_SESSION_STORAGE_KEY = "analytics-session-id-v1";
export const ANALYTICS_SOURCE_STORAGE_KEY = "analytics-source-context-v1";
export const CONSENT_VERSION = 1;

export function resetPrivacyPreferences(): void {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  localStorage.removeItem(ANALYTICS_STORAGE_KEY);

  sessionStorage.removeItem(ANALYTICS_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(ANALYTICS_SOURCE_STORAGE_KEY);

  window.location.reload();
}