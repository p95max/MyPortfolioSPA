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
        <section className="hero-card">
          <div className="hero-content">
            <h1 className="hero-title">
              Hi, I&apos;m <span className="hero-title-accent">Maksym</span>
            </h1>

            <p className="hero-subtitle">
              A pragmatic{" "}
              <span className="hero-subtitle-accent">Python Backend Developer</span>{" "}
              building reliable APIs, integrations and automation workflows.
            </p>

            <p className="hero-description">
              I work with Python, Django, FastAPI, PostgreSQL and Docker.
              My focus is clean architecture, maintainable code and backend systems
              that solve real business tasks.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="/projects">
                View Projects
              </a>
              <a className="btn btn-outline" href="/contact">
                Contact Me
              </a>
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="controls">
            <div className="lang-switcher">
              <button
                className={`btn btn-toggle ${lang === "DE" ? "active" : ""}`}
                aria-pressed={lang === "DE"}
                onClick={() => setLang("DE")}
              >
                Deutsch
              </button>
              <button
                className={`btn btn-toggle ${lang === "EN" ? "active" : ""}`}
                aria-pressed={lang === "EN"}
                onClick={() => setLang("EN")}
              >
                English
              </button>
            </div>

            <div className="resume-actions">
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

          <div className="markdown">
            <ReactMarkdown>{aboutText}</ReactMarkdown>
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
        </section>
      </div>
    </div>
  );
};