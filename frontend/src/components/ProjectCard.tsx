import type { Project } from '../types';
import { Link } from 'react-router-dom';

interface Props {
  project: Project;
}

export const ProjectCard = ({ project }: Props) => (
  <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8, marginBottom: 15 }}>
    <h3>{project.title}</h3>
    <p>{project.description}</p>
    <p><strong>Tech:</strong> {project.techStack.join(', ')}</p>
    <div>
      {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ marginRight: 10 }}>GitHub</a>}
      {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer">Demo</a>}
      <Link to={`/project/${project.id}`} style={{ marginLeft: 10 }}>Details</Link>
    </div>
  </div>
);