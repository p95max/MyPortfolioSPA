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
           .map((s: any) => (typeof s === 'string' ? s : (s.image_url || '')))
           .filter((u: string) => !!u)
           .map((u: string) => u)
       : [],
  };
}


const USE_TEST_DATA = false;

const API_URL = import.meta.env.VITE_API_URL === undefined
  ? 'http://localhost:8000'
  : import.meta.env.VITE_API_URL;

const ITEMS_PER_PAGE = 5;

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    document.title = "My SPA Portfolio — Projects";
  }, []);

  useEffect(() => {
    if (USE_TEST_DATA) {
      setProjects(testProjects);
      setLoading(false);
    } else {
      fetch(`${API_URL}/api/projects/`)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
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
    }
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading projects...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>Error: {error}</p>;

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = page * ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="page-projects">
      <div className="container">
        <h1 className="title">My Projects</h1>

        {projects.length === 0 ? (
          <p style={{ textAlign: "center", color: "#dbeafe" }}>No projects found.</p>
        ) : (
          <>
            <div>
              {currentProjects.map((project) => (
                <div key={project.id} style={{ marginBottom: 28 }}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}

export default Projects;
export { Projects };
