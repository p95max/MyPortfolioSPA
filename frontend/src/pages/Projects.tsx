import React, { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard'; // путь подкорректируй если нужно

const PLACEHOLDER_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
     <rect width="100%" height="100%" fill="#efefef"/>
     <text x="50%" y="50%" font-size="20" fill="#666" text-anchor="middle" dominant-baseline="middle">No screenshot</text>
   </svg>`
);


const PROJECT_SCREENSHOTS_MAP: Record<string | number, string[]> = {
  1: ['/screenshots/chattym1.png', '/screenshots/chattym2.png', '/screenshots/chattym3.png'],
  2: ['/screenshots/what2cook1.png', '/screenshots/what2cook2.png', '/screenshots/what2cook3.png'],
  3: ['/screenshots/as_book1.png', '/screenshots/as_book2.png', '/screenshots/as_book3.png'],

  'ChattyM': ['/screenshots/chattym1.png','/screenshots/chattym2.png','/screenshots/chattym3.png'],
  'What2Cook': ['/screenshots/what2cook1.png','/screenshots/what2cook2.png','/screenshots/what2cook3.png'],
  'AutoService Book': ['/screenshots/as_book1.png','/screenshots/as_book2.png','/screenshots/as_book3.png'],
};


function normalizeScreenshot(s: any): string {
  if (!s) return PLACEHOLDER_SVG;

  if (typeof s === 'object') {
    const maybe = s.image_url || s.url || s.path || s.src || '';
    return normalizeScreenshot(maybe);
  }

  const str = String(s).trim();
  if (!str) return PLACEHOLDER_SVG;

  if (/^https?:\/\//i.test(str) || /^\/\//.test(str)) return str;

  // Root-relative (начинается с '/')
  if (str.startsWith('/')) return str;

  if (/screenshots\//i.test(str)) return '/' + str.replace(/^\/+/, '');

  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(str)) return '/' + str.replace(/^\/+/, '');

  const safe = str.replace(/\s+/g, '_');
  const hasExt = /\.[a-z0-9]{2,4}$/i.test(safe);
  return `/screenshots/${hasExt ? safe : safe + '.png'}`;
}

function normalizeProjects(raw: any[]): any[] {
  return raw.map((p: any) => {
    const apiShots = Array.isArray(p.screenshots) && p.screenshots.length
      ? p.screenshots.map((s: any) => normalizeScreenshot(s)).filter(Boolean)
      : [];

    const byId = PROJECT_SCREENSHOTS_MAP[p.id] || PROJECT_SCREENSHOTS_MAP[String(p.id)];
    const byTitle = PROJECT_SCREENSHOTS_MAP[p.title] || PROJECT_SCREENSHOTS_MAP[String(p.title)];

    const fallback = byId || byTitle || [PLACEHOLDER_SVG];
    const finalShots = apiShots.length ? apiShots : fallback;

    // debug
    if (!apiShots.length) {
      console.info(`PROJECTS: using fallback screenshots for project id=${p.id} title="${p.title}"`);
    }

    return {
      ...p,
      screenshots: finalShots,
    };
  });
}

function getApiBase(): string {
  try {
    // @ts-ignore
    const v = (import.meta && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || '';
    if (v) return v.replace(/\/+$/, '');
  } catch (e) { /* ignore */ }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (host.includes('myportfoliospa-1.onrender.com')) {
      return 'https://myportfoliospa.onrender.com';
    }
  }
  return '';
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
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
      };

      let res = await fetch(url, fetchOpts);
      const ct = res.headers.get('content-type') || '';

      if (res.status === 304 || !ct.includes('application/json')) {
        const urlNoCache = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
        res = await fetch(urlNoCache, { ...fetchOpts, cache: 'no-store' });
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API returned status ${res.status}. Body preview: ${text.slice(0, 1000)}`);
      }

      const finalCt = res.headers.get('content-type') || '';
      if (!finalCt.includes('application/json')) {
        const text = await res.text().catch(() => '');
        throw new Error(`API did not return JSON (content-type: ${finalCt}). Body preview: ${text.slice(0, 1000)}`);
      }

      return res.json();
    }

    async function load() {
      try {
        const API_BASE = getApiBase();
        const apiUrl = API_BASE ? `${API_BASE}/api/projects/` : '/api/projects/';
        console.log('PROJECTS: fetching', apiUrl);
        const data = await fetchJsonWithRetries(apiUrl);
        if (!mounted) return;
        console.log('PROJECTS: raw data', data);
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
