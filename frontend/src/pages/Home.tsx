import { useEffect } from "react";
import "./Home.css";

export const Home = () => {
  useEffect(() => {
    document.title = "My SPA Portfolio - Home";
  }, []);

  return (
    <div className="page-home">
      <div className="container">
        <section className="hero-card">
          <div className="hero-content">
            <h1 className="hero-title">
              Hi, I&apos;m <span className="hero-title-accent">Maksym</span>
            </h1>

            <p className="hero-subtitle">
              <span className="hero-subtitle-accent">Python Backend Developer</span>{" "}
              — APIs, integrations, automation.
            </p>

            <p className="hero-description">
              Django, FastAPI, PostgreSQL, Docker.
              Clean architecture. Production-ready systems.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="/projects">
                View Projects
              </a>
              <a className="btn btn-primary" href="/contact">
                Contact Me
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};