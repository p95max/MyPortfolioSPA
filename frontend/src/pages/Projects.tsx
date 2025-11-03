import React, { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import type { Project } from '../types';

const PLACEHOLDER_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
     <rect width="100%" height="100%" fill="#efefef"/>
     <text x="50%" y="50%" font-size="20" fill="#666" text-anchor="middle" dominant-baseline="middle">No screenshot</text>
   </svg>`
);

function normalizeImageUrl(u?: string | null): string {
  if (!u) return PLACEHOLDER_SVG;
  const s = String(u).trim();

  if (/^https?:\/\//i.test(s) || /^\/\//.test(s)) return s;

  if (s.startsWith('/')) return s;

  if (/screenshots\//i.test(s)) {
    return s.startsWith('/') ? s : `/${s}`;
  }

  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(s)) {
    return s.startsWith('/') ? s : `/${s}`;
  }

  if (/^[\w\-. ]+$/.test(s)) {
    const safeName = s.replace(/\s+/g, '_');
    const hasExt = /\.[a-z0-9]{2,4}$/i.test(s);
    return `/screenshots/${hasExt ? safeName : `${safeName}.png`}`;
  }

  if (/^\d+x\d+(\?.*)?$/.test(s)) {
    return `https://via.placeholder.com/${s}`;
  }

  console.warn('IMG-NORMALIZE: unknown image string, using placeholder ->', u);
  return PLACEHOLDER_SVG;
}

function normalizeProjects(raw: any[]): Project[] {
  return raw.map((p: any) => {
    const screenshots = Array.isArray(p.screenshots) && p.screenshots.length
      ? p.screenshots.map((s: any) => {
          const normalized = normalizeImageUrl(s);
          if (normalized === PLACEHOLDER_SVG && s) {
            console.warn('IMG-NORMALIZE: replaced bad screenshot value:', s, '-> placeholder');
          }
          return normalized;
        })
      : [PLACEHOLDER_SVG];

    return {
      ...p,
      screenshots,
    } as Project;
  });
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/projects/', { credentials: 'include' });
        if (!res.ok) {
          console.error('Projects fetch failed', res.status);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        const normalized = normalizeProjects(Array.isArray(data) ? data : []);
        setProjects(normalized);
      } catch (err) {
        console.error('Projects fetch error', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading projects…</div>;

  return (
    <div className="projects-grid">
      {projects.map((p) => (
        <ProjectCard key={p.id || p.title} project={p} />
      ))}
    </div>
  );
};

export default Projects;
