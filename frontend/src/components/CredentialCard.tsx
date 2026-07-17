import { useEffect, useState } from "react";
import { trackCredentialLinkClick, trackCredentialView } from "../analytics";
import type { Credential } from "../types";
import "./CredentialCard.css";
import { CredentialModal } from "./CredentialModal";

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850">' +
      '<rect width="100%" height="100%" fill="#0e1219"/>' +
      '<text x="50%" y="50%" fill="#6b7d93" font-family="system-ui" ' +
      'font-size="32" text-anchor="middle" dominant-baseline="middle">' +
      'Credential preview unavailable</text></svg>',
  );

export interface CredentialCardProps {
  credential: Credential;
  onPreview?: (credential: Credential) => void;
}

function formatCredentialIssueDate(issuedAt: string): string {
  const date = new Date(`${issuedAt}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return issuedAt;
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCategory(category: Credential["category"]): string {
  return category.replace(/(^|_)(\w)/g, (_, prefix: string, letter: string) =>
    `${prefix} ${letter.toUpperCase()}`.trim(),
  );
}

export function CredentialCard({
  credential,
  onPreview,
}: CredentialCardProps) {
  const [imageSrc, setImageSrc] = useState(credential.imageUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const typeLabel = credential.credentialType === "certificate" ? "Certificate" : "Badge";
  const previewLabel = credential.credentialType === "certificate"
    ? "Open certificate preview"
    : "Open badge preview";
  const canPreview = credential.credentialType === "certificate" || !credential.credentialUrl;
  const imageDimensions = credential.credentialType === "badge"
    ? { width: 104, height: 104 }
    : { width: 1200, height: 750 };

  useEffect(() => {
    setImageSrc(credential.imageUrl);
  }, [credential.imageUrl]);

  const openPreview = () => {
    trackCredentialView(credential);
    onPreview?.(credential);
    setIsModalOpen(true);
  };

  const previewImage = (
    <img
      className="credential-card__image"
      src={imageSrc}
      alt={`${credential.title} issued by ${credential.issuer}`}
      width={imageDimensions.width}
      height={imageDimensions.height}
      loading="lazy"
      decoding="async"
      onError={() => setImageSrc(FALLBACK_IMAGE)}
    />
  );

  return (
    <article className={`credential-card credential-card--${credential.credentialType}`}>
      {canPreview ? (
        <button
          className="credential-card__media credential-card__media--interactive"
          type="button"
          aria-label={`${previewLabel}: ${credential.title}`}
          title={previewLabel}
          onClick={openPreview}
        >
          {previewImage}
        </button>
      ) : (
        <div className="credential-card__media">{previewImage}</div>
      )}

      <div className="credential-card__body">
        <p className="credential-card__type">{typeLabel}</p>
        <h3 className="credential-card__title">{credential.title}</h3>
        <p className="credential-card__issuer">{credential.issuer}</p>
        <time className="credential-card__date" dateTime={credential.issuedAt}>
          {formatCredentialIssueDate(credential.issuedAt)}
        </time>

        <div className="credential-card__tags" aria-label="Credential category and skills">
          <span className="credential-card__category">
            {formatCategory(credential.category)}
          </span>
          {credential.skills.slice(0, 3).map((skill) => (
            <span className="credential-card__skill" key={skill}>
              {skill}
            </span>
          ))}
        </div>

        {credential.credentialUrl && (
          <div className="credential-card__actions">
            <a
              className="credential-card__action credential-card__action--primary"
              href={credential.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Verify credential: ${credential.title}`}
              onClick={() =>
                trackCredentialLinkClick(
                  credential,
                  "verification_url",
                  credential.credentialUrl ?? "",
                )
              }
            >
              Verify credential
            </a>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CredentialModal
          credential={credential}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </article>
  );
}
