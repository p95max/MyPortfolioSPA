import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import aboutText from '../components/aboutText';

const containerStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: '48px auto',
  padding: 28,
  borderRadius: 12,
  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
};

/**
 * Card colors adapt to user's color scheme:
 * - background: light card on dark page, white card on light page
 * - text: high contrast
 */
const cardInnerStyle: React.CSSProperties = {
  padding: 22,
  borderRadius: 10,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02))',
  color: 'var(--text-color)',
};

const headerStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '2.2rem',
  lineHeight: 1.05,
  color: 'var(--accent-color)',
};

const subHeaderStyle: React.CSSProperties = {
  margin: '0 0 20px 0',
  color: 'var(--muted-color)',
  fontSize: '1rem',
};

const resumeControlsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  marginBottom: 18,
  flexWrap: 'wrap',
};

const btnBase: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
};

export const Home = () => {
  useEffect(() => {
    document.title = 'My SPA Portfolio — About';
  }, []);

  const [lang, setLang] = useState<'DE' | 'EN'>('DE');
  const [isDownloading, setIsDownloading] = useState(false);

  // small helper to download file served from /resume*.pdf
  const downloadFile = (path: string, filename: string) => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // небольшой отступ чтобы UI показал статус
    setTimeout(() => setIsDownloading(false), 900);
  };

  // CSS variables via inline style for quick control and theme support
  const vars = {
    '--accent-color': '#0070f3',
    '--text-color': '#f6f6f6',
    '--muted-color': '#c6d4e6',
    '--card-bg': 'rgba(20,20,20,0.65)',
  } as React.CSSProperties;

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          ...containerStyle,
          background: 'linear-gradient(180deg, rgba(10,10,10,0.65), rgba(10,10,10,0.5))',
          ...vars,
        }}
      >
        <div style={{ ...cardInnerStyle, background: 'var(--card-bg)' }}>
          <h1 style={headerStyle}>Hi — I’m Maksym. I build dependable backend systems.</h1>
          <p style={subHeaderStyle}>
            Pragmatic engineering: reliable APIs, repeatable deployments, and clean, testable code.
            I prefer small, iterative changes that produce value — not experimental toys.
          </p>

          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: '1fr', marginBottom: 8 }}>
            <div style={{ color: 'var(--muted-color)', lineHeight: 1.6 }}>
              <ReactMarkdown>{aboutText}</ReactMarkdown>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 14 }}>
              <div style={resumeControlsStyle}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setLang('DE')}
                    aria-pressed={lang === 'DE'}
                    style={{
                      ...btnBase,
                      background: lang === 'DE' ? 'var(--accent-color)' : 'transparent',
                      color: lang === 'DE' ? '#fff' : 'var(--muted-color)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    Deutsch
                  </button>
                  <button
                    onClick={() => setLang('EN')}
                    aria-pressed={lang === 'EN'}
                    style={{
                      ...btnBase,
                      background: lang === 'EN' ? 'var(--accent-color)' : 'transparent',
                      color: lang === 'EN' ? '#fff' : 'var(--muted-color)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    English
                  </button>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => downloadFile(lang === 'DE' ? '/resumeDE.pdf' : '/resumeENG.pdf', lang === 'DE' ? 'Resume_DE.pdf' : 'Resume_EN.pdf')}
                    style={{
                      ...btnBase,
                      background: '#22c55e',
                      color: '#fff',
                    }}
                    disabled={isDownloading}
                  >
                    {isDownloading ? 'Downloading...' : 'Download Resume'}
                  </button>

                  <a
                    href={lang === 'DE' ? '/resumeDE.pdf' : '/resumeENG.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      ...btnBase,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'transparent',
                      color: 'var(--muted-color)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      textDecoration: 'none',
                    }}
                  >
                    View PDF
                  </a>
                </div>
              </div>

              <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
                <iframe
                  src={lang === 'DE' ? '/resumeDE.pdf' : '/resumeENG.pdf'}
                  width="100%"
                  height="560"
                  title={`Resume ${lang}`}
                  style={{ display: 'block', border: 0 }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
            <a href="/projects" style={{ color: 'var(--accent-color)', fontWeight: 700 }}>
              See projects →
            </a>
            <a href="/contact" style={{ color: 'var(--muted-color)' }}>
              Contact me
            </a>
            <div style={{ marginLeft: 'auto', color: 'var(--muted-color)', fontSize: 13 }}>
              Location: Germany — open to remote
            </div>
          </div>
        </div>
      </div>

      {/* Theme helper: inject small style tag to ensure good contrast on light mode */}
      <style>{`
        @media (prefers-color-scheme: light) {
          :root {
            --accent-color: #0b61d6;
            --text-color: #1f2937;
            --muted-color: #475569;
            --card-bg: #ffffff;
          }
          body { background-color: #f6f8fb; }
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --accent-color: #7aa7ff;
            --text-color: #f6f6f6;
            --muted-color: #c6d4e6;
            --card-bg: rgba(18,18,20,0.72);
          }
          body { background-color: #0f1720; }
        }
        /* small responsive tweak */
        @media (max-width: 720px) {
          .home-iframe { height: 420px !important; }
        }
      `}</style>
    </div>
  );
};
