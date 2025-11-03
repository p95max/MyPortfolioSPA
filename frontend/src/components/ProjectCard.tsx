import React, { useState } from 'react';
import type { Project } from '../types';

const iconStyle = { width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' };

type TechStackProps = {
  techStack: string[];
};

const TechStack = ({ techStack }: TechStackProps) => {
  return (
    <p style={{ whiteSpace: 'normal', wordWrap: 'break-word', wordBreak: 'break-word' }}>
      <strong>Tech:</strong>{' '}
      {techStack.map((tech, idx) => (
        <span
          key={idx}
          style={{
            display: 'inline-block',
            backgroundColor: '#0070f3',
            color: 'white',
            borderRadius: '12px',
            padding: '4px 10px',
            marginRight: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            userSelect: 'none',
          }}
        >
          {tech.replace(/^#/, '')}
        </span>
      ))}
    </p>
  );
};

interface Props {
  project: Project;
}

const PLACEHOLDER = 'https://via.placeholder.com/800x450?text=No+Screenshot';

function normalizeImageUrl(u: string | undefined | null): string {
  if (!u) return PLACEHOLDER;

  const trimmed = u.trim();

  if (/^https?:\/\//i.test(trimmed) || /^\/\//.test(trimmed)) {
    return trimmed;
  }

  if (/^\d+x\d+(\?.*)?$/.test(trimmed)) {
    return `https://via.placeholder.com/${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin + trimmed;
    }
    return PLACEHOLDER;
  }

  if (/^[\w.-]+\.[a-z]{2,}[:/]/i.test(trimmed) || /^[\w.-]+\.[a-z]{2,}$/i.test(trimmed)) {
    return 'https://' + trimmed;
  }

  return PLACEHOLDER;
}

export const ProjectCard = ({ project }: Props) => {
  const rawImages = (project.screenshots && project.screenshots.length > 0) ? project.screenshots : [PLACEHOLDER];
  const images = rawImages.map((s) => normalizeImageUrl(s));

  const [index, setIndex] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8, marginBottom: 15 }}>
      <h3>{project.title}</h3>

      {/* Carousel */}
      <div style={{ position: 'relative', marginBottom: 12, borderRadius: 8, overflow: 'hidden', background: '#111' }}>
        <img
          src={images[index]}
          alt={`${project.title} screenshot ${index + 1}`}
          style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous screenshot"
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.4)',
                border: 'none',
                color: '#fff',
                padding: '8px 10px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              ‹
            </button>

            <button
              onClick={next}
              aria-label="Next screenshot"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.4)',
                border: 'none',
                color: '#fff',
                padding: '8px 10px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              ›
            </button>

            {/* Dots */}
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 8,
              display: 'flex',
              gap: 6,
            }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setIndex(i); }}
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

      <p style={{ whiteSpace: 'normal', wordWrap: 'break-word', wordBreak: 'break-word' }}>
        {project.description}
      </p>
      <TechStack techStack={project.techStack} />
      <div>
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ marginRight: 10 }}>
            <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.997.108-.775.418-1.305.76-1.605-2.665-.3-5.466-1.335-5.466-5.93 0-1.31.47-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 013.003-.404c1.02.005 2.045.138 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.48 5.92.43.37.823 1.1.823 2.22 0 1.606-.015 2.896-.015 3.286 0 .32.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        )}
      </div>
    </div>
  );
};
