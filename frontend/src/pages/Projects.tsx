import { useEffect, useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import type { Project } from '../types';
import { testProjects } from '../data/test_data';

const PLACEHOLDER_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
     <rect width="100%" height="100%" fill="#efefef"/>
     <text x="50%" y="50%" font-size="20" fill="#666" text-anchor="middle" dominant-baseline="middle">No screenshot</text>
   </svg>`
);

function normalizeScreenshot(s: any): string {
  if (!s) return PLACEHOLDER_SVG;

  if (typeof s === 'object') {
    const maybe = s.image_url || s.url || s.path || '';
    return normalizeScreenshot(maybe);
  }

  const str = String(s).trim();

  if (/^https?:\/\//i.test(str) || /^\/\//.test(str)) return str;

  if (str.startsWith('/')) return str;
  if (/screenshots\//i.test(str)) {
    return str.startsWith('/') ? str : `/${str}`;
  }

  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(str)) {
    return `/${str.replace(/^\/+/, '')}`;
  }

  const safeName = str.replace(/\s+/g, '_');
  const hasExt = /\.[a-z0-9]{2,4}$/i.test(safeName);
  return `/screenshots/${hasExt ? safeName : `${safeName}.png`}`;
}

function toCamelCase(project: any): Project {
  return {
    id: String(project.id),
    title: project.title,
    description: project.description,
    techStack: typeof project.tech_stack === 'string'
      ? project.tech_stack.split(' ').filter((t: string) => t.trim() !== '')
      : project.tech_stack || [],
    githubUrl: project.github_url,
    demoUrl: project.demo_url,
    screenshots: Array.isArray(project.screenshots)
      ? project.screenshots
          .map((s: any) => normalizeScreenshot(s))
          .filter((u: string) => !!u)
      : [],
  };
}


const USE_TEST_DATA = false;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ITEMS_PER_PAGE = 5;

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


  if (loading) return <p style={{ textAlign: "center" }}>Loading projects...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>Error: {error}</p>;


  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = page * ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>My Projects</h1>

      {projects.length === 0 ? (
        <p style={{ textAlign: "center" }}>No projects found.</p>
      ) : (
        <>
          <div>
            {currentProjects.map(project => (
              <div key={project.id} style={{ marginBottom: 20 }}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "8px" }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1px solid #ccc",
                  background: i === page ? "#646cff" : "#fff",
                  color: i === page ? "#fff" : "#333",
                  cursor: "pointer",
                  fontWeight: i === page ? "bold" : "normal",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};