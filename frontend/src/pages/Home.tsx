import { useEffect } from "react";
import { FeaturedCredentials } from "../components/FeaturedCredentials";
import { useTranslation } from "../i18n";
import "./Home.css";

const STACK = ["Python", "Django", "FastAPI", "PostgreSQL", "Docker", "Redis", "gRPC", "Pytest", "GitHub Actions", "Terraform", "Azure"];

export const Home = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "M.Petrykin — Backend Developer";
  }, []);

  return (
    <div className="page-home">
      <div className="ph-container">
        <section className="ph-hero">
          <p className="ph-eyebrow">{t("home.availability")}</p>
          <h1 className="ph-title"><span className="ph-title-name">{t("home.greeting")}</span><span className="ph-title-accent">Maksym</span></h1>
          <p className="ph-subtitle">{t("home.role")}</p>
          <p className="ph-description">{t("home.description")}</p>
          <div className="ph-stack">{STACK.map((tech) => <span key={tech} className="ph-chip">{tech}</span>)}</div>
          <div className="ph-actions">
            <a className="btn btn-primary" href="/projects">{t("home.projects")}</a>
            <a className="btn btn-outline" href="/contact">{t("home.contact")}</a>
          </div>
        </section>
        <FeaturedCredentials />
        <div className="ph-divider" />
      </div>
    </div>
  );
};
