import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./Contact.css";
import { trackAnalyticsEvent } from "../analytics";

type Form = {
  name: string;
  email: string;
  message: string;
  hp?: string;
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

      // Fallback: if the script was already appended and loaded before listeners.
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

export default function Contact() {
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

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    document.title = "M.Petrykin — Contact";
  }, []);

  const apiUrl = useMemo(() => {
    const baseUrl = import.meta.env.VITE_API_URL;

    return baseUrl
      ? `${baseUrl}/api/contact/`
      : "http://localhost:8000/api/contact/";
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
        setErr("Captcha failed to load. Please refresh the page.");
      });

    return () => {
      cancelled = true;

      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((currentForm) => ({
      ...currentForm,
      [e.target.name]: e.target.value,
    }));
  };

  const resetCaptcha = () => {
    setCaptchaToken(null);

    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset?.(widgetIdRef.current);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setErr(null);

    // Honeypot: bots may fill this hidden field.
    if (form.hp) {
      trackAnalyticsEvent("contact_submit", window.location.pathname);
      setOk(true);
      return;
    }

    if (!form.name || !form.email || !form.message) {
      setErr("Please fill out all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setErr("Please provide a valid email.");
      return;
    }

    if (!siteKey) {
      setErr("Captcha is not configured.");
      return;
    }

    if (!captchaToken) {
      setErr("Please complete the captcha.");
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
          ...form,
          cf_turnstile_token: captchaToken,
        }),
      });

      if (!resp.ok) {
        let detail = `Failed to send message (HTTP ${resp.status})`;

        try {
          const data: unknown = await resp.json();

          if (
            typeof data === "object" &&
            data !== null &&
            "detail" in data &&
            typeof data.detail === "string"
          ) {
            detail = data.detail;
          } else if (
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
          ) {
            detail = data.message;
          }
        } catch {
          // Backend returned non-JSON response.
        }

        if (resp.status === 400 && /captcha/i.test(detail)) {
          resetCaptcha();
          detail = "Captcha verification failed. Please try again.";
        }

        if (resp.status === 429) {
          detail = "Too many attempts. Please try again later.";
        }

        throw new Error(detail);
      }
      trackAnalyticsEvent("contact_submit", window.location.pathname);
      setOk(true);
    } catch (error: unknown) {
      setErr(
        isErrorLike(error) && typeof error.message === "string"
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(() => {
    return (
      !!form.name &&
      !!form.message &&
      /\S+@\S+\.\S+/.test(form.email) &&
      !!siteKey &&
      !!captchaToken &&
      !loading
    );
  }, [form.name, form.email, form.message, siteKey, captchaToken, loading]);

  if (ok) {
    return (
      <div className="contact-page">
        <div className="contact-success">
          <div className="success-icon" aria-hidden>
            ✅
          </div>
          <h2>Message sent.</h2>
          <p>I'll get back to you soon.</p>
          <a className="btn btn-primary" href="/">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <p className="cp-eyebrow">Get in touch</p>
        <h1>Let's talk</h1>
        <p>Have a project, role, or question? Drop me a message.</p>
      </section>

      <div className="contact-grid">
        <form
          className="contact-card"
          onSubmit={onSubmit}
          noValidate
          aria-describedby="form-help"
        >
          <div className="card-header">
            <h2>Send a message</h2>
            <p id="form-help">All fields are required.</p>
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
              className="input"
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder=" "
              aria-label="Your name"
            />
            <label className="label">Your name</label>
          </div>

          <div className="field">
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              placeholder=" "
              aria-label="Email address"
            />
            <label className="label">Email address</label>
          </div>

          <div className="field">
            <textarea
              className="input textarea"
              name="message"
              rows={6}
              value={form.message}
              onChange={onChange}
              required
              placeholder=" "
              aria-label="Message"
            />
            <label className="label">Message</label>
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
                <span>Sending…</span>
              </>
            ) : (
              <span>Send message</span>
            )}
          </button>

          <p className="fine-print">
            Protected by Cloudflare Turnstile ·{" "}
            <a href="/datenschutz">Privacy Policy</a>
          </p>
        </form>

        <aside
          className="contact-card contact-aside"
          aria-label="Other ways to contact"
        >
          <h2>Also reachable</h2>

          <ul className="link-list">
            <li>
              <a href="mailto:m.petrykin@gmx.de" className="link-item">
                <span className="ico" aria-hidden>
                  ✉
                </span>
                m.petrykin@gmx.de
              </a>
            </li>

            <li>
              <a
                href="https://github.com/p95max"
                target="_blank"
                rel="noreferrer"
                className="link-item"
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
                github.com/p95max
              </a>
            </li>

            <li>
              <a
                href="https://linkedin.com/in/p95max"
                target="_blank"
                rel="noreferrer"
                className="link-item"
              >
                <span className="ico" aria-hidden>
                  in
                </span>
                linkedin.com/in/p95max
              </a>
            </li>

            <li>
              <a
                href="https://t.me/max_p95"
                target="_blank"
                rel="noreferrer"
                className="link-item"
              >
                <span className="ico" aria-hidden>
                  ✈
                </span>
                @max_p95
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}