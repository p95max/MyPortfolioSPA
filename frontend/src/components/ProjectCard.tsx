import React, { useState } from 'react';
import type { Project } from '../types';

const PLACEHOLDER_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
     <rect width="100%" height="100%" fill="#111"/>
     <text x="50%" y="50%" font-size="24" fill="#888" text-anchor="middle" dominant-baseline="middle">No screenshot</text>
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
  const [loaded, setLoaded] = useState(false);

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIndex(i => (i === 0 ? images.length - 1 : i - 1)); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIndex(i => (i === images.length - 1 ? 0 : i + 1)); };

  const onImgError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const src = img.src;
    console.warn('IMG-LOAD-ERROR: initial <img> error for', src);

    if (src.startsWith('data:')) {
      img.src = PLACEHOLDER_SVG;
      return;
    }

    try {
      const blobUrl = await tryFetchAsBlobUrl(src);
      img.src = blobUrl;
      console.info('IMG-LOAD-INFO: loaded via fetch as blob', src);
      return;
    } catch (err) {
      console.warn('IMG-LOAD-ERROR: fetch fallback failed for', src, err);
    }

    img.src = PLACEHOLDER_SVG;
  };

  return (
    <div
      className="project-card"
      style={{
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 14,
        borderRadius: 10,
        marginBottom: 18,
        background: 'linear-gradient(180deg, rgba(20,20,20,0.6), rgba(12,12,12,0.6))',
        color: '#eee',
        boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0' }}>{project.title}</h3>

      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 8,
          background: '#0b0b0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '16 / 9',
          minHeight: 360,
        }}
      >
        <img
          src={images[index]}
          alt={`${project.title} screenshot ${index + 1}`}
          loading="lazy"
          decoding="async"
          onError={onImgError}
          onLoad={() => setLoaded(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: loaded ? 'block' : 'none',
            background: '#0b0b0b',
          }}
        />

        {!loaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 4, background: '#222', margin: '0 auto 8px', borderRadius: 2 }} />
              <div>Loading image…</div>
            </div>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous" style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.45)',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}>‹</button>

            <button onClick={next} aria-label="Next" style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.45)',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}>›</button>

            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 10,
              display: 'flex',
              gap: 8,
            }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(ev) => { ev.stopPropagation(); setIndex(i); setLoaded(false); }}
                  aria-label={`Go to screenshot ${i + 1}`}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.12)',
                    background: i === index ? '#fff' : 'transparent',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <p style={{ marginTop: 12, color: '#d9d9d9' }}>{project.description}</p>

      <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#9fbcff' }}>GitHub</a>}
        {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" style={{ color: '#9fbcff' }}>Demo</a>}
      </div>
    </div>
  );
};

export default ProjectCard;
