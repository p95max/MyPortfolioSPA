import { resetPrivacyPreferences } from '../privacy';
import './Footer.css';
import { useTranslation } from '../i18n';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer
      style={{
        padding: '16px 0',
        borderTop: '1px solid #e5e7eb',
        marginTop: 24,
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ color: '#6b7280' }}>
          © {new Date().getFullYear()} Maksym Petrykin
        </span>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Legal links */}
          <a
            href="/impressum"
            style={{ color: '#6b7280', textDecoration: 'none' }}
          >
            {t("footer.legalNotice")}
          </a>

          <a
            href="/datenschutz"
            style={{ color: '#6b7280', textDecoration: 'none' }}
          >
            {t("footer.privacyPolicy")}
          </a>

          <button
            type="button"
            className="footer-link-button"
            onClick={resetPrivacyPreferences}
          >
            {t("footer.privacy")}
          </button>

          {/* GitHub */}
          <a
            href="https://github.com/p95max/MyPortfolioSPA"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link github-link--tooltip"
            data-tooltip={t("footer.source")}
            aria-label={t("footer.source")}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.7 0 8.26c0 3.65 2.29 6.74 5.47 7.83c.4.08.55-.18.55-.39c0-.19-.01-.82-.01-1.49c-2.01.37-2.53-.5-2.69-.96c-.09-.25-.48-1-.82-1.2c-.28-.15-.68-.52-.01-.53c.63-.01 1.08.58 1.23.82c.72 1.22 1.87.88 2.33.67c.07-.54.28-.88.5-1.08c-1.78-.21-3.64-.92-3.64-4.09c0-.9.31-1.64.82-2.22c-.08-.2-.36-1.03.08-2.15c0 0 .67-.22 2.2.85c.64-.18 1.33-.27 2.01-.27s1.37.09 2.01.27c1.53-1.07 2.2-.85 2.2-.85c.44 1.12.16 1.95.08 2.15c.51.58.82 1.32.82 2.22c0 3.18-1.87 3.87-3.65 4.08c.29.26.54.77.54 1.56c0 1.13-.01 2.04-.01 2.32c0 .21.15.47.55.39C13.71 15 16 11.91 16 8.26C16 3.7 12.42 0 8 0"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
