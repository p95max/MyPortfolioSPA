import { useEffect, useMemo, useRef, useState } from "react";
import "./Contact.css";

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
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "refresh-expired"?: "auto" | "manual";
          theme?: "auto" | "light" | "dark";
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => void;
      reset?: (el?: HTMLElement) => void;
    };
  }
}

function isErrorLike(x: unknown): x is { message?: string } {
  return typeof x === "object" && x !== null && "message" in x;
}

export default function Contact() {
  const [form, setForm] = useState<Form>({ name: "", email: "", message: "", hp: "" });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    document.title = "My SPA Portfolio — Contact";
  }, []);

  const apiUrl = useMemo(() => {
    return import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/contact/`
      : "http://localhost:8000/api/contact/";
  }, []);

  const siteKey = useMemo(() => import.meta.env.VITE_TURNSTILE_SITEKEY ?? "", []);

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      scriptLoadedRef.current = true;
      if (widgetRef.current && window.turnstile && siteKey) {
        window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          "refresh-expired": "auto",
          callback: (token: string) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(null),
          "error-callback": () => setCaptchaToken(null),
          theme: "auto",
        });
      }
    };
    document.head.appendChild(s);
  }, [siteKey]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const emailOk = (v: string) => /\S+@\S+\.\S+/.test(v);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (form.hp) {
      setOk(true);
      return;
    }
    if (!form.name || !form.email || !form.message) {
      setErr("Please fill out all fields.");
      return;
    }
    if (!emailOk(form.email)) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          hp: form.hp,
          cf_turnstile_token: captchaToken,
        }),
      });
      if (!resp.ok) {
        let detail = `Failed to send message (HTTP ${resp.status})`;
        try {
          const data: unknown = await resp.json();
          if (typeof data === "object" && data && "detail" in data && typeof (data as any).detail === "string") {
            detail = (data as { detail: string }).detail;
          } else if (typeof data === "object" && data && "message" in data && typeof (data as any).message === "string") {
            detail = (data as { message: string }).message;
          }
        } catch {}
        if (resp.status === 400 && /captcha/i.test(detail)) {
          detail = "Captcha verification failed. Please try again.";
          if (window.turnstile && widgetRef.current) {
            setCaptchaToken(null);
            window.turnstile.reset?.(widgetRef.current);
          }
        }
        if (resp.status === 429) {
          detail = "Too many attempts. Please try again later.";
        }
        throw new Error(detail);
      }
      setOk(true);
    } catch (err: unknown) {
      setErr(isErrorLike(err) && typeof err.message === "string" ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(() => {
    const hasAllFields = !!form.name && !!form.message && /\S+@\S+\.\S+/.test(form.email);
    return hasAllFields && !!siteKey && !!captchaToken && !loading;
  }, [form.name, form.email, form.message, siteKey, captchaToken, loading]);

  if (ok) {
    return (
      <div className="contact-page">
        <div className="contact-success">
          <div className="success-icon" aria-hidden>✅</div>
          <h2>Thanks! Your message has been sent.</h2>
          <p>I’ll get back to you soon.</p>
          <a className="btn btn-primary" href="/">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Let’s talk</h1>
        <p>Have a project, role, or question? Drop me a message.</p>
      </section>

      <div className="contact-grid">
        <form className="contact-card" onSubmit={onSubmit} noValidate aria-describedby="form-help">
          <div className="card-header">
            <h2>Send a message</h2>
            <p id="form-help">All fields are required.</p>
          </div>

          {err && <div className="alert">{err}</div>}

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
            <div ref={widgetRef} className="cf-turnstile" />
          </div>


          <button
            className="btn btn-primary"
            type="submit"
            disabled={!canSubmit}
            aria-busy={loading}
            aria-disabled={!canSubmit}
            title={!captchaToken ? "Complete captcha to enable" : undefined}
          >
            {loading ? <span className="spinner" aria-hidden /> : <span className="send-ico" aria-hidden>✉️</span>}
            <span>{loading ? "Sending…" : "Send message"}</span>
          </button>

          <div className="fine-print">
            This site is protected by Cloudflare Turnstile.
          </div>

          <div className="fine-print">
            By sending this form, you agree that I may process your name, email address, and message
            for the purpose of replying to your request. For more details, see the{" "}
            <a href="/datenschutz">Privacy Policy</a>.
          </div>

        </form>

        <aside className="contact-card contact-aside" aria-label="Other ways to contact">
          <h2>Also reachable</h2>
          <ul className="link-list">
            <li>
              <a href="mailto:m.petrykin@gmx.de" className="link-item">
                <span className="ico" aria-hidden>📧</span>
                m.petrykin@gmx.de
              </a>
            </li>
            <li>
              <a href="https://github.com/p95max" target="_blank" rel="noreferrer" className="link-item">
                <span className="ico" aria-hidden>🐙</span>
                github.com/p95max
              </a>
            </li>
            <li>
              <a href="https://linkedin.com/in/p95max" target="_blank" rel="noreferrer" className="link-item">
                <span className="ico" aria-hidden>💼</span>
                linkedin.com/in/p95max
              </a>
            </li>
            <li>
              <a href="https://t.me/max_p95" target="_blank" rel="noreferrer" className="link-item">
                <span className="ico" aria-hidden>💬</span>
                @max_p95
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
