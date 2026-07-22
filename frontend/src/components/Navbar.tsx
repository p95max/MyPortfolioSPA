import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useTranslation } from "../i18n";

export const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => setOpen(false), [location.pathname]);

  const links = [
    { to: "/", label: t("nav.about") },
    { to: "/projects", label: t("nav.projects") },
    { to: "/credentials", label: t("nav.certificates") },
    { to: "/contact", label: t("nav.contact") },
  ];

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
          <select className="nav-language" value={language} onChange={(event) => setLanguage(event.target.value as "en" | "de")} aria-label={t("nav.language")}>
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
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
