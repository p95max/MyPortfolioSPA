import { useEffect } from "react";
import { FeaturedCredentials } from "../components/FeaturedCredentials";
import "./Home.css";

const STACK = [
  "Python", "Django", "FastAPI", "PostgreSQL",
  "Docker", "Redis", "gRPC", "Pytest",
  "GitHub Actions", "Terraform", "Azure",
];

export const Home = () => {
  useEffect(() => {
    document.title = "M.Petrykin — Backend Developer";
  }, []);

  return (
    <div className="page-home">

      <div className="ph-container">
        <section className="ph-hero">

          <p className="ph-eyebrow">Open to work · Chemnitz, DE</p>

          <h1 className="ph-title">
            <span className="ph-title-name">Hi, I&apos;m</span>
            <span className="ph-title-accent">Maksym</span>
          </h1>

          <p className="ph-subtitle">Python Backend Developer</p>

          <p className="ph-description">
            I build APIs, integrations, and automation systems.
            Django, FastAPI, PostgreSQL, Docker — clean architecture,
            production-ready code, no shortcuts.
          </p>

          {/* Tech stack */}
          <div className="ph-stack">
            {STACK.map((tech) => (
              <span key={tech} className="ph-chip">{tech}</span>
            ))}
          </div>

          {/* CTA */}
          <div className="ph-actions">

            <a className="btn btn-primary" href="/projects">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Explore Projects
            </a>

            <a className="btn btn-outline" href="/contact">
              Contact me
            </a>

          </div>

        </section>

        <FeaturedCredentials />

        {/* Divider */}
        <div className="ph-divider" />

      </div>
    </div>
  );
};
