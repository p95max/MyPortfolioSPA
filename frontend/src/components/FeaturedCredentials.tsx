import { Link } from "react-router-dom";
import { useCredentials } from "../hooks/useCredentials";
import { CredentialCard } from "./CredentialCard";
import "./FeaturedCredentials.css";

export function FeaturedCredentials() {
  const { credentials, error, loading } = useCredentials({ featured: true });

  if (loading || error || credentials.length === 0) {
    return null;
  }

  const featuredCredentials = credentials.slice(0, 3);

  return (
    <section className="featured-credentials" aria-labelledby="featured-credentials-title">
      <div className="featured-credentials__header">
        <div>
          <p className="featured-credentials__eyebrow">Professional development</p>
          <h2 id="featured-credentials-title" className="featured-credentials__title">
            Featured credentials
          </h2>
        </div>
        <Link className="featured-credentials__link" to="/credentials">
          View all credentials
        </Link>
      </div>

      <ul className="featured-credentials__grid">
        {featuredCredentials.map((credential) => (
          <li key={credential.id}>
            <CredentialCard credential={credential} />
          </li>
        ))}
      </ul>
    </section>
  );
}
