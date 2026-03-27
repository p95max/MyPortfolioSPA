import { useEffect, useMemo, useRef, useState } from "react";
import "./Contact.css";

type Form = { name: string; email: string; message: string; hp?: string; };

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: {
        sitekey: string;
        callback?: (token: string) => void;
        "refresh-expired"?: "auto" | "manual";
        theme?: "auto" | "light" | "dark";
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
      }) => void;
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

  useEffect(() => { document.title = "Maksym Petrykin — Contact"; }, []);

  const apiUrl = useMemo(() =>
    import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/contact/`
      : "http://localhost:8000/api/contact/",
  []);

  const siteKey = useMemo(() => import.meta.env.VITE_TURNSTILE_SITEKEY ?? "", []);

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true; s.defer = true;
    s.onload = () => {
      scriptLoadedRef.current = true;
      if (widgetRef.current && window.turnstile && siteKey) {
        window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          "refresh-expired": "auto",
          callback: (token) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(null),
          "error-callback": () => setCaptchaToken(null),
          theme: "dark",
        });
      }
    };
    document.head.appendChild(s);
  }, [siteKey]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (form.hp) { setOk(true); return; }
    if (!form.name || !form.email || !form.message) { setErr("Please fill out all fields."); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setErr("Please provide a valid email."); return; }
    if (!siteKey) { setErr("Captcha is not configured."); return; }
    if (!captchaToken) { setErr("Please complete the captcha."); return; }
    setLoading(true);
    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cf_turnstile_token: captchaToken }),
      });
      if (!resp.ok) {
        let detail = `Failed to send message (HTTP ${resp.status})`;
        try {
          const data: any = await resp.json();
          if (typeof data?.detail === "string") detail = data.detail;
          else if (typeof data?.message === "string") detail = data.message;
        } catch {}
        if (resp.status === 400 && /captcha/i.test(detail)) {
          detail = "Captcha verification failed. Please try again.";
          if (window.turnstile && widgetRef.current) { setCaptchaToken(null); window.turnstile.reset?.(widgetRef.current); }
        }
        if (resp.status === 429) detail = "Too many attempts. Please try again later.";
        throw new Error(detail);
      }
      setOk(true);
    } catch (err: unknown) {
      setErr(isErrorLike(err) && typeof err.message === "string" ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(() =>
    !!form.name && !!form.message && /\S+@\S+\.\S+/.test(form.email) && !!siteKey && !!captchaToken && !loading,
  [form.name, form.email, form.message, siteKey, captchaToken, loading]);

  if (ok) {
    return (
      <div className="contact-page">
        <div className="contact-success">
          <div className="success-icon" aria-hidden>✅</div>
          <h2>Message sent.</h2>
          <p>I'll get back to you soon.</p>
          <a className="btn btn-primary" href="/">Back to Home</a>
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
        {/* Form */}
        <form className="contact-card" onSubmit={onSubmit} noValidate aria-describedby="form-help">
          <div className="card-header">
            <h2>Send a message</h2>
            <p id="form-help">All fields are required.</p>
          </div>

          {err && <div className="alert" role="alert">{err}</div>}

          <input className="hp" type="text" name="hp" autoComplete="off" tabIndex={-1} value={form.hp} onChange={onChange} aria-hidden="true" />

          <div className="field">
            <input className="input" name="name" value={form.name} onChange={onChange} required placeholder=" " aria-label="Your name" />
            <label className="label">Your name</label>
          </div>

          <div className="field">
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} required placeholder=" " aria-label="Email address" />
            <label className="label">Email address</label>
          </div>

          <div className="field">
            <textarea className="input textarea" name="message" rows={6} value={form.message} onChange={onChange} required placeholder=" " aria-label="Message" />
            <label className="label">Message</label>
          </div>

          <div className="captcha-wrap">
            <div ref={widgetRef} className="cf-turnstile" />
          </div>

          <button className="btn btn-primary" type="submit" disabled={!canSubmit} aria-busy={loading}>
            {loading
              ? <><span className="spinner" aria-hidden /><span>Sending…</span></>
              : <span>Send message</span>
            }
          </button>

          <p className="fine-print">
            Protected by Cloudflare Turnstile · <a href="/datenschutz">Privacy Policy</a>
          </p>
        </form>

        {/* Aside */}
        <aside className="contact-card contact-aside" aria-label="Other ways to contact">
          <h2>Also reachable</h2>
          <ul className="link-list">
            <li>
              <a href="mailto:m.petrykin@gmx.de" className="link-item">
                <span className="ico" aria-hidden>✉</span>
                m.petrykin@gmx.de
              </a>
            </li>
            <li>
              <a href="https://github.com/p95max" target="_blank" rel="noreferrer" className="link-item">
                <span className="ico" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </span>
                github.com/p95max
              </a>
            </li>
            <li>
              <a href="https://linkedin.com/in/p95max" target="_blank" rel="noreferrer" className="link-item">
                <span className="ico" aria-hidden>in</span>
                linkedin.com/in/p95max
              </a>
            </li>
            <li>
              <a href="https://t.me/max_p95" target="_blank" rel="noreferrer" className="link-item">
                <span className="ico" aria-hidden>✈</span>
                @max_p95
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}