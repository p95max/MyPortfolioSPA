import { useEffect } from "react";
import { CredentialCard } from "../components/CredentialCard";
import { useCredentials } from "../hooks/useCredentials";
import "./Credentials.css";

export function Credentials() {
  const { credentials, error, isEmpty, loading } = useCredentials();

  useEffect(() => {
    document.title = "M.Petrykin — Credentials";
  }, []);

  return (
    <main className="page-credentials">
      <div className="credentials-container">
        <p className="credentials-eyebrow">Professional Development</p>
        <h1 className="credentials-title">Credentials</h1>
        <p className="credentials-description">
          Certifications and course badges that reflect my continuing work in
          backend development, infrastructure, and secure systems.
        </p>

        {loading && <p className="credentials-state">Loading credentials...</p>}

        {!loading && error && (
          <p className="credentials-state credentials-state--error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && isEmpty && (
          <div className="credentials-empty">
            <strong>Credentials will be added soon.</strong>
            <span>Check back for verified professional development records.</span>
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
