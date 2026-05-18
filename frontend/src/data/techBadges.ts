export type TechBadge = {
  src: string;
  alt: string;
};

export const TECH_BADGES: Record<string, TechBadge> = {
  python: {
    src: "https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54",
    alt: "Python",
  },
  django: {
    src: "https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white",
    alt: "Django",
  },
  drf: {
    src: "https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=ff1709&labelColor=gray",
    alt: "Django REST Framework",
  },
  djangorest: {
    src: "https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=ff1709&labelColor=gray",
    alt: "Django REST Framework",
  },
  fastapi: {
    src: "https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi",
    alt: "FastAPI",
  },
  docker: {
    src: "https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white",
    alt: "Docker",
  },
  postgres: {
    src: "https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white",
    alt: "PostgreSQL",
  },
  postgresql: {
    src: "https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white",
    alt: "PostgreSQL",
  },
  redis: {
    src: "https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white",
    alt: "Redis",
  },
  celery: {
    src: "https://img.shields.io/badge/celery-%2337814A.svg?style=for-the-badge&logo=celery&logoColor=white",
    alt: "Celery",
  },
  nginx: {
    src: "https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white",
    alt: "Nginx",
  },
  gunicorn: {
    src: "https://img.shields.io/badge/gunicorn-%298729.svg?style=for-the-badge&logo=gunicorn&logoColor=white",
    alt: "Gunicorn",
  },
  sqlite: {
    src: "https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white",
    alt: "SQLite",
  },
  html5: {
    src: "https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white",
    alt: "HTML5",
  },
  css3: {
    src: "https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white",
    alt: "CSS3",
  },
  javascript: {
    src: "https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E",
    alt: "JavaScript",
  },
  typescript: {
    src: "https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white",
    alt: "TypeScript",
  },
  react: {
    src: "https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB",
    alt: "React",
  },
  bootstrap: {
    src: "https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white",
    alt: "Bootstrap",
  },
  git: {
    src: "https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white",
    alt: "Git",
  },
  github: {
    src: "https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white",
    alt: "GitHub",
  },
  githubactions: {
    src: "https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white",
    alt: "GitHub Actions",
  },
  openapi: {
    src: "https://img.shields.io/badge/openapiinitiative-%23000000.svg?style=for-the-badge&logo=openapiinitiative&logoColor=white",
    alt: "OpenAPI",
  },
  swagger: {
    src: "https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white",
    alt: "Swagger",
  },
};

export function normalizeTagKey(tag: string): string {
  return tag
    .replace(/^#/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s._-]+/g, "");
}

export function getTechBadge(tag: string): TechBadge | undefined {
  return TECH_BADGES[normalizeTagKey(tag)];
}