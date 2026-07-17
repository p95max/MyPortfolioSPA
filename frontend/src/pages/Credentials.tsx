import { useEffect, useState } from "react";
import { CredentialCard } from "../components/CredentialCard";
import { useCredentials } from "../hooks/useCredentials";
import type { CredentialType } from "../types";
import "./Credentials.css";

type CredentialFilter = "all" | CredentialType;

const FILTERS: Array<{ value: CredentialFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "certificate", label: "Certificates" },
  { value: "badge", label: "Badges" },
];

export function Credentials() {
  const [selectedFilter, setSelectedFilter] = useState<CredentialFilter>("all");
  const { credentials, error, isEmpty, loading } = useCredentials({
    type: selectedFilter === "all" ? undefined : selectedFilter,
  });

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

        <div className="credentials-filters" aria-label="Filter credentials by type">
          {FILTERS.map(({ label, value }) => (
            <button
              className={`credentials-filter ${selectedFilter === value ? "is-active" : ""}`}
              type="button"
              key={value}
              aria-pressed={selectedFilter === value}
              onClick={() => setSelectedFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="credentials-state">Loading credentials...</p>}

        {!loading && error && (
          <p className="credentials-state credentials-state--error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && isEmpty && (
          <div className="credentials-empty">
            <strong>
              {selectedFilter === "all"
                ? "Credentials will be added soon."
                : `No ${selectedFilter === "certificate" ? "certificates" : "badges"} found.`}
            </strong>
            <span>
              {selectedFilter === "all"
                ? "Check back for verified professional development records."
                : "Try viewing all credentials or select the other type."}
            </span>
            {selectedFilter !== "all" && (
              <button
                className="credentials-empty__button"
                type="button"
                onClick={() => setSelectedFilter("all")}
              >
                View all credentials
              </button>
            )}
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
