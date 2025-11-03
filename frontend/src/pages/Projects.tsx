// Projects.tsx (обновлённый fetch с обработкой 304 и кеша)
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
  if (/screenshots\//i.test(s)) return s.startsWith('/') ? s : `/${s}`;
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(s)) return s.startsWith('/') ? s : `/${s}`;
  if (/^[\w\-. ]+$/.test(s)) {
    const safeName = s.replace(/\s+/g, '_');
    const hasExt = /\.[a-z0-9]{2,4}$/i.test(s);
    return `/screenshots/${hasExt ? safeName : `${safeName}.png`}`;
  }
  if (/^\d+x\d+(\?.*)?$/.test(s)) return `https://via.placeholder.com/${s}`;
  console.warn('IMG-NORMALIZE: unknown image string, using placeholder ->', u);
  return PLACEHOLDER_SVG;
}

function normalizeProjects(raw: any[]): Project[] {
  return raw.map((p: any) => {
    const screenshots = Array.isArray(p.screenshots) && p.screenshots.length
      ? p.screenshots.map((s: any) => normalizeImageUrl(s))
      : [PLACEHOLDER_SVG];
    return { ...p, screenshots } as Project;
  });
}

const API_BASE = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) ? (import.meta as any).env.VITE_API_URL : '';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchJsonWithRetries(url: string) {
      const fetchOpts: RequestInit = {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
        // no cache on retry calls, initial call uses default to allow 304 checks
      };

      // 1) initial request (may return 200 or 304)
      let res = await fetch(url, fetchOpts);
      // if server returned 304 (no body) or content-type is not json -> try again forcing no-cache
      let ct = res.headers.get('content-type') || '';

      if (res.status === 304 || !ct.includes('application/json')) {
        console.warn('Projects fetch: non-JSON or 304 detected. status=', res.status, 'content-type=', ct);

        // Try a no-cache refetch by adding a timestamp to bypass caches and setting cache:'no-store'
        const urlNoCache = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
        try {
          res = await fetch(urlNoCache, { ...fetchOpts, cache: 'no-store' });
          ct = res.headers.get('content-type') || '';
          // if still no json, capture text for diagnosis
          if (!res.ok || !ct.includes('application/json')) {
            const text = await res.text();
            console.error('Projects fetch retry failed or returned non-JSON. status=', res.status, 'ct=', ct, 'body (first 1000 chars):\n', text.slice(0, 1000));
            throw new Error(`API did not return JSON (status ${res.status})`);
          }
        } catch (err) {
          throw err;
        }
      }

      // at this point res should be JSON with body
      const data = await res.json();
      return data;
    }

    async function load() {
      try {
        const apiUrl = API_BASE ? `${API_BASE}/api/projects/` : '/api/projects/';
        const data = await fetchJsonWithRetries(apiUrl);
        if (!mounted) return;
        const normalized = normalizeProjects(Array.isArray(data) ? data : []);
        setProjects(normalized);
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
      {projects.map((p) => (
        <ProjectCard key={p.id || p.title} project={p} />
      ))}
    </div>
  );
};

export default Projects;
