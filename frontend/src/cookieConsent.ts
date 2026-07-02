import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from './privacy';

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

    const parsedConsent = JSON.parse(rawConsent) as CookieConsentPreferences;

    if (parsedConsent.version !== CONSENT_VERSION) {
      return null;
    }

    return parsedConsent;
  } catch {
    return null;
  }
}

export function saveCookieConsent(
  preferences: CookieConsentPreferences
): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));

  window.dispatchEvent(
    new CustomEvent<CookieConsentPreferences>('cookie-consent-updated', {
      detail: preferences,
    })
  );
}
