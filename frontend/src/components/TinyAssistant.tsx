import React, { useEffect, useRef, useState } from "react";
import "./tiny-assistant.css";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  ts: number;
};

const MAX_QUESTIONS_PER_SESSION = 4;
const STORAGE_KEY = "tiny_assistant_session";

const TEMPLATES: { q: string; a: string }[] = [
  { q: "What technologies do you use?", a: "Backend: Django + DRF. Frontend: React + Vite. Database: PostgreSQL. Containerization: Docker Compose. Tests: pytest." },
  { q: "Where is the source code?", a: "All repos are on GitHub: https://github.com/p95max — check README for run instructions and Docker Compose." },
  { q: "How can I contact you?", a: "Email: m.petrykin@gmx.de. Telegram: @max_p95. There's also a contact form on the Contact page." },
  { q: "Are you open for work?", a: "Yes — I'm open for backend Python/Django roles. Prefer remote or hybrid within Germany." },
  { q: "Where can I see demos?", a: "Open 'Projects' — each project has screenshots and links to GitHub." },
];

function uid(prefix = "") { return prefix + Math.random().toString(36).slice(2, 9); }
const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
const tokenize = (s: string) => normalize(s).split(" ").filter(Boolean);
const tokenOverlapRatio = (a: string[], b: string[]) => {
  if (!a.length || !b.length) return 0;
  const aset = new Set(a), bset = new Set(b);
  let common = 0;
  for (const t of aset) if (bset.has(t)) common++;
  return common / Math.min(aset.size, bset.size);
};

const TinyAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: uid("sys_"),
    role: "system",
    text: "Hi — quick answers about the portfolio. Ask a question or pick a template.",
    ts: Date.now()
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [askedCount, setAskedCount] = useState<number>(() => {
    const s = sessionStorage.getItem(STORAGE_KEY);
    return s ? Number(s) : 0;
  });
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const typingIntervalRef = useRef<number | null>(null);

  useEffect(() => sessionStorage.setItem(STORAGE_KEY, String(askedCount)), [askedCount]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) { window.clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; }
    };
  }, []);

  const canAsk = askedCount < MAX_QUESTIONS_PER_SESSION;
  const pushMessage = (m: Message) => setMessages(s => [...s, m]);

  const simulateTypingReply = (fullText: string) => {
    setTyping(true);
    const id = uid("a_");
    pushMessage({ id, role: "assistant", text: "", ts: Date.now() });

    if (typingIntervalRef.current) { window.clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; }
    const speed = 16 + Math.floor(Math.random() * 36);
    let i = 0;
    typingIntervalRef.current = window.setInterval(() => {
      i += 1;
      setMessages(cur => cur.map(m => m.id === id ? { ...m, text: fullText.slice(0, i) } : m));
      if (i >= fullText.length) {
        if (typingIntervalRef.current) { window.clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; }
        setTyping(false);
      }
    }, speed);
  };

  const answerFromTemplates = (text: string) => {
    const raw = text.trim();
    const norm = normalize(raw);
    const exact = TEMPLATES.find(t => normalize(t.q) === norm);
    if (exact) { simulateTypingReply(exact.a); return; }

    const contains = TEMPLATES.find(t => normalize(t.q).includes(norm) || norm.includes(normalize(t.q)));
    if (contains) { simulateTypingReply(contains.a); return; }

    const userTokens = tokenize(raw);
    let best: { t: { q: string; a: string }; score: number } | null = null;
    for (const t of TEMPLATES) {
      const tplTokens = tokenize(t.q);
      const score = tokenOverlapRatio(userTokens, tplTokens);
      if (!best || score > best.score) best = { t, score };
    }
    if (best && best.score >= 0.45) { simulateTypingReply(best.t.a); return; }

    if (norm.includes("open") && norm.includes("work")) {
      simulateTypingReply("Yes — I'm open for backend Python/Django roles. Prefer remote or hybrid within Germany."); return;
    }
    if (norm.includes("github") || norm.includes("repo") || norm.includes("source")) {
      simulateTypingReply("Repository links are on GitHub — see the Projects section and README."); return;
    }
    if (norm.includes("contact") || norm.includes("email") || norm.includes("telegram")) {
      simulateTypingReply("Email: m.petrykin@gmx.de. Telegram: @max_p95."); return;
    }
    if (norm.includes("tech") || norm.includes("stack") || norm.includes("technology")) {
      simulateTypingReply("Tech stack: Django, DRF, React+Vite, PostgreSQL, Docker."); return;
    }

    simulateTypingReply("Sorry — no exact answer found. Try a template below or rephrase the question.");
  };

  const sendUser = (text: string) => {
    if (!text.trim()) return;
    if (!canAsk) {
      pushMessage({ id: uid("sys_"), role: "assistant", text: `Question limit reached (${MAX_QUESTIONS_PER_SESSION}). Press "Reset" to start a new session.`, ts: Date.now() });
      return;
    }
    const userMsg = { id: uid("u_"), role: "user", text: text.trim(), ts: Date.now() };
    pushMessage(userMsg);
    setAskedCount(c => c + 1);
    setInput("");
    answerFromTemplates(text.trim());
  };

  const onTemplateClick = (t: { q: string; a: string }) => sendUser(t.q);

  const resetSession = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAskedCount(0);
    setMessages([{
      id: uid("sys_"),
      role: "system",
      text: "Session reset. Ask a question or pick a template.",
      ts: Date.now()
    }]);
    setInput("");
  };

  return (
    <div className={`tiny-widget ${open ? "open" : ""}`} aria-live="polite">
      <button
        className="tiny-toggle"
        aria-expanded={open}
        aria-label={open ? "Close assistant" : "Open assistant"}
        onClick={() => setOpen(v => !v)}
        title="Tiny — quick answers"
      >
        <span className="tiny-logo">Help</span>
        <span className="tiny-bubble-notice">{askedCount}</span>
      </button>

      <div className="tiny-panel" role="dialog" aria-hidden={!open}>
        <div className="tiny-header">
          <div>
            <strong>Helper</strong>
            <div className="tiny-sub">DEMO AI Assistant</div>
          </div>

          <div className="tiny-controls">
            <div className="tiny-limit">{askedCount}/{MAX_QUESTIONS_PER_SESSION}</div>
            <button className="tiny-reset" onClick={resetSession} title="Reset session">Reset</button>
            <button className="tiny-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="tiny-body" ref={messagesRef}>
          {messages.map(m => (
            <div key={m.id} className={`tiny-msg ${m.role}`}>
              <div className="tiny-bubble">
                <div className="tiny-text">{m.text}</div>
                <div className="tiny-ts">{new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="tiny-msg assistant typing" aria-hidden>
              <div className="tiny-bubble">
                <div className="dot-typing"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}
        </div>

        <div className="tiny-quick-templates" aria-hidden={!open}>
          {TEMPLATES.slice(0, 4).map(t => (
            <button key={t.q} className="tpl-btn" onClick={() => onTemplateClick(t)} disabled={!canAsk}>
              {t.q}
            </button>
          ))}
        </div>

        <form className="tiny-form" onSubmit={(e) => { e.preventDefault(); sendUser(input); }}>
          <input
            placeholder={canAsk ? "Type your question..." : "Question limit reached — Reset to start new session"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!canAsk || typing}
            aria-label="Chat input"
            autoComplete="off"
          />
          <button type="submit" disabled={!canAsk || typing || input.trim() === ""}>→</button>
        </form>
      </div>
    </div>
  );
};

export default TinyAssistant;
