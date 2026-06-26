import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../analytics";

export function useAnalytics(): void {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;

    trackPageView(path);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleConsentUpdate() {
      const path = `${window.location.pathname}${window.location.search}`;
      trackPageView(path);
    }

    window.addEventListener("cookie-consent-updated", handleConsentUpdate);

    return () => {
      window.removeEventListener("cookie-consent-updated", handleConsentUpdate);
    };
  }, []);
}