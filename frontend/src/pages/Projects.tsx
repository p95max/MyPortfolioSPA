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
    demoUrl: project.demo_url,
  };
}


const USE_TEST_DATA = false;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_TEST_DATA) {
      console.log('Using test projects:', testProjects);
      setProjects(testProjects);
      setLoading(false);
    } else {
      fetch(`${API_URL}/api/projects/`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: any) => {
          console.log('API response:', data);
          const projectsArray = Array.isArray(data) ? data : data.results || data.projects || [];
          const projects = projectsArray.map(toCamelCase);
          setProjects(projects);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading projects:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, []);


  if (loading) {
  return (
    <p style={{ textAlign: 'center', marginTop: '2rem', lineHeight: 1.6 }}>
      ⚠️ This portfolio is hosted on <b>Render</b> using the <b>free tier</b>.<br />
      The backend may take some time to "wake up" and might not show projects immediately.<br />
      ⏳ Please wait 1–2 minutes and refresh the page.
    </p>
  );
}
  if (error) return <p>Error loading projects: {error}</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>Projects</h1>
      {projects.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No projects found.</p>
      ) : (
        <div style={{ display: 'block' }}>
          {projects.map(project => (
            <div key={project.id} style={{ marginBottom: 20 }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};