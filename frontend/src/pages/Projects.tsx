import { useEffect, useState } from "react";
import "./Projects.css";
import { ProjectCard } from "../components/ProjectCard";
import type { Project } from "../types";
import { testProjects } from "../data/test_data";

function toCamelCase(project: any): Project {
  return {
    id: String(project.id),
    title: project.title,
    description: project.description,
    techStack:
      typeof project.tech_stack === "string"
        ? project.tech_stack.split(" ").filter((t: string) => t.trim() !== "")
        : project.tech_stack || [],
    githubUrl: project.github_url,
    demoUrl: project.demo_url,
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

  useEffect(() => {
    document.title = "Maksym Petrykin — Projects";
  }, []);

  useEffect(() => {
    if (USE_TEST_DATA) {
      setProjects(testProjects);
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

  if (loading) return <div className="page-projects"><p className="pp-state">Loading projects...</p></div>;
  if (error)   return <div className="page-projects"><p className="pp-state pp-state-error">Error: {error}</p></div>;

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const current = projects.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="page-projects">
      <div className="container">
        <p className="pp-eyebrow">Portfolio</p>
        <h1 className="title">Projects</h1>

        {projects.length === 0 ? (
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