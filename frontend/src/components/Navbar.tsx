import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const links = [
    { to: "/", label: "about" },
    { to: "/projects", label: "projects" },
    { to: "/credentials", label: "credentials" },
    { to: "/contact", label: "contact" },
  ];

  return (
    <div className="nav-root">
      <nav className="nav-wrap" role="navigation" aria-label="Primary">
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
          <button
            className={`hamburger ${open ? "is-open" : ""}`}
            aria-label="Toggle menu"
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
