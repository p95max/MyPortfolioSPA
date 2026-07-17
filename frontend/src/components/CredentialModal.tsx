import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trackCredentialLinkClick } from "../analytics";
import type { Credential } from "../types";
import "./CredentialModal.css";

export interface CredentialModalProps {
  credential: Credential | null;
  onClose: () => void;
}

export function CredentialModal({ credential, onClose }: CredentialModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (!credential) {
      return;
    }

    triggerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setImageFailed(false);

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (triggerRef.current?.isConnected) {
        triggerRef.current.focus();
      }
    };
  }, [credential, onClose]);

  if (!credential) {
    return null;
  }

  const imageDimensions = credential.credentialType === "badge"
    ? { width: 104, height: 104 }
    : { width: 1200, height: 750 };

  return createPortal(
    <div className="credential-modal" onClick={onClose}>
      <section
        className={`credential-modal__content credential-modal__content--${credential.credentialType}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="credential-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="credential-modal__header">
          <div>
            <p className="credential-modal__eyebrow">
              {credential.credentialType === "certificate" ? "Certificate" : "Badge"}
            </p>
            <h2 id="credential-modal-title" className="credential-modal__title">
              {credential.title}
            </h2>
          </div>
          <button
            className="credential-modal__close"
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close credential preview"
          >
            ×
          </button>
        </div>

        <div className={`credential-modal__media credential-modal__media--${credential.credentialType}`}>
          {imageFailed ? (
            <p className="credential-modal__fallback">
              Preview unavailable. Use the original link below.
            </p>
          ) : (
            <img
              className={`credential-modal__image credential-modal__image--${credential.credentialType}`}
              src={credential.imageUrl}
              alt={`${credential.title} issued by ${credential.issuer}`}
              width={imageDimensions.width}
              height={imageDimensions.height}
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <div className="credential-modal__footer">
          <p className="credential-modal__issuer">Issued by {credential.issuer}</p>
          <a
            className="credential-modal__original"
            href={credential.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open original credential file: ${credential.title}`}
            onClick={() =>
              trackCredentialLinkClick(credential, "original", credential.imageUrl)
            }
          >
            Open original
          </a>
        </div>
      </section>
    </div>,
    document.body,
  );
}
