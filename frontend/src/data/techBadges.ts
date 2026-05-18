export type TechBadge = {
  src: string;
  alt: string;
};

function normalizeBadgeLabel(label: string): string {

  return encodeURIComponent(label.replace(/-/g, "--"));
}

function makeBadge(
  label: string,
  color: string,
  logo?: string,
  logoColor = "white",
  alt = label
): TechBadge {
  const params = new URLSearchParams({
    style: "for-the-badge",
  });

  if (logo) {
    params.set("logo", logo);
    params.set("logoColor", logoColor);
  }

  return {
    src: `https://img.shields.io/badge/${normalizeBadgeLabel(label)}-${color.replace(
      "#",
      ""
    )}?${params.toString()}`,
    alt,
  };
}

export const TECH_BADGES: Record<string, TechBadge> = {
  // Core backend
  python: makeBadge("Python", "3670A0", "python", "ffdd54"),
  python3: makeBadge("Python 3", "3670A0", "python", "ffdd54", "Python 3"),
  django: makeBadge("Django", "092E20", "django"),
  djangorest: makeBadge("Django REST", "ff1709", "django"),
  drf: makeBadge("Django REST", "ff1709", "django"),
  fastapi: makeBadge("FastAPI", "005571", "fastapi"),
  pydantic: makeBadge("Pydantic", "E92063", "pydantic"),
  pytest: makeBadge("Pytest", "0A9EDC", "pytest"),

  // Databases / cache / geo
  postgresql: makeBadge("PostgreSQL", "316192", "postgresql"),
  postgres: makeBadge("PostgreSQL", "316192", "postgresql"),
  redis: makeBadge("Redis", "DD0031", "redis"),
  sqlite: makeBadge("SQLite", "07405e", "sqlite"),
  postgis: makeBadge("PostGIS", "336791", "postgis"),

  // Async / infra / deployment
  docker: makeBadge("Docker", "0db7ed", "docker"),
  nginx: makeBadge("Nginx", "009639", "nginx"),
  gunicorn: makeBadge("Gunicorn", "298729", "gunicorn"),
  celery: makeBadge("Celery", "37814A", "celery"),
  ansible: makeBadge("Ansible", "000000", "ansible"),
  terraform: makeBadge("Terraform", "7B42BC", "terraform"),
  githubactions: makeBadge("GitHub Actions", "2671E5", "githubactions"),
  git: makeBadge("Git", "F05033", "git"),
  github: makeBadge("GitHub", "121011", "github"),

  // Frontend
  react: makeBadge("React", "20232a", "react", "61DAFB"),
  bootstrap: makeBadge("Bootstrap", "8511FA", "bootstrap"),
  javascript: makeBadge("JavaScript", "323330", "javascript", "F7DF1E"),
  typescript: makeBadge("TypeScript", "007ACC", "typescript"),
  html5: makeBadge("HTML5", "E34F26", "html5"),
  css3: makeBadge("CSS3", "1572B6", "css3"),
  nodejsexpress: makeBadge("Node.js + Express", "339933", "nodedotjs"),

  // APIs / auth / integrations
  openaiapi: makeBadge("OpenAI API", "412991", "openai"),
  googleoauth: makeBadge("Google OAuth", "4285F4", "google"),
  googlesheetsapi: makeBadge("Google Sheets API", "34A853", "googlesheets"),
  googleplacesapi: makeBadge("Google Places API", "4285F4", "googlemaps"),
  googleapi: makeBadge("Google API", "4285F4", "google"),
  gmailapi: makeBadge("Gmail API", "EA4335", "gmail"),
  telegrambotapi: makeBadge("Telegram Bot API", "26A5E4", "telegram"),
  cloudflareturnstile: makeBadge("Cloudflare Turnstile", "F38020", "cloudflare"),
  jwtauth: makeBadge("JWT Auth", "000000", "jsonwebtokens"),
  keycloakoidc: makeBadge("Keycloak OIDC", "4D4D4D", "keycloak"),
  openapi: makeBadge("OpenAPI", "6BA539", "openapiinitiative"),
  swagger: makeBadge("Swagger", "85EA2D", "swagger", "000000"),

  // Data / GIS
  etl: makeBadge("ETL", "4B5563"),
  datapipelines: makeBadge("Data Pipelines", "4B5563"),
  jsonschemas: makeBadge("JSON Schemas", "000000", "json"),
  geojson: makeBadge("GeoJSON", "5A67D8"),
  arcgisrest: makeBadge("ArcGIS REST", "2C7AC3", "arcgis"),
  openlayersmap: makeBadge("OpenLayers Map", "1F6B75", "openlayers"),
  restwebsocket: makeBadge("REST + WebSocket", "4B5563"),

  // Product / architecture tags
  fullstackdevelopment: makeBadge("Full-stack development", "334155"),
  businessprocessautomation: makeBadge("Business automation", "0f766e"),
  liveservice: makeBadge("Live service", "16A34A"),
};

export function normalizeTagKey(tag: string): string {
  return tag
    .replace(/^#/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function getTechBadge(tag: string): TechBadge | undefined {
  return TECH_BADGES[normalizeTagKey(tag)];
}