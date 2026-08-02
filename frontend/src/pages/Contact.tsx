import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, FormEvent } from "react";
import "./Contact.css";
import { trackContactSubmit, trackOutboundLinkClick } from "../analytics";
import { getApiUrl } from "../apiBaseUrl";
import { useTranslation } from "../i18n";

type Form = {
  name: string;
  email: string;
  message: string;
  hp?: string;
};

type ContactDetails = {
  email: string;
  github_url: string;
  linkedin_url: string;
  telegram_url: string;
};

type ContactFieldName = "name" | "email" | "message";

type FieldErrors = Partial<Record<ContactFieldName, string>>;

type TouchedFields = Record<ContactFieldName, boolean>;

const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  messageMin: 10,
  messageMax: 1000,
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement | string,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "refresh-expired"?: "auto" | "manual";
          theme?: "auto" | "light" | "dark";
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string | undefined;
      reset?: (widgetId?: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      TURNSTILE_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });

      setTimeout(() => {
        if (window.turnstile) {
          resolve();
        }
      }, 0);

      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject();

    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

function isErrorLike(x: unknown): x is { message?: string } {
  return typeof x === "object" && x !== null && "message" in x;
}

function isContactFieldName(value: string): value is ContactFieldName {
  return value === "name" || value === "email" || value === "message";
}

function isContactDetails(value: unknown): value is ContactDetails {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const details = value as Record<string, unknown>;

  return ["email", "github_url", "linkedin_url", "telegram_url"].every(
    (field) => typeof details[field] === "string"
  );
}

function linkLabel(value: string): string {
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname}`.replace(
      /\/$/,
      ""
    );
  } catch {
    return value;
  }
}

function telegramLabel(value: string): string {
  try {
    const username = new URL(value).pathname.replace(/^\/+|\/+$/g, "");
    return username ? `@${username}` : linkLabel(value);
  } catch {
    return value;
  }
}

function validateContactForm(form: Form, t: (key: string) => string): FieldErrors {
  const errors: FieldErrors = {};

  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();

  if (!name) {
    errors.name = t("contact.nameRequired");
  } else if (name.length < CONTACT_LIMITS.nameMin) {
    errors.name = t("contact.nameMin");
  } else if (name.length > CONTACT_LIMITS.nameMax) {
    errors.name = t("contact.nameMax");
  }

  if (!email) {
    errors.email = t("contact.emailRequired");
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = t("contact.emailInvalid");
  }

  if (!message) {
    errors.message = t("contact.messageRequired");
  } else if (message.length < CONTACT_LIMITS.messageMin) {
    errors.message = t("contact.messageMin");
  } else if (message.length > CONTACT_LIMITS.messageMax) {
    errors.message = t("contact.messageMax");
  }

  return errors;
}

function hasValidationErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

function extractServerFieldErrors(data: unknown): FieldErrors {
  const errors: FieldErrors = {};

  if (typeof data !== "object" || data === null) {
    return errors;
  }

  for (const [key, rawValue] of Object.entries(data)) {
    if (!isContactFieldName(key)) {
      continue;
    }

    if (Array.isArray(rawValue)) {
      const firstError = rawValue.find((item) => typeof item === "string");

      if (firstError) {
        errors[key] = firstError;
      }

      continue;
    }

    if (typeof rawValue === "string") {
      errors[key] = rawValue;
    }
  }

  return errors;
}

function extractApiDetail(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  if ("detail" in data && typeof data.detail === "string") {
    return data.detail;
  }

  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }

  return null;
}

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    message: "",
    hp: "",
  });

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    email: false,
    message: false,
  });

  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    document.title = "M.Petrykin — Contact";
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(getApiUrl("/api/contact-details/"))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load contact details (${response.status})`);
        }

        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!cancelled && isContactDetails(data)) {
          setContactDetails(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContactDetails(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const apiUrl = useMemo(() => {
    return getApiUrl("/api/contact/");
  }, []);

  const siteKey = useMemo(() => {
    const value = import.meta.env.VITE_TURNSTILE_SITEKEY;
    return typeof value === "string" ? value.trim() : "";
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!siteKey) {
      return;
    }

    loadTurnstileScript()
      .then(() => {
        if (
          cancelled ||
          !widgetRef.current ||
          !window.turnstile ||
          widgetIdRef.current
        ) {
          return;
        }

        const widgetId = window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          "refresh-expired": "auto",
          callback: (token) => {
            setCaptchaToken(token);
          },
          "expired-callback": () => {
            setCaptchaToken(null);
          },
          "error-callback": () => {
            setCaptchaToken(null);
          },
          theme: "dark",
        });

        widgetIdRef.current = widgetId ?? null;
      })
      .catch(() => {
        setCaptchaToken(null);
        setErr(t("contact.captchaFailed"));
      });

    return () => {
      cancelled = true;

      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, t]);

  const clientFieldErrors = useMemo(() => {
    return validateContactForm(form, t);
  }, [form, t]);

  const messageLength = form.message.length;

  const messageLimitReached =
    messageLength >= CONTACT_LIMITS.messageMax;

  const messageCounterClassName = [
    "field-counter",
    messageLimitReached ? "field-counter--limit" : "",
    messageErrorPreview(clientFieldErrors, touched, serverFieldErrors)
      ? "field-counter--with-error"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const fieldName = e.target.name;

    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: e.target.value,
    }));

    if (isContactFieldName(fieldName)) {
      setServerFieldErrors((currentErrors) => {
        if (!currentErrors[fieldName]) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors[fieldName];

        return nextErrors;
      });
    }

    if (err) {
      setErr(null);
    }
  };

  const onBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const fieldName = e.target.name;

    if (!isContactFieldName(fieldName)) {
      return;
    }

    setTouched((currentTouched) => ({
      ...currentTouched,
      [fieldName]: true,
    }));
  };

  const resetCaptcha = () => {
    setCaptchaToken(null);

    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset?.(widgetIdRef.current);
    }
  };

  const getVisibleFieldError = (
    fieldName: ContactFieldName
  ): string | undefined => {
    if (serverFieldErrors[fieldName]) {
      return serverFieldErrors[fieldName];
    }

    if (!touched[fieldName]) {
      return undefined;
    }

    return clientFieldErrors[fieldName];
  };

  const nameError = getVisibleFieldError("name");
  const emailError = getVisibleFieldError("email");
  const messageError = getVisibleFieldError("message");

  const messageDescribedBy = [
    messageError ? "message-error" : "",
    "message-counter",
  ]
    .filter(Boolean)
    .join(" ");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setErr(null);

    if (form.hp) {
      setOk(true);
      return;
    }

    setTouched({
      name: true,
      email: true,
      message: true,
    });

    if (hasValidationErrors(clientFieldErrors)) {
      setErr(t("contact.fixFields"));
      return;
    }

    if (!siteKey) {
      setErr(t("contact.captchaMissing"));
      return;
    }

    if (!captchaToken) {
      setErr(t("contact.captchaRequired"));
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          message: form.message.trim(),
          hp: form.hp ?? "",
          cf_turnstile_token: captchaToken,
        }),
      });

      if (!resp.ok) {
        let detail = `Failed to send message (HTTP ${resp.status})`;

        try {
          const data: unknown = await resp.json();

          const nextServerFieldErrors = extractServerFieldErrors(data);

          if (hasValidationErrors(nextServerFieldErrors)) {
            setServerFieldErrors(nextServerFieldErrors);
            setTouched({
              name: true,
              email: true,
              message: true,
            });
            detail = t("contact.fixFields");
          } else {
            detail = extractApiDetail(data) ?? detail;
          }
        } catch {
          // Backend returned non-JSON response.
        }

        if (resp.status === 400 && /captcha/i.test(detail)) {
          resetCaptcha();
          detail = t("contact.captchaInvalid");
        }

        if (resp.status === 429) {
          detail = t("contact.tooMany");
        }

        throw new Error(detail);
      }

      trackContactSubmit();
      setOk(true);
    } catch (error: unknown) {
      setErr(
        isErrorLike(error) && typeof error.message === "string"
          ? error.message
          : t("contact.fallback")
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(() => {
    return (
      !hasValidationErrors(clientFieldErrors) &&
      !!siteKey &&
      !!captchaToken &&
      !loading
    );
  }, [clientFieldErrors, siteKey, captchaToken, loading]);

  if (ok) {
    return (
      <div className="contact-page">
        <div className="contact-success">
          <div className="success-icon" aria-hidden>
            ✅
          </div>
          <h2>{t("contact.successTitle")}</h2>
          <p>{t("contact.successText")}</p>
          <a className="btn btn-primary" href="/">
            {t("contact.home")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <p className="cp-eyebrow">{t("contact.eyebrow")}</p>
        <h1>{t("contact.title")}</h1>
        <p>{t("contact.intro")}</p>
      </section>

      <div className="contact-grid">
        <form
          className="contact-card"
          onSubmit={onSubmit}
          noValidate
          aria-describedby="form-help"
        >
          <div className="card-header">
            <h2>{t("contact.sendTitle")}</h2>
            <p id="form-help">{t("contact.required")}</p>
          </div>

          {err && (
            <div className="alert" role="alert">
              {err}
            </div>
          )}

          <input
            className="hp"
            type="text"
            name="hp"
            autoComplete="off"
            tabIndex={-1}
            value={form.hp}
            onChange={onChange}
            aria-hidden="true"
          />

          <div className="field">
            <input
              className={`input ${nameError ? "input-error" : ""}`}
              name="name"
              value={form.name}
              onChange={onChange}
              onBlur={onBlur}
              maxLength={CONTACT_LIMITS.nameMax}
              required
              placeholder=" "
              aria-label={t("contact.name")}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : undefined}
            />
            <label className="label">{t("contact.name")}</label>

            {nameError && (
              <p className="field-error" id="name-error">
                {nameError}
              </p>
            )}
          </div>

          <div className="field">
            <input
              className={`input ${emailError ? "input-error" : ""}`}
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              onBlur={onBlur}
              required
              placeholder=" "
              aria-label={t("contact.email")}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            <label className="label">{t("contact.email")}</label>

            {emailError && (
              <p className="field-error" id="email-error">
                {emailError}
              </p>
            )}
          </div>

          <div className="field">
            <textarea
              className={`input textarea ${messageError ? "input-error" : ""}`}
              name="message"
              rows={6}
              value={form.message}
              onChange={onChange}
              onBlur={onBlur}
              maxLength={CONTACT_LIMITS.messageMax}
              required
              placeholder=" "
              aria-label={t("contact.message")}
              aria-invalid={!!messageError}
              aria-describedby={messageDescribedBy}
            />
            <label className="label">{t("contact.message")}</label>

            <div className="field-meta">
              {messageError ? (
                <p className="field-error" id="message-error">
                  {messageError}
                </p>
              ) : (
                <span aria-hidden="true" />
              )}

              <p
                className={messageCounterClassName}
                id="message-counter"
                aria-live="polite"
              >
                {messageLength}/{CONTACT_LIMITS.messageMax}
              </p>
            </div>
          </div>

          <div className="captcha-wrap">
            <div ref={widgetRef} className="turnstile-container" />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={!canSubmit}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden />
                <span>{t("contact.sending")}</span>
              </>
            ) : (
              <span>{t("contact.send")}</span>
            )}
          </button>

          <p className="fine-print">
            Protected by Cloudflare Turnstile ·{" "}
            <a href="/datenschutz">{t("contact.privacy")}</a>
          </p>
        </form>

        {contactDetails &&
          Object.values(contactDetails).some((value) => value.trim()) && (
          <aside
            className="contact-card contact-aside"
            aria-label={t("contact.contactWays")}
          >
            <h2>{t("contact.other")}</h2>

            <ul className="link-list">
              {contactDetails.email && (
                <li>
                  <a
                    href={`mailto:${contactDetails.email}`}
                    className="link-item"
                    onClick={() =>
                      trackOutboundLinkClick(
                        "email",
                        `mailto:${contactDetails.email}`
                      )
                    }
                  >
                    <span className="ico" aria-hidden>
                      ✉
                    </span>
                    {contactDetails.email}
                  </a>
                </li>
              )}

              {contactDetails.github_url && (
                <li>
                  <a
                    href={contactDetails.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-item"
                    onClick={() =>
                      trackOutboundLinkClick(
                        "github_profile",
                        contactDetails.github_url
                      )
                    }
                  >
                    <span className="ico" aria-hidden>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                    </span>
                    {linkLabel(contactDetails.github_url)}
                  </a>
                </li>
              )}

              {contactDetails.linkedin_url && (
                <li>
                  <a
                    href={contactDetails.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-item"
                    onClick={() =>
                      trackOutboundLinkClick(
                        "linkedin_profile",
                        contactDetails.linkedin_url
                      )
                    }
                  >
                    <span className="ico" aria-hidden>
                      in
                    </span>
                    {linkLabel(contactDetails.linkedin_url)}
                  </a>
                </li>
              )}

              {contactDetails.telegram_url && (
                <li>
                  <a
                    href={contactDetails.telegram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-item"
                    onClick={() =>
                      trackOutboundLinkClick(
                        "telegram",
                        contactDetails.telegram_url
                      )
                    }
                  >
                    <span className="ico" aria-hidden>
                      ✈
                    </span>
                    {telegramLabel(contactDetails.telegram_url)}
                  </a>
                </li>
              )}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}

function messageErrorPreview(
  clientFieldErrors: FieldErrors,
  touched: TouchedFields,
  serverFieldErrors: FieldErrors
): boolean {
  return Boolean(serverFieldErrors.message || (touched.message && clientFieldErrors.message));
}
