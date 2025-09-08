import { useEffect, useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import type { Project } from '../types';

function toCamelCase(project: any): Project {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    techStack: project.tech_stack,
    githubUrl: project.github_url,
    demoUrl: project.demo_url,
  };
}

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/projects/')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: any[]) => {
        const projects = data.map(toCamelCase);
        setProjects(projects);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p>Error loading projects: {error}</p>;

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
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