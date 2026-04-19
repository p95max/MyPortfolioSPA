import React, { useEffect, useState } from 'react';
import type { Project } from '../types';
import './ProjectCard.css';

const PLACEHOLDER_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
       <rect width="100%" height="100%" fill="#0e1219"/>
       <text x="50%" y="50%" font-size="14" fill="#3d4f63" text-anchor="middle" dominant-baseline="middle" font-family="monospace">no screenshot</text>
     </svg>`
  );

function normalizeSrc(u: string): string {
  if (!u) return PLACEHOLDER_SVG;
  if (u.startsWith('/')) return u;

  try {
    const url = new URL(u);

    if (url.origin === window.location.origin) {
      return url.pathname + url.search;
    }
  } catch {
    /* ignore */
  }

  return u;
}

interface Props {
  project: Project;
}

export const ProjectCard: React.FC<Props> = ({ project }) => {
  const imgs =
    Array.isArray(project.screenshots) && project.screenshots.length > 0
      ? project.screenshots.map(normalizeSrc)
      : [PLACEHOLDER_SVG];

  const [index, setIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const currentSrc = imgs[index];
  const canPreview = currentSrc !== PLACEHOLDER_SVG;

  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreviewOpen]);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex(i => (i === 0 ? imgs.length - 1 : i - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex(i => (i === imgs.length - 1 ? 0 : i + 1));
  };

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    if (img.dataset.fallbackApplied === '1') return;

    img.dataset.fallbackApplied = '1';
    img.src = PLACEHOLDER_SVG;
  };

  return (
    <div className="pc">
      {/* Gallery */}
      <div className="pc-gallery">
        <button
          type="button"
          className="pc-img-btn"
          onClick={() => {
            if (canPreview) {
              setIsPreviewOpen(true);
            }
          }}
          disabled={!canPreview}
          aria-label={`Open ${project.title} screenshot preview`}
        >
          <img
            className="pc-img"
            src={currentSrc}
            alt={`${project.title} screenshot ${index + 1}`}
            loading="lazy"
            crossOrigin="anonymous"
            onError={onImgError}
          />
        </button>

        {imgs.length > 1 && (
          <>
            <button className="pc-nav pc-nav-prev" onClick={prev} aria-label="Previous">
              ‹
            </button>

            <button className="pc-nav pc-nav-next" onClick={next} aria-label="Next">
              ›
            </button>

            <div className="pc-dots">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  className={`pc-dot ${i === index ? 'active' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  aria-label={`Screenshot ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div className="pc-body">
        <h3 className="pc-title">{project.title}</h3>
        <p className="pc-desc">{project.description}</p>

        {project.techStack?.length > 0 && (
          <div className="pc-stack">
            {project.techStack.map(tech => (
              <span key={tech} className="pc-chip">
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="pc-links">
          {project.githubUrl && /^https?:\/\//.test(project.githubUrl) && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="pc-link"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
            </a>
          )}

          {project.demoUrl && /^https?:\/\//.test(project.demoUrl) && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="pc-link"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 7h12M8 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Live demo
            </a>
          )}
        </div>
      </div>

      {isPreviewOpen && (
        <div
          className="pc-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} screenshot preview`}
          onClick={() => setIsPreviewOpen(false)}
        >
          <button
            type="button"
            className="pc-lightbox-close"
            onClick={() => setIsPreviewOpen(false)}
            aria-label="Close preview"
          >
            ×
          </button>

          <img
            className="pc-lightbox-img"
            src={currentSrc}
            alt={`${project.title} screenshot ${index + 1}`}
            onClick={e => e.stopPropagation()}
            onError={onImgError}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectCard;