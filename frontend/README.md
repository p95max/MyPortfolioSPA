# Frontend - React SPA

Frontend service for the Portfolio SPA project.

The frontend is a React + TypeScript SPA built with Vite. In Docker, the production build is served by Nginx. On Render, the `dist` directory is served by a static site service.

---

## Stack

- React 19
- TypeScript
- Vite 7
- React Router DOM 7
- React Markdown
- ESLint 9
- Cloudflare Turnstile frontend widget
- Nginx for Docker-based production serving

---

## Main Features

- Home page.
- Projects page.
- Contact page.
- Impressum page.
- Datenschutz page.
- Responsive navigation with mobile hamburger menu.
- Project cards with:
  - screenshot carousel
  - fullscreen lightbox
  - GitHub link
  - live demo link when available
  - technology chips
- Projects filtering by technology tags.
- Tag counters.
- Pagination with 5 projects per page.
- Contact form with:
  - frontend validation
  - Cloudflare Turnstile widget
  - honeypot field
  - API submission to Django backend
- Cookie consent banner.
- Optional snowfall overlay.
- PDF document card component with iframe preview and download button.

---

## Environment Variables

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:8000
VITE_TURNSTILE_SITEKEY=your-turnstile-site-key
VITE_SNOW=auto
```

### Variable reference

| Variable | Required | Description |
|---|---:|---|
| `VITE_API_URL` | yes | Backend base URL. Example: `http://localhost:8000`. |
| `VITE_TURNSTILE_SITEKEY` | yes for contact form | Cloudflare Turnstile site key used by the browser widget. |
| `VITE_SNOW` | optional | `on`, `off`, or `auto`. Default: `auto`. In `auto`, snow is shown from November to February. |

Important: Vite only exposes environment variables prefixed with `VITE_` to the frontend bundle.

---

## API Integration

### Projects API

The projects page fetches:

```text
<VITE_API_URL>/api/projects/
```

If `VITE_API_URL` is not defined, the code falls back to:

```text
http://localhost:8000
```

Project response fields are normalized from backend snake_case to frontend camelCase:

- `tech_stack` -> `techStack`
- `github_url` -> `githubUrl`
- `demo_url` -> `demoUrl`

### Contact API

The contact page submits to:

```text
<VITE_API_URL>/api/contact/
```

Request payload:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello",
  "hp": "",
  "cf_turnstile_token": "turnstile-token"
}
```

If `VITE_TURNSTILE_SITEKEY` is missing, the form shows a configuration error and cannot be submitted.

---

## Local Development

Install dependencies:

```bash
npm ci
```

Run dev server:

```bash
npm run dev
```

Vite dev server proxies `/api` to:

```text
http://localhost:8000
```

This proxy is configured in `vite.config.ts`.

---

## Production Build

Build:

```bash
npm run build
```

Preview local production build:

```bash
npm run preview
```

Run lint:

```bash
npm run lint
```

---

## Docker Runtime

The Docker Compose frontend service uses `nginx:alpine` and serves:

```text
frontend/dist
```

Because the Compose service does not run `npm run build`, build the frontend before starting Docker Compose:

```bash
cd frontend
npm ci
npm run build
cd ..
docker compose up -d --build
```

The active Nginx config mounted by Docker Compose is:

```text
nginx/default.conf
```

Not this file:

```text
frontend/nginx/nginx.conf
```

---

## Routing

Routes configured in `App.tsx`:

| Path | Component |
|---|---|
| `/` | `Home` |
| `/projects` | `Projects` |
| `/contact` | `Contact` |
| `/impressum` | `Impressum` |
| `/datenschutz` | `Datenschutz` |

The Nginx config uses SPA fallback:

```nginx
try_files $uri $uri/ /index.html;
```

---

## Project Data Modes

`Projects.tsx` contains:

```ts
const USE_TEST_DATA = false;
```

- `false`: load real project data from the Django API.
- `true`: load local data from `frontend/src/data/test_data.ts`.

Production should keep this value as:

```ts
const USE_TEST_DATA = false;
```

---

## Screenshots

The backend returns screenshot URLs as strings.

Recommended public path format:

```text
/screenshots/example.png
```

Screenshots are expected to be available in:

```text
frontend/public/screenshots/
```

During Vite build, files from `public` are copied to `dist`, so they become available under:

```text
/screenshots/...
```

The project card normalizes image paths and falls back to an inline SVG placeholder if a screenshot is missing.

---

## Cookie Consent

The `CookieConsent` component stores preferences in `localStorage` under:

```text
cookie-consent-v1
```

Current preferences:

- necessary storage: always enabled
- analytics: optional, disabled by default

The component dispatches a browser event after saving preferences:

```text
cookie-consent-updated
```

---

## Snowfall Overlay

The `Snowfall` component is controlled by:

```env
VITE_SNOW=auto
```

Supported values:

- `on`: always show snow
- `off`: never show snow
- `auto`: show from November to February

The component respects `prefers-reduced-motion` and disables itself when reduced motion is requested.

---

## Known Implementation Notes

- The top navigation routes are valid.
- `Home.tsx` contains an additional topbar link to `/about`, but `/about` is not currently registered in `App.tsx`.
- `DocumentCard` supports PDF iframe previews, but this is browser-native iframe preview, not a custom PDF.js implementation.
- Frontend secrets do not exist. Anything included in `VITE_*` variables is bundled into browser-side JavaScript.
