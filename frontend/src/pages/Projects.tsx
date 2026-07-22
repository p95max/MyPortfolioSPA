import { useEffect, useMemo, useState } from "react";
import "./Projects.css";
import { ProjectCard } from "../components/ProjectCard";
import type { Project } from "../types";
import { testProjects } from "../data/test_data";
import { getTechBadge } from "../data/techBadges";
import { getApiUrl } from "../apiBaseUrl";
import { useTranslation } from "../i18n";

const USE_TEST_DATA = false;

const ITEMS_PER_PAGE = 5;

type ApiProjectScreenshot =
  | string
  | {
      image_url?: unknown;
    };

type ApiProject = {
  id: unknown;
  title: string;
  description: string;
  description_de?: string;
  descriptionDe?: string;
  tech_stack?: unknown;
  techStack?: unknown;
  github_url?: string;
  githubUrl?: string;
  demo_url?: string;
  demoUrl?: string;
  screenshots?: unknown;
};

function normalizeTechStack(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(/\s+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((tag) => (typeof tag === "string" ? tag.split(/\s+/) : []))
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

const ACCENT_TAGS = [
  "django",
  "fastapi",
  "openai-api",
  "full-stack-development",
  "business-process-automation",
];

function getTagAccentClass(tag: string): string {
  const normalizedTag = tag.replace(/^#/, "").toLowerCase();

  return ACCENT_TAGS.includes(normalizedTag) ? "pp-tag-btn--accent" : "";
}

function isApiProject(value: unknown): value is ApiProject {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ApiProject>;

  return (
    "id" in candidate &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string"
  );
}

function normalizeScreenshot(value: ApiProjectScreenshot): string {
  if (typeof value === "string") {
    return value;
  }

  return typeof value.image_url === "string" ? value.image_url : "";
}

function toCamelCase(project: ApiProject): Project {
  return {
    id: String(project.id),
    title: project.title,
    description: project.description,
    descriptionDe: project.description_de ?? project.descriptionDe,
    techStack: normalizeTechStack(project.tech_stack ?? project.techStack),
    githubUrl: project.github_url ?? project.githubUrl,
    demoUrl: project.demo_url ?? project.demoUrl,
    screenshots: Array.isArray(project.screenshots)
      ? project.screenshots
          .map((s: ApiProjectScreenshot) => normalizeScreenshot(s))
          .filter((u) => !!u)
      : [],
  };
}

function Projects() {
  const { language, t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    document.title = "M.Petrykin — Projects";
  }, []);

  useEffect(() => {
    if (USE_TEST_DATA) {
      setProjects(testProjects.map(toCamelCase));
      setLoading(false);
      return;
    }

    fetch(getApiUrl("/api/projects/"))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: unknown) => {
        const arr =
          typeof data === "object" && data !== null
            ? Array.isArray(data)
              ? data
              : "results" in data && Array.isArray(data.results)
                ? data.results
                : "projects" in data && Array.isArray(data.projects)
                  ? data.projects
                  : []
            : [];

        const apiProjects = arr.filter(isApiProject);

        setProjects(apiProjects.map(toCamelCase));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setPage(0);
  }, [selectedTags]);

  function toggleTag(tag: string): void {
    setSelectedTags((currentTags) => {
      if (currentTags.includes(tag)) {
        return currentTags.filter((currentTag) => currentTag !== tag);
      }

      return [...currentTags, tag];
    });
  }

  function clearSelectedTags(): void {
    setSelectedTags([]);
  }

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();

    projects.forEach((project) => {
      const uniqueProjectTags = new Set(project.techStack || []);

      uniqueProjectTags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });

    return counts;
  }, [projects]);

  const availableTags = useMemo(() => {
    return Array.from(tagCounts.entries())
      .sort(([tagA, countA], [tagB, countB]) => {
        if (countB !== countA) {
          return countB - countA;
        }

        return tagA.localeCompare(tagB);
      })
      .map(([tag]) => tag);
  }, [tagCounts]);

  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) {
      return projects;
    }

    return projects.filter((project) =>
      selectedTags.every((tag) => project.techStack?.includes(tag))
    );
  }, [projects, selectedTags]);


  if (loading) {
    return (
      <div className="page-projects">
        <p className="pp-state">{t("projects.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-projects">
        <p className="pp-state pp-state-error">Error: {error}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const current = filteredProjects.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="page-projects">
      <div className="container">
        <p className="pp-eyebrow">{t("projects.eyebrow")}</p>
        <h1 className="title">{t("projects.title")}</h1>

        {availableTags.length > 0 && (
          <details className="pp-filters">
            <summary className="pp-filters__summary">
              <span className="pp-filters__title">{t("projects.filter")}</span>

              <svg
                className="pp-filters__icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>

            <div className="pp-tags" aria-label={t("projects.filterLabel")}>
              <button
                type="button"
                className={`pp-tag-btn pp-tag-btn--all ${
                  selectedTags.length === 0 ? "active" : ""
                }`}
                onClick={clearSelectedTags}
              >
                <span>{t("projects.all")}</span>
                <span className="pp-tag-count">{projects.length}</span>
              </button>

              {selectedTags.length > 0 && (
                <button
                  type="button"
                  className="pp-tag-btn pp-tag-btn--clear"
                  onClick={clearSelectedTags}
                >
                  <span>{t("projects.clear")}</span>
                  <span className="pp-tag-count">{selectedTags.length}</span>
                </button>
              )}

              {availableTags.map((tag) => {
                const badge = getTechBadge(tag);
                const isSelected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    className={`pp-tag-btn ${
                      badge ? "pp-tag-btn--badge" : ""
                    } ${getTagAccentClass(tag)} ${isSelected ? "active" : ""}`}
                    onClick={() => toggleTag(tag)}
                    title={`Filter by ${tag}`}
                    aria-pressed={isSelected}
                  >
                    {badge ? (
                      <img
                        className="pp-tag-badge-img"
                        src={badge.src}
                        alt={badge.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span>{tag}</span>
                    )}

                    <span className="pp-tag-count">{tagCounts.get(tag) || 0}</span>
                  </button>
                );
              })}
            </div>
          </details>
        )}

        {filteredProjects.length === 0 ? (
          <div className="pp-filter-alert" role="alert">
            <strong>{t("projects.noMatches")}</strong>
            <span>{t("projects.hint")}</span>

            <button
              type="button"
              className="pp-filter-alert__btn"
              onClick={clearSelectedTags}
            >
              {t("projects.clearFilters")}
            </button>
          </div>
        ) : (
          <>
            <div className="pp-list">
              {current.map((project) => (
                <ProjectCard key={project.id} project={{
                  ...project,
                  description: language === "de" && project.descriptionDe
                    ? project.descriptionDe
                    : project.description,
                }} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pager">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`pager-btn ${i === page ? "active" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Projects;
export { Projects };
