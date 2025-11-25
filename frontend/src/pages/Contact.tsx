import { useEffect, useMemo, useState } from "react";
import "./Contact.css";

type Form = {
  name: string;
  email: string;
  message: string;
  company?: string;
};

export default function Contact() {
  const [form, setForm] = useState<Form>({ name: "", email: "", message: "", company: "" });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    document.title = "My SPA Portfolio — Contact";
  }, []);

  const apiUrl = useMemo(
    () =>
      (import.meta as any).env?.VITE_API_URL
        ? `${(import.meta as any).env.VITE_API_URL}/api/contact/`
        : "http://localhost:8000/api/contact/",
    []
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const emailOk = (v: string) => /\S+@\S+\.\S+/.test(v);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (form.company) return;
    if (!form.name || !form.email || !form.message) {
      setErr("Please fill out all fields.");
      return;
    }
    if (!emailOk(form.email)) {
      setErr("Please provide a valid email.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
      });
      if (!resp.ok) {
        let detail = "Failed to send message";
        try {
          const data = await resp.json();
          detail = data?.message || detail;
        } catch {
          /* ignore */
        }
        throw new Error(detail);
      }
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
            name="company"
            autoComplete="off"
            tabIndex={-1}
            value={form.company}
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

          <button className="btn btn-primary" type="submit" disabled={loading} aria-busy={loading}>
            {loading ? (
              <span className="spinner" aria-hidden />
            ) : (
              <span className="send-ico" aria-hidden>✉️</span>
            )}
            <span>{loading ? "Sending…" : "Send message"}</span>
          </button>

          <div className="fine-print">
            By sending, you agree that I may contact you at the provided email.
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
