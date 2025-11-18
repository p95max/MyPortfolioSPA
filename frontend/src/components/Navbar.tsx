import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();

  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const bg = isDark ? 'rgba(10,12,16,0.75)' : 'rgba(255,255,255,0.9)';
  const border = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const accent = 'linear-gradient(90deg,#6c7bff,#4ec5ff)';

  const links = [
    { to: '/', label: 'About' },
    { to: '/projects', label: 'Projects' },
    { to: '/certificates', label: 'Credentials' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(1100px, 96%)',
        height: 64,
        background: bg,
        borderRadius: 14,
        border: `1px solid ${border}`,
        boxShadow: '0 6px 20px rgba(2,6,23,0.35)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, boxShadow: '0 6px 16px rgba(108,123,255,0.18)'
        }}>
          SPA
        </div>
        <div style={{ fontWeight: 700, letterSpacing: 0.2, color: isDark ? '#e6eefc' : '#0f1720' }}>
          My Single Page Portfolio
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {links.map(({ to, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                fontWeight: 600,
                textDecoration: 'none',
                color: active ? '#0b1220' : (isDark ? '#dfe9ff' : '#0b1220'),
                background: active ? 'linear-gradient(90deg,#9aa4ff,#6cc8ff)' : 'transparent',
                transform: 'translateY(0)',
                transition: 'transform 160ms cubic-bezier(.2,.9,.2,1), box-shadow 160ms',
                boxShadow: active ? '0 8px 18px rgba(78,197,255,0.18)' : 'none',
                border: active ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(-3px)';
                el.style.boxShadow = '0 12px 30px rgba(10,20,40,0.12)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = active ? '0 8px 18px rgba(78,197,255,0.18)' : 'none';
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
