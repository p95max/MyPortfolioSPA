import { useEffect } from "react";
import { CredentialCard } from "../components/CredentialCard";
import { useCredentials } from "../hooks/useCredentials";
import { useTranslation } from "../i18n";
import "./Credentials.css";

export function Credentials() {
  const { credentials, error, isEmpty, loading } = useCredentials();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "M.Petrykin — Certificates";
  }, []);

  return (
    <main className="page-credentials">
      <div className="credentials-container">
        <p className="credentials-eyebrow">{t("credentials.eyebrow")}</p>
        <h1 className="credentials-title">{t("credentials.title")}</h1>
        <p className="credentials-description">
          {t("credentials.description")}
        </p>

        {loading && (
          <p className="credentials-state">{t("credentials.loading")}</p>
        )}

        {!loading && error && (
          <p className="credentials-state credentials-state--error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && isEmpty && (
          <div className="credentials-empty">
            <strong>{t("credentials.emptyTitle")}</strong>
            <span>{t("credentials.emptyText")}</span>
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <ul className="credentials-grid">
            {credentials.map((credential) => (
              <li key={credential.id}>
                <CredentialCard credential={credential} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default Credentials;
