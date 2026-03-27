import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./navbar.css";

export const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const rootClass = useMemo(() => `nav-root ${isDark ? "dark" : ""}`, [isDark]);

  const links = [
    { to: "/", label: "About" },
    { to: "/projects", label: "Projects" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className={rootClass}>
      <nav className="nav-wrap" role="navigation" aria-label="Primary">
        {/* brand */}
        <Link to="/" className="brand">
          <span className="brand-logo">SPA</span>
          <span>My Single Page Portfolio</span>
        </Link>

        <div className={`nav-center ${open ? "open" : ""}`} id="primary-menu">
          {links.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} className={`nav-link ${active ? "active" : ""}`}>
                {label}
              </Link>
            );
          })}
        </div>

        <div className="nav-right">
          <button
            className={`hamburger ${open ? "is-open" : ""}`}
            aria-label="Toggle menu"
            aria-controls="primary-menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className="nav-spacer" />
    </div>
  );
};

export default Navbar;
