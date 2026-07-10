import {
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_SOURCE_STORAGE_KEY,
  ANALYTICS_STORAGE_KEY,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from './privacy';

export type CookieConsentPreferences = {
  necessary: true;
  analytics: boolean;
  version: number;
  updatedAt: string;
};

export function createCookieConsentPreferences(
  analytics: boolean
): CookieConsentPreferences {
  return {
    necessary: true,
    analytics,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
}

export function getStoredCookieConsent(): CookieConsentPreferences | null {
  try {
    const rawConsent = localStorage.getItem(CONSENT_STORAGE_KEY);

    if (!rawConsent) {
      return null;
    }

    const parsedConsent: unknown = JSON.parse(rawConsent);

    if (
      typeof parsedConsent !== 'object' ||
      parsedConsent === null ||
      Array.isArray(parsedConsent)
    ) {
      return null;
    }

    const candidate = parsedConsent as Partial<CookieConsentPreferences>;

    if (
      candidate.necessary !== true ||
      typeof candidate.analytics !== 'boolean' ||
      candidate.version !== CONSENT_VERSION ||
      typeof candidate.updatedAt !== 'string'
    ) {
      return null;
    }

    return candidate as CookieConsentPreferences;
  } catch {
    return null;
  }
}

export function saveCookieConsent(
  preferences: CookieConsentPreferences
): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));

  if (!preferences.analytics) {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    sessionStorage.removeItem(ANALYTICS_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(ANALYTICS_SOURCE_STORAGE_KEY);
  }

  window.dispatchEvent(
    new CustomEvent<CookieConsentPreferences>('cookie-consent-updated', {
      detail: preferences,
    })
  );
}
