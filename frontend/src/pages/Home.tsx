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