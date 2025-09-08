import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const [isDark, setIsDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const bgColor = isDark ? 'rgba(36, 36, 36, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  const boxShadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)';

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 60,
        backgroundColor: bgColor,
        boxShadow: `0 2px 4px ${boxShadowColor}`,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <Link to="/" style={{ marginRight: 15 }}>About me</Link>
      <Link to="/projects" style={{ marginRight: 15 }}>Projects</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
};