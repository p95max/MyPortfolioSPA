
import React, { useState } from 'react';
import type { Project } from '../types';

const PLACEHOLDER_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
     <rect width="100%" height="100%" fill="#efefef"/>
     <text x="50%" y="50%" font-size="20" fill="#666" text-anchor="middle" dominant-baseline="middle">No screenshot</text>
   </svg>`
);

interface Props {
  project: Project;
}

/**
 * Пробует загрузить изображение через fetch (credentials: include) и вернуть blob-url.
 * Если fetch не прошёл — бросает.
 */
async function tryFetchAsBlobUrl(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'include', mode: 'cors' });
  if (!res.ok) throw new Error('status ' + res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export const ProjectCard: React.FC<Props> = ({ project }) => {
  const images = Array.isArray(project.screenshots) && project.screenshots.length ? project.screenshots : [PLACEHOLDER_SVG];
  const [index, setIndex] = useState(0);

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
    <div className="project-card" style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <h3>{project.title}</h3>

      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 8, background: '#111' }}>
        <img
          src={images[index]}
          alt={`${project.title} screenshot ${index + 1}`}
          style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
          onError={onImgError}
        />

        {images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous" style={navBtnStyleLeft}>‹</button>
            <button onClick={next} aria-label="Next" style={navBtnStyleRight}>›</button>

            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 8, display: 'flex', gap: 6 }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(ev) => { ev.stopPropagation(); setIndex(i); }}
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
      <div style={{ marginTop: 8 }}>
        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
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
  cursor: 'pointer',
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
  cursor: 'pointer',
};

export default ProjectCard;
