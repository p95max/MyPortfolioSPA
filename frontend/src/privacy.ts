export const CONSENT_STORAGE_KEY = "cookie-consent-v1";
export const ANALYTICS_STORAGE_KEY = "analytics-anonymous-id-v1";
export const CONSENT_VERSION = 1;

export function resetPrivacyPreferences(): void {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  window.location.reload();
}