import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./Home.css";
import aboutText from "../components/aboutText";

type Lang = "DE" | "EN";

export const Home = () => {
  const [lang, setLang] = useState<Lang>("EN");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    document.title = "My SPA Portfolio - Home";
  }, []);

  const resumeHref = lang === "DE" ? "/resumeDE.pdf" : "/resumeENG.pdf";
  const resumeDL = lang === "DE" ? "Resume_DE.pdf" : "Resume_EN.pdf";

  const downloadFile = (href: string, filename: string) => {
    setIsDownloading(true);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => setIsDownloading(false), 800);
  };

  return (
    <div className="page-home">
      <div className="container">
        <div className="card">
              <h1 className="header">Hi — I’m Maksym. I build backend systems that automate real work.</h1>
              <p className="subheader">
                Python backend developer specializing in APIs, integrations and data workflows.
                Stack: Python, Django, FastAPI, PostgreSQL, Docker.
                I focus on clean architecture, reliable APIs and pragmatic engineering.
              </p>

          <div>
            <div className="markdown">
              <ReactMarkdown>{aboutText}</ReactMarkdown>
            </div>

            <div className="controls">
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-toggle"
                  aria-pressed={lang === "DE"}
                  onClick={() => setLang("DE")}
                >
                  Deutsch
                </button>
                <button
                  className="btn btn-toggle"
                  aria-pressed={lang === "EN"}
                  onClick={() => setLang("EN")}
                >
                  English
                </button>
              </div>

              <div className="ml-auto" style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-download"
                  onClick={() => downloadFile(resumeHref, resumeDL)}
                  disabled={isDownloading}
                >
                  {isDownloading ? "Downloading..." : "Download Resume"}
                </button>
                <a
                  className="btn btn-outline"
                  href={resumeHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  View PDF
                </a>
              </div>
            </div>

            <div className="iframe-wrap">
              <iframe
                className="home-iframe"
                src={`${resumeHref}#toolbar=1&navpanes=0&view=fitH`}
                width="100%"
                height={560}
                title={`Resume ${lang}`}
                style={{ display: "block", border: 0 }}
              />
            </div>
          </div>

          <div className="links">
            <a className="link-accent" href="/projects">
              See projects →
            </a>
            <a className="link-muted" href="/contact">
              Contact me
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
