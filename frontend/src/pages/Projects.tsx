import { useEffect, useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import type { Project } from '../types';
import { testProjects } from '../data/test_data';

function toCamelCase(project: any): Project {
  return {
    id: String(project.id),
    title: project.title,
    description: project.description,
    techStack: typeof project.tech_stack === 'string'
      ? project.tech_stack.split(' ').filter((t: string) => t.trim() !== '')
      : project.tech_stack || [],
    githubUrl: project.github_url,
    // demoUrl: project.demo_url,
  };
}

const USE_TEST_DATA = false;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ITEMS_PER_PAGE = 3;

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (USE_TEST_DATA) {
      setProjects(testProjects);
      setLoading(false);
    } else {
      fetch(`${API_URL}/api/projects/`)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then((data: any) => {
          const projectsArray = Array.isArray(data) ? data : data.results || data.projects || [];
          const projects = projectsArray.map(toCamelCase);
          setProjects(projects);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <div
          style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }}
        />
        <p style={{ marginTop: "1rem", color: "#555" }}>Loading projects...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "3rem auto",
          padding: "1.5rem",
          borderRadius: "8px",
          backgroundColor: "#ffe5e5",
          border: "1px solid #ff4d4f",
          color: "#a8071a",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>❌</div>
        <h2>Error loading projects</h2>
        <p>{error}</p>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#595959" }}>
          Please try refreshing the page.
        </p>
      </div>
    );
  }


  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = page * ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const prevPage = () => setPage(p => Math.max(p - 1, 0));
  const nextPage = () => setPage(p => Math.min(p + 1, totalPages - 1));

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>My Projects</h1>

      {projects.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No projects found.</p>
      ) : (
        <>
          <div style={{ display: 'block' }}>
            {currentProjects.map(project => (
              <div key={project.id} style={{ marginBottom: 20 }}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1.5rem", gap: "2rem" }}>
            <button
              onClick={prevPage}
              disabled={page === 0}
              style={{
                fontSize: "2rem",
                background: "none",
                border: "none",
                cursor: page === 0 ? "not-allowed" : "pointer",
                opacity: page === 0 ? 0.3 : 1,
              }}
            >
              ⬅
            </button>

            <span style={{ fontSize: "1rem", color: "#555" }}>
              Page {page + 1} of {totalPages}
            </span>

            <button
              onClick={nextPage}
              disabled={page === totalPages - 1}
              style={{
                fontSize: "2rem",
                background: "none",
                border: "none",
                cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                opacity: page === totalPages - 1 ? 0.3 : 1,
              }}
            >
              ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
};