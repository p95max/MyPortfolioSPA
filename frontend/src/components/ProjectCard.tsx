import React, { useState } from 'react';
import type { Project } from '../types';

const PLACEHOLDER_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
       <rect width="100%" height="100%" fill="#111"/>
       <text x="50%" y="50%" font-size="20" fill="#aaa" text-anchor="middle" dominant-baseline="middle">No screenshot</text>
     </svg>`
  );

interface Props {
  project: Project;
}

function normalizeSrc(u: string): string {
  if (!u) return PLACEHOLDER_SVG;
  if (u.startsWith('/')) return u;

  try {
    const url = new URL(u);
    if (url.origin === window.location.origin) {
      return url.pathname + url.search;
    }
  } catch {
    // ignore invalid URL
  }

  return u;
}

export const ProjectCard: React.FC<Props> = ({ project }) => {
  const imgs =
    Array.isArray(project.screenshots) && project.screenshots.length > 0
      ? project.screenshots.map(normalizeSrc)
      : [PLACEHOLDER_SVG];

  const [index, setIndex] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? imgs.length - 1 : i - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i === imgs.length - 1 ? 0 : i + 1));
  };

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    if (img.dataset.fallbackApplied === '1') {
      img.src = PLACEHOLDER_SVG;
      return;
    }

    img.dataset.fallbackApplied = '1';
    img.src = PLACEHOLDER_SVG;
  };

  const current = imgs[index];

  return (
    <div
      className="project-card"
      style={{
        border: '1px solid #ddd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12
      }}
    >
      <h3>{project.title}</h3>

      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 8,
          background: '#111',
          height: 520,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={current}
          alt={`${project.title} screenshot ${index + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            display: 'block'
          }}
          loading="lazy"
          crossOrigin="anonymous"
          onError={onImgError}
        />

        {imgs.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous" style={navBtnStyleLeft}>
              ‹
            </button>

            <button onClick={next} aria-label="Next" style={navBtnStyleRight}>
              ›
            </button>

            <div
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: 8,
                display: 'flex',
                gap: 6
              }}
            >
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setIndex(i);
                  }}
                  aria-label={`Go to screenshot ${i + 1}`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    border: 'none',
                    background: i === index ? '#fff' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <p>{project.description}</p>

      {project.techStack?.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6
          }}
        >
          {project.techStack.map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 999,
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #1e293b'
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        {project.githubUrl && /^https?:\/\//.test(project.githubUrl) && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
      </div>
    </div>
  );
};

const navBtnStyleLeft: React.CSSProperties = {
  position: 'absolute',
  left: 8,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.5)',
  border: 'none',
  color: '#fff',
  padding: '6px 8px',
  borderRadius: 6,
  cursor: 'pointer'
};

const navBtnStyleRight: React.CSSProperties = {
  position: 'absolute',
  right: 8,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.5)',
  border: 'none',
  color: '#fff',
  padding: '6px 8px',
  borderRadius: 6,
  cursor: 'pointer'
};

export default ProjectCard;