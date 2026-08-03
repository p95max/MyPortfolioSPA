import { useEffect, useMemo, useState } from "react";
import { FeaturedCredentials } from "../components/FeaturedCredentials";
import { getApiUrl } from "../apiBaseUrl";
import { useTranslation } from "../i18n";
import "./Home.css";

const DEFAULT_STACK = ["Python", "Django", "FastAPI", "PostgreSQL", "Docker", "Redis", "gRPC", "Pytest", "GitHub Actions", "Terraform", "Azure"];

type HomepageContent = {
  availability_en: string;
  availability_de: string;
  greeting_en: string;
  greeting_de: string;
  name: string;
  role_en: string;
  role_de: string;
  description_en: string;
  description_de: string;
  stack: string[];
};

function isHomepageContent(value: unknown): value is HomepageContent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const content = value as Record<string, unknown>;
  const textFields = [
    "availability_en",
    "availability_de",
    "greeting_en",
    "greeting_de",
    "name",
    "role_en",
    "role_de",
    "description_en",
    "description_de",
  ];

  return (
    textFields.every((field) => typeof content[field] === "string") &&
    Array.isArray(content.stack) &&
    content.stack.every((item) => typeof item === "string")
  );
}

export const Home = () => {
  const { language, t } = useTranslation();
  const [content, setContent] = useState<HomepageContent | null>(null);

  useEffect(() => {
    document.title = "M.Petrykin — Backend Developer";
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(getApiUrl("/api/homepage-content/"))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load homepage content (${response.status})`);
        }

        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!cancelled && isHomepageContent(data)) {
          setContent(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContent(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const localizedContent = useMemo(() => {
    if (!content) {
      return {
        availability: t("home.availability"),
        greeting: t("home.greeting"),
        name: "Maksym",
        role: t("home.role"),
        description: t("home.description"),
        stack: DEFAULT_STACK,
      };
    }

    if (language === "de") {
      return {
        availability: content.availability_de,
        greeting: content.greeting_de,
        name: content.name,
        role: content.role_de,
        description: content.description_de,
        stack: content.stack,
      };
    }

    return {
      availability: content.availability_en,
      greeting: content.greeting_en,
      name: content.name,
      role: content.role_en,
      description: content.description_en,
      stack: content.stack,
    };
  }, [content, language, t]);

  return (
    <div className="page-home">
      <div className="ph-container">
        <section className="ph-hero">
          <p className="ph-eyebrow">{localizedContent.availability}</p>
          <h1 className="ph-title"><span className="ph-title-name">{localizedContent.greeting}</span><span className="ph-title-accent">{localizedContent.name}</span></h1>
          <p className="ph-subtitle">{localizedContent.role}</p>
          <p className="ph-description">{localizedContent.description}</p>
          <div className="ph-stack">{localizedContent.stack.map((tech) => <span key={tech} className="ph-chip">{tech}</span>)}</div>
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
