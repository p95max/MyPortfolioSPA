import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <div className="credential-modal" onClick={onClose}>
      <section
        className="credential-modal__content"
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

        <div className="credential-modal__media">
          {imageFailed ? (
            <p className="credential-modal__fallback">
              Preview unavailable. Use the original link below.
            </p>
          ) : (
            <img
              className="credential-modal__image"
              src={credential.imageUrl}
              alt={`${credential.title} issued by ${credential.issuer}`}
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
          >
            Open original
          </a>
        </div>
      </section>
    </div>,
    document.body,
  );
}
