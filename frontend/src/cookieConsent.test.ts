import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createCookieConsentPreferences,
  getStoredCookieConsent,
  saveCookieConsent,
} from './cookieConsent';
import {
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_SOURCE_STORAGE_KEY,
  ANALYTICS_STORAGE_KEY,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from './privacy';

describe('cookie consent privacy behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('rejects malformed and structurally invalid stored consent', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, '{broken');
    expect(getStoredCookieConsent()).toBeNull();

    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: false,
        analytics: true,
        version: CONSENT_VERSION,
        updatedAt: new Date().toISOString(),
      })
    );
    expect(getStoredCookieConsent()).toBeNull();

    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: 'yes',
        version: CONSENT_VERSION,
        updatedAt: new Date().toISOString(),
      })
    );
    expect(getStoredCookieConsent()).toBeNull();
  });

  it('returns a valid current-version consent object', () => {
    const preferences = createCookieConsentPreferences(true);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));

    expect(getStoredCookieConsent()).toEqual(preferences);
  });

  it('removes all analytics identifiers when consent is revoked', () => {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, 'visitor-id');
    sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, 'session-id');
    sessionStorage.setItem(ANALYTICS_SOURCE_STORAGE_KEY, '{"source_type":"linkedin"}');

    const listener = vi.fn();
    window.addEventListener('cookie-consent-updated', listener);

    const preferences = createCookieConsentPreferences(false);
    saveCookieConsent(preferences);

    expect(localStorage.getItem(ANALYTICS_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(ANALYTICS_SOURCE_STORAGE_KEY)).toBeNull();
    expect(getStoredCookieConsent()).toEqual(preferences);
    expect(listener).toHaveBeenCalledOnce();

    window.removeEventListener('cookie-consent-updated', listener);
  });

  it('keeps existing analytics identifiers when analytics remains enabled', () => {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, 'visitor-id');
    sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, 'session-id');

    saveCookieConsent(createCookieConsentPreferences(true));

    expect(localStorage.getItem(ANALYTICS_STORAGE_KEY)).toBe('visitor-id');
    expect(sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)).toBe('session-id');
  });
});
