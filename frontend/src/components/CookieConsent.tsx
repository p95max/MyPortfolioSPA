import { useEffect, useState } from "react";
import { ANALYTICS_SESSION_STORAGE_KEY, ANALYTICS_SOURCE_STORAGE_KEY, ANALYTICS_STORAGE_KEY } from "../privacy";
import { createCookieConsentPreferences, getStoredCookieConsent, saveCookieConsent } from "../cookieConsent";
import { useTranslation } from "../i18n";
import "./CookieConsent.css";

function removeAnalyticsStorage(): void { localStorage.removeItem(ANALYTICS_STORAGE_KEY); sessionStorage.removeItem(ANALYTICS_SESSION_STORAGE_KEY); sessionStorage.removeItem(ANALYTICS_SOURCE_STORAGE_KEY); }

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const { t } = useTranslation();
  useEffect(() => { const storedConsent = getStoredCookieConsent(); if (!storedConsent) { setIsVisible(true); return; } setAnalyticsEnabled(storedConsent.analytics); }, []);
  const save = (analytics: boolean) => { if (!analytics) removeAnalyticsStorage(); saveCookieConsent(createCookieConsentPreferences(analytics)); setAnalyticsEnabled(analytics); setIsVisible(false); };
  if (!isVisible) return null;
  return <div className="cookie-consent" role="dialog" aria-modal="true"><div className="cookie-consent__panel">
    <div className="cookie-consent__content"><p className="cookie-consent__eyebrow">{t("cookie.eyebrow")}</p><h2 className="cookie-consent__title">{t("cookie.title")}</h2><p className="cookie-consent__text">{t("cookie.text")}</p>
      <div className="cookie-consent__options"><label className="cookie-consent__option cookie-consent__option--disabled"><input type="checkbox" checked disabled /><span><strong>{t("cookie.necessary")}</strong><small>{t("cookie.necessaryText")}</small></span></label>
        <label className="cookie-consent__option"><input type="checkbox" checked={analyticsEnabled} onChange={(event) => setAnalyticsEnabled(event.target.checked)} /><span><strong>{t("cookie.analytics")}</strong><small>{t("cookie.analyticsText")}</small></span></label>
      </div></div>
    <div className="cookie-consent__actions"><button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={() => save(false)}>{t("cookie.reject")}</button><button type="button" className="cookie-consent__btn cookie-consent__btn--outline" onClick={() => save(analyticsEnabled)}>{t("cookie.save")}</button><button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={() => save(true)}>{t("cookie.accept")}</button></div>
  </div></div>;
}
