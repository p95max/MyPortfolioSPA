import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../analytics";

export function useAnalytics(): void {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || "/";

    trackPageView(path);
  }, [location.pathname]);

  useEffect(() => {
    const handleConsentUpdated = () => {
      const path = window.location.pathname || "/";

      trackPageView(path);
    };

    window.addEventListener("cookie-consent-updated", handleConsentUpdated);

    return () => {
      window.removeEventListener("cookie-consent-updated", handleConsentUpdated);
    };
  }, []);
}