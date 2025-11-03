import React, { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import type { Project } from '../types';

const PLACEHOLDER_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
     <rect width="100%" height="100%" fill="#efefef"/>
     <text x="50%" y="50%" font-size="20" fill="#666" text-anchor="middle" dominant-baseline="middle">No screenshot</text>
   </svg>`
);

function normalizeScreenshot(s: any): string {
  if (!s) return PLACEHOLDER_SVG;
  if (typeof s === 'object') return normalizeScreenshot(s.image_url || s.url || s.path || '');
  const str = String(s).trim();
  if (/^https?:\/\//i.test(str) || /^\/\//.test(str)) return str;
  if (str.startsWith('/')) return str;
  if (/screenshots\//i.test(str)) return '/' + str.replace(/^\/+/, '');
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(str)) return '/' + str.replace(/^\/+/, '');
  return `/screenshots/${str.replace(/\s+/g,'_')}${/\.[a-z0-9]{2,4}$/i.test(str) ? '' : '.png'}`;
}

function normalizeProjects(raw: any[]): Project[] {
  return raw.map((p: any) => ({
    ...p,
    screenshots: (Array.isArray(p.screenshots) ? p.screenshots : [])
                 .map((s:any) => normalizeScreenshot(s))
  }));
}

function getApiBase(): string {
  try {
    const v = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || '';
    if (v) return v.replace(/\/+$/, '');
  } catch (e) { /* ignore */ }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('myportfoliospa-1.onrender.com')) {
      return 'https://myportfoliospa.onrender.com';
    }
  }

  return '';
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const API_BASE = getApiBase(); // either absolute host or ''
        const apiUrl = API_BASE ? `${API_BASE}/api/projects/` : '/api/projects/';

        const res = await fetch(apiUrl, { credentials: 'include', headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`API returned ${res.status} ${res.statusText}. Body preview: ${body.slice(0,500)}`);
        }
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          const text = await res.text();
          throw new Error(`API did not return JSON (content-type: ${ct}). Body preview: ${text.slice(0,500)}`);
        }
        const data = await res.json();
        if (!mounted) return;
        setProjects(normalizeProjects(Array.isArray(data) ? data : []));
      } catch (err: any) {
        console.error('Projects fetch error', err);
        if (mounted) setErrorMsg(String(err.message || err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading projects…</div>;
  if (errorMsg) return <div style={{ color: 'red' }}>Error loading projects: {errorMsg}</div>;

  return (
    <div className="projects-grid">
      {projects.map((p) => <ProjectCard key={p.id || p.title} project={p} />)}
    </div>
  );
};

export default Projects;
