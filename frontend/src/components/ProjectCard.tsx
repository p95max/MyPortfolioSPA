import React, { useEffect, useRef, useState } from 'react';
import type { Project } from '../types';

const PLACEHOLDER_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
     <rect width="100%" height="100%" fill="#efefef"/>
     <text x="50%" y="50%" font-size="28" fill="#666" text-anchor="middle" dominant-baseline="middle">No screenshot</text>
   </svg>`
);

interface Props {
  project: Project;
}

async function tryFetchAsBlobUrl(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'include', mode: 'cors' });
  if (!res.ok) throw new Error('status ' + res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export const ProjectCard: React.FC<Props> = ({ project }) => {
  const images = Array.isArray(project.screenshots) && project.screenshots.length ? project.screenshots : [PLACEHOLDER_SVG];
  const [index, setIndex] = useState(0);
  const [fsOpen, setFsOpen] = useState(false);
  const [fsIndex, setFsIndex] = useState(0);
  const imgRefs = useRef<HTMLImageElement[]>([]);

  const prev = (e?: React.MouseEvent) => { e?.stopPropagation(); setIndex(i => (i === 0 ? images.length - 1 : i - 1)); };
  const next = (e?: React.MouseEvent) => { e?.stopPropagation(); setIndex(i => (i === images.length - 1 ? 0 : i + 1)); };

  const onImgError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) {
      img.src = PLACEHOLDER_SVG;
      return;
    }

    try {
      const blobUrl = await tryFetchAsBlobUrl(src);
      img.src = blobUrl;
      return;
    } catch (err) {
      img.src = PLACEHOLDER_SVG;
    }
  };


  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!fsOpen) return;
      if (e.key === 'Escape') closeFs();
      if (e.key === 'ArrowLeft') fsPrev();
      if (e.key === 'ArrowRight') fsNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);

  }, [fsOpen, fsIndex, images]);

  useEffect(() => {
    if (fsOpen) {

      document.body.style.overflow = 'hidden';

      const el = document.getElementById('fs-close-btn');
      el?.focus();
    } else {
      document.body.style.overflow = '';
    }
  }, [fsOpen]);

  const openFs = (i = 0) => {
    setFsIndex(i);
    setFsOpen(true);
  };
  const closeFs = () => setFsOpen(false);
  const fsPrev = () => setFsIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const fsNext = () => setFsIndex(i => (i === images.length - 1 ? 0 : i + 1));

  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx > 0) fsPrev(); else fsNext();
    }
    touchStartX.current = null;
  };

  return (
    <>
      <div className="project-card" style={{ padding: 18, borderRadius: 10, marginBottom: 12 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>{project.title}</h3>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="screenshot-frame" role="group" aria-label={`${project.title} screenshots`}>
            <div className="frame-top" aria-hidden="true">
              <span className="frame-dot dot-red" />
              <span className="frame-dot dot-yellow" />
              <span className="frame-dot dot-green" />
            </div>

            <div className="screenshot-screen" onClick={() => openFs(index)} style={{ cursor: 'zoom-in' }}>
              <img
                ref={el => { if (el) imgRefs.current[index] = el; }}
                className="project-card-img"
                src={images[index]}
                alt={`${project.title} screenshot ${index + 1}`}
                onError={onImgError}
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
              <button onClick={prev} aria-label="Previous screenshot" className="pg-nav">‹ Prev</button>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(ev) => { ev.stopPropagation(); setIndex(i); }}
                    aria-label={`Go to screenshot ${i + 1}`}
                    className={`dot-ind ${i === index ? 'active' : ''}`}
                  />
                ))}
              </div>
              <button onClick={next} aria-label="Next screenshot" className="pg-nav">Next ›</button>
            </div>
          </>
        )}

        <p style={{ marginTop: 12 }}>{project.description}</p>
        <div style={{ marginTop: 8 }}>
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fsOpen && (
        <div
          className="fs-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} screenshots full screen`}
          onClick={(e) => { if (e.target === e.currentTarget) closeFs(); }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button id="fs-close-btn" className="fs-close" onClick={closeFs} aria-label="Close (Esc)">✕</button>

          <button className="fs-arrow fs-prev" onClick={(e) => { e.stopPropagation(); fsPrev(); }} aria-label="Previous (Left)">‹</button>
          <div className="fs-content">
            <img
              className="fs-img"
              src={images[fsIndex]}
              alt={`${project.title} screenshot ${fsIndex + 1}`}
              onError={onImgError}
            />
            <div className="fs-caption">{project.title} — {fsIndex + 1}/{images.length}</div>
          </div>
          <button className="fs-arrow fs-next" onClick={(e) => { e.stopPropagation(); fsNext(); }} aria-label="Next (Right)">›</button>
        </div>
      )}
    </>
  );
};

export default ProjectCard;
