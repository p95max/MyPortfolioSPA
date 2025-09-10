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

const USE_TEST_DATA = false; // switcher local=true/backend=false

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
      fetch('http://localhost:8000/api/projects/')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: any) => {
          console.log('API response:', data);
          const projectsArray = Array.isArray(data) ? data : data.projects || [];
          const projects = projectsArray.map(toCamelCase);
          console.log('Mapped projects:', projects);
          setProjects(projects);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
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
          {projects.map(project => {
            console.log('Rendering project:', project);
            return (
              <div key={project.id} style={{ marginBottom: 20 }}>
                <ProjectCard project={project} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};