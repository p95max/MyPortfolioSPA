import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useTranslation } from "../i18n";
import { applyTheme, getInitialTheme, type Theme } from "../theme";
import { trackLanguageChange, trackThemeChange } from "../analytics";

export const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  const links = [
    { to: "/", label: t("nav.about") },
    { to: "/projects", label: t("nav.projects") },
    { to: "/credentials", label: t("nav.certificates") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const handleLanguageChange = (locale: "en" | "de") => {
    if (locale === language) {
      return;
    }

    trackLanguageChange(language, locale);
    setLanguage(locale);
  };

  const handleThemeChange = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      trackThemeChange(current, next);
      return next;
    });
  };

  return (
    <div className="nav-root">
      <nav className="nav-wrap" role="navigation" aria-label={t("nav.menu")}>
        <Link to="/" className="brand">~/p95max</Link>

        <div className={`nav-center ${open ? "open" : ""}`} id="primary-menu">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-language" role="group" aria-label={t("nav.language")}>
            {(["en", "de"] as const).map((locale) => (
              <button
                key={locale}
                type="button"
                className={language === locale ? "active" : ""}
                onClick={() => handleLanguageChange(locale)}
                aria-pressed={language === locale}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="theme-switch"
            role="switch"
            aria-checked={theme === "light"}
            aria-label={theme === "light" ? t("nav.darkTheme") : t("nav.lightTheme")}
            onClick={handleThemeChange}
          >
            <span className="theme-switch__sun" aria-hidden="true">☀</span>
            <span className="theme-switch__thumb" aria-hidden="true" />
            <span className="theme-switch__moon" aria-hidden="true">☾</span>
          </button>
          <button
            className={`hamburger ${open ? "is-open" : ""}`}
            aria-label={t("nav.toggle")}
            aria-controls="primary-menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>
      <div className="nav-spacer" />
    </div>
  );
};

export default Navbar;
