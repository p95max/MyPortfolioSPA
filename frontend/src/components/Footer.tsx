export const Footer = () => (
  <footer
    style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      height: 50,
      backgroundColor: 'rgba(36, 36, 36, 0.8)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9rem',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      zIndex: 1000,
    }}
  >
    © 2025 by p95max. All rights reserved.
  </footer>
);