import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';

export const Navbar = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  );
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {

    setOpenMobile(false);
  }, [location.pathname]);

  const links = [
    { to: '/', label: 'About' },
    { to: '/projects', label: 'Projects' },
    { to: '/certificates', label: 'Certificates' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`nav-root ${isDark ? 'dark' : 'light'}`}>
      <nav className="nav-wrap" aria-label="Main navigation">

        <div className={`nav-center ${openMobile ? 'open' : ''}`} id="primary-navigation">
          {links.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`nav-link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="nav-right">

          <button
            className={`hamburger ${openMobile ? 'is-open' : ''}`}
            aria-label={openMobile ? 'Close menu' : 'Open menu'}
            aria-expanded={openMobile}
            aria-controls="primary-navigation"
            onClick={() => setOpenMobile((s) => !s)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
