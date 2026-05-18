import { useEffect, useMemo, useState } from "react";
import "./Projects.css";
import { ProjectCard } from "../components/ProjectCard";
import type { Project } from "../types";
import { testProjects } from "../data/test_data";
import { getTechBadge } from "../data/techBadges";

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

function toCamelCase(project: any): Project {
  return {
    id: String(project.id),
    title: project.title,
    description: project.description,
    techStack: normalizeTechStack(project.tech_stack ?? project.techStack),
    githubUrl: project.github_url ?? project.githubUrl,
    demoUrl: project.demo_url ?? project.demoUrl,
    screenshots: Array.isArray(project.screenshots)
      ? project.screenshots
          .map((s: any) => (typeof s === "string" ? s : s.image_url || ""))
          .filter((u: string) => !!u)
      : [],
  };
}

const USE_TEST_DATA = false;

const API_URL =
  import.meta.env.VITE_API_URL === undefined
    ? "http://localhost:8000"
    : import.meta.env.VITE_API_URL;

const ITEMS_PER_PAGE = 5;

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string>("");

  useEffect(() => {
    document.title = "M.Petrykin — Projects";
  }, []);

  useEffect(() => {
    if (USE_TEST_DATA) {
      setProjects(testProjects.map(toCamelCase));
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/projects/`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : data.results || data.projects || [];
        setProjects(arr.map(toCamelCase));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setPage(0);
  }, [selectedTag]);

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
    if (!selectedTag) return projects;
    return projects.filter((project) => project.techStack?.includes(selectedTag));
  }, [projects, selectedTag]);

  if (loading) {
    return (
      <div className="page-projects">
        <p className="pp-state">Loading projects...</p>
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
        <p className="pp-eyebrow">Portfolio</p>
        <h1 className="title">Projects</h1>

        {availableTags.length > 0 && (
          <div className="pp-tags" aria-label="Filter projects by technology tag">
            <button
              type="button"
              className={`pp-tag-btn pp-tag-btn--all ${
                selectedTag === "" ? "active" : ""
              }`}
              onClick={() => setSelectedTag("")}
            >
              <span>All</span>
              <span className="pp-tag-count">{projects.length}</span>
            </button>

            {availableTags.map((tag) => {
              const badge = getTechBadge(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  className={`pp-tag-btn ${badge ? "pp-tag-btn--badge" : ""} ${getTagAccentClass(
                    tag
                  )} ${selectedTag === tag ? "active" : ""}`}
                  onClick={() => setSelectedTag(tag)}
                  title={`Filter by ${tag}`}
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
        )}

        {filteredProjects.length === 0 ? (
          <p className="pp-state">No projects found.</p>
        ) : (
          <>
            <div className="pp-list">
              {current.map((project) => (
                <ProjectCard key={project.id} project={project} />
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