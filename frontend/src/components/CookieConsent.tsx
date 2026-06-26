import { useEffect, useState } from "react";
import {
  ANALYTICS_STORAGE_KEY,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from "../privacy";
import "./CookieConsent.css";

export type CookieConsentPreferences = {
  necessary: true;
  analytics: boolean;
  version: number;
  updatedAt: string;
};

function createConsentPreferences(analytics: boolean): CookieConsentPreferences {
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

function saveCookieConsent(preferences: CookieConsentPreferences): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));

  window.dispatchEvent(
    new CustomEvent<CookieConsentPreferences>("cookie-consent-updated", {
      detail: preferences,
    })
  );
}

function removeAnalyticsAnonymousId(): void {
  localStorage.removeItem(ANALYTICS_STORAGE_KEY);
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const storedConsent = getStoredCookieConsent();

    if (!storedConsent) {
      setIsVisible(true);
      return;
    }

    setAnalyticsEnabled(storedConsent.analytics);
  }, []);

  function handleRejectOptional() {
    const preferences = createConsentPreferences(false);

    removeAnalyticsAnonymousId();
    saveCookieConsent(preferences);
    setAnalyticsEnabled(false);
    setIsVisible(false);
  }

  function handleAcceptAll() {
    const preferences = createConsentPreferences(true);

    saveCookieConsent(preferences);
    setAnalyticsEnabled(true);
    setIsVisible(false);
  }

  function handleSaveSettings() {
    const preferences = createConsentPreferences(analyticsEnabled);

    if (!analyticsEnabled) {
      removeAnalyticsAnonymousId();
    }

    saveCookieConsent(preferences);
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-consent" role="dialog" aria-modal="true">
      <div className="cookie-consent__panel">
        <div className="cookie-consent__content">
          <p className="cookie-consent__eyebrow">Privacy settings</p>

          <h2 className="cookie-consent__title">Cookie preferences</h2>

          <p className="cookie-consent__text">
            This website uses necessary storage to remember your cookie choice.
            Optional analytics are only enabled if you actively accept them.
          </p>

          <div className="cookie-consent__options">
            <label className="cookie-consent__option cookie-consent__option--disabled">
              <input type="checkbox" checked disabled />
              <span>
                <strong>Necessary</strong>
                <small>Required for basic website functionality.</small>
              </span>
            </label>

            <label className="cookie-consent__option">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(event) => setAnalyticsEnabled(event.target.checked)}
              />
              <span>
                <strong>Analytics</strong>
                <small>
                  Helps understand website usage. Disabled by default.
                </small>
              </span>
            </label>
          </div>
        </div>

        <div className="cookie-consent__actions">
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--ghost"
            onClick={handleRejectOptional}
          >
            Reject optional
          </button>

          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--outline"
            onClick={handleSaveSettings}
          >
            Save settings
          </button>

          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--primary"
            onClick={handleAcceptAll}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}