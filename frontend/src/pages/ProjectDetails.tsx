import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const project = projects.find(p => p.id === id);

  if (!project) return <p>Project not found</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      <p><strong>Tech stack:</strong> {project.techStack.join(', ')}</p>
      {project.githubUrl && <p><a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub</a></p>}
      {project.demoUrl && <p><a href={project.demoUrl} target="_blank" rel="noreferrer">Live Demo</a></p>}
      <Link to="/projects">Back to projects</Link>
    </div>
  );
};