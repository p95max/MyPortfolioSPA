import { useEffect, useMemo, useRef, useState } from "react";
import "./Contact.css";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, any>) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

type Form = {
  name: string;
  email: string;
  message: string;
  company?: string;
};

const initialForm: Form = { name: "", email: "", message: "", company: "" };

export default function Contact() {
  const [form, setForm] = useState<Form>(initialForm);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);

  const api = useMemo(() => String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""), []);
  const siteKey = useMemo(() => String(import.meta.env.VITE_TURNSTILE_SITEKEY || ""), []);

  const validEmail = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email), [form.email]);
  const valid = useMemo(
    () => form.name.trim().length >= 2 && validEmail && form.message.trim().length >= 5 && !!captcha,
    [form, validEmail, captcha]
  );

  useEffect(() => {
    if (!siteKey) return;
    const haveScript = document.querySelector('script[data-turnstile="1"]');
    const ensureRender = () => {
      if (!renderedRef.current && widgetRef.current && window.turnstile) {
        window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          "refresh-expired": "auto",
          callback: (t: string) => setCaptcha(t),
          "expired-callback": () => setCaptcha(null),
          "error-callback": () => setCaptcha(null),
          theme: "auto",
        });
        renderedRef.current = true;
      }
    };
    if (!haveScript) {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-turnstile", "1");
      s.onload = ensureRender;
      document.head.appendChild(s);
    } else {
      ensureRender();
    }
  }, [siteKey]);

  const onChange = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !api) return;
    setLoading(true);
    setErr(null);
    setOk(false);
    try {
      const res = await fetch(`${api}/contact-message/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          company: form.company?.trim() || "",
          turnstile_token: captcha,
          "cf_turnstile": captcha,
          "cf-turnstile-response": captcha,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      setOk(true);
      setForm(initialForm);
      setCaptcha(null);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Contact</h1>
        <p>Reach out. I’ll get back ASAP.</p>
      </div>

      <form className="contact-form" onSubmit={submit} noValidate>
        <div className="row">
          <label>
            <span>Name</span>
            <input
              className={!form.name ? "" : form.name.trim().length >= 2 ? "ok" : "bad"}
              type="text"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={onChange("name")}
              placeholder="Your name"
            />
          </label>
          <label>
            <span>Email</span>
            <input
              className={!form.email ? "" : validEmail ? "ok" : "bad"}
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange("email")}
              placeholder="you@example.com"
            />
          </label>
        </div>

        <label>
          <span>Company (optional)</span>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={onChange("company")}
            placeholder="Company"
          />
        </label>

        <label>
          <span>Message</span>
          <textarea
            className={!form.message ? "" : form.message.trim().length >= 5 ? "ok" : "bad"}
            name="message"
            rows={6}
            value={form.message}
            onChange={onChange("message")}
            placeholder="How can I help?"
          />
        </label>

        <div className="captcha">
          <div ref={widgetRef} />
        </div>

        <button className="submit" type="submit" disabled={!valid || loading}>
          {loading ? "Sending…" : "Send"}
        </button>

        {ok && <div className="alert ok">Message sent.</div>}
        {err && <div className="alert err">{err}</div>}
      </form>
    </div>
  );
}
