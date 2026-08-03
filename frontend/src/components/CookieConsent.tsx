import { useEffect, useState } from "react";
import { ANALYTICS_SESSION_STORAGE_KEY, ANALYTICS_SOURCE_STORAGE_KEY, ANALYTICS_STORAGE_KEY } from "../privacy";
import { createCookieConsentPreferences, getStoredCookieConsent, saveCookieConsent } from "../cookieConsent";
import { useTranslation } from "../i18n";
import { useLegalContent } from "../legalContent";
import "./CookieConsent.css";

function removeAnalyticsStorage(): void {
  localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  sessionStorage.removeItem(ANALYTICS_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(ANALYTICS_SOURCE_STORAGE_KEY);
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const { language, t } = useTranslation();
  const legalContent = useLegalContent();

  const text = (name: string, fallbackKey: string): string => {
    const key = `cookie_${name}_${language}` as keyof NonNullable<typeof legalContent>;
    const value = legalContent?.[key];
    return typeof value === "string" && value.trim() ? value : t(fallbackKey);
  };

  useEffect(() => {
    const storedConsent = getStoredCookieConsent();
    if (!storedConsent) {
      setIsVisible(true);
      return;
    }
    setAnalyticsEnabled(storedConsent.analytics);
  }, []);

  const save = (analytics: boolean) => {
    if (!analytics) removeAnalyticsStorage();
    saveCookieConsent(createCookieConsentPreferences(analytics));
    setAnalyticsEnabled(analytics);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-modal="true">
      <div className="cookie-consent__panel">
        <div className="cookie-consent__content">
          <p className="cookie-consent__eyebrow">{text("eyebrow", "cookie.eyebrow")}</p>
          <h2 className="cookie-consent__title">{text("title", "cookie.title")}</h2>
          <p className="cookie-consent__text">{text("text", "cookie.text")}</p>
          <div className="cookie-consent__options">
            <label className="cookie-consent__option cookie-consent__option--disabled">
              <input type="checkbox" checked disabled />
              <span>
                <strong>{text("necessary", "cookie.necessary")}</strong>
                <small>{text("necessary_text", "cookie.necessaryText")}</small>
              </span>
            </label>
            <label className="cookie-consent__option">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(event) => setAnalyticsEnabled(event.target.checked)}
              />
              <span>
                <strong>{text("analytics", "cookie.analytics")}</strong>
                <small>{text("analytics_text", "cookie.analyticsText")}</small>
              </span>
            </label>
          </div>
        </div>
        <div className="cookie-consent__actions">
          <button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={() => save(false)}>
            {text("reject", "cookie.reject")}
          </button>
          <button type="button" className="cookie-consent__btn cookie-consent__btn--outline" onClick={() => save(analyticsEnabled)}>
            {text("save", "cookie.save")}
          </button>
          <button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={() => save(true)}>
            {text("accept", "cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
