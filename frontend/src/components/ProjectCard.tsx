import type { Project } from '../types';

const iconStyle = { width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' };


interface Props {
  project: Project;
}

export const ProjectCard = ({ project }: Props) => (
  <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8, marginBottom: 15 }}>
    <h3>{project.title}</h3>
    <p style={{ whiteSpace: 'normal', wordWrap: 'break-word', wordBreak: 'break-word' }}>
      {project.description}
    </p>
    <p style={{ whiteSpace: 'normal', wordWrap: 'break-word', wordBreak: 'break-word' }}>
      <strong>Tech:</strong> {project.techStack}
    </p>
    <div>
      {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ marginRight: 10 }}>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.997.108-.775.418-1.305.76-1.605-2.665-.3-5.466-1.335-5.466-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 013.003-.404c1.02.005 2.045.138 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.48 5.92.43.37.823 1.1.823 2.22 0 1.606-.015 2.896-.015 3.286 0 .32.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub</a>}
      {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer">Demo</a>}
    </div>
  </div>
);