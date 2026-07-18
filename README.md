# Portfolio SPA Project

[![CI](https://github.com/p95max/MyPortfolioSPA/actions/workflows/ci.yml/badge.svg?branch=prod)](https://github.com/p95max/MyPortfolioSPA/actions/workflows/ci.yml)
[![CodeQL](https://github.com/p95max/MyPortfolioSPA/actions/workflows/codeql-analysis.yml/badge.svg?branch=prod)](https://github.com/p95max/MyPortfolioSPA/actions/workflows/codeql-analysis.yml)
[![Coverage](https://codecov.io/gh/p95max/MyPortfolioSPA/branch/prod/graph/badge.svg)](https://codecov.io/gh/p95max/MyPortfolioSPA)


Single Page Application portfolio built with **React (Vite)** on the frontend and **Django REST Framework** on the backend.

The project is designed as a practical full-stack portfolio service: projects are managed through Django Admin, exposed through a REST API, and rendered by a React SPA served by Nginx or Render Static Site.

---

## Stack

### Backend

- Python 3.12
- Django 5.2
- Django REST Framework
- PostgreSQL
- Redis cache support for DRF throttling
- Gunicorn
- WhiteNoise for Django static files
- Jazzmin admin theme
- django-admin-sortable2 for drag-and-drop project and screenshot ordering
- drf-yasg for Swagger / ReDoc API documentation
- Cloudflare Turnstile server-side verification
- SMTP email notifications

### Frontend

- React 19
- TypeScript
- Vite 7
- React Router
- Nginx for Docker-based static serving
- Cloudflare Turnstile widget on the contact form
- Local cookie consent component
- Optional seasonal snowfall overlay controlled by environment variable

### Infrastructure

- Docker Compose for local full-stack runtime
- PostgreSQL container for local development
- Render deployment configuration for backend and frontend

---

## Main Features

- Portfolio project listing through `GET /api/projects/`.
- Project management in Django Admin.
- Inline screenshot management for each project.
- Screenshot preview in Django Admin.
- Manual project ordering with drag-and-drop in the admin project list.
- React project page with:
  - project cards
  - screenshot carousel
  - fullscreen screenshot lightbox
  - technology tag filters
  - pagination
- Contact form with:
  - frontend validation
  - Cloudflare Turnstile widget
  - server-side Turnstile verification
  - honeypot protection
  - DRF throttling by email, IP, subnet, global scope, and message fingerprint
  - database persistence through `ContactMessage`
  - SMTP notification emails
- Contact message processing workflow in Django Admin:
  - `New`
  - `In progress`
  - `Done`
  - `Spam`
  - internal notes
  - processed timestamp
  - processed user
- Legal pages for Germany:
  - `/impressum`
  - `/datenschutz`
- Cookie consent banner with optional analytics preference stored in `localStorage`.
- Optional snowfall effect controlled by `VITE_SNOW`.

---

## Application URLs

### Local Docker runtime

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/`
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`
- Django Admin: `http://localhost:8000/<DJANGO_ADMIN_URL>`

### Production

Production URL depends on the Render service configuration.

Current public frontend URL used in the project documentation:

```text
https://p95max.dev
```

---

## Project Structure

```text
.
├── backend/                     # Django REST API
│   ├── api/                     # Portfolio, contact form, analytics logic
│   │   ├── fixtures/            # Project data fixtures
│   │   ├── migrations/          # Django migrations
│   │   ├── templates/emails/    # Email notification templates
│   │   └── utils/               # Shared backend helpers
│   ├── config/                  # Django project settings and URL config
│   │   ├── settings.py
│   │   ├── test_settings.py
│   │   └── urls.py
│   ├── tests/                   # Pytest critical backend tests
│   ├── Dockerfile
│   ├── Procfile
│   ├── build.sh
│   ├── entrypoint.sh
│   ├── gunicorn.conf.py
│   ├── manage.py
│   └── pyproject.toml
│
├── frontend/                    # React + Vite frontend
│   ├── public/                  # Static public assets copied by Vite
│   ├── src/
│   │   ├── components/          # Shared UI components
│   │   ├── data/                # Static frontend data
│   │   ├── hooks/               # React hooks
│   │   ├── pages/               # Main pages
│   │   ├── analytics.ts
│   │   ├── privacy.ts
│   │   └── types.ts
│   ├── nginx/                   # Frontend Nginx config
│   ├── package.json
│   └── vite.config.ts
│
├── nginx/                       # Root reverse proxy config
│   └── default.conf
│
├── .env.example
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/p95max/MyPortfolioSPA.git
cd MyPortfolioSPA
```

### 2. Create backend environment file

Create `backend/.env.dev`:

```env
DJANGO_SECRET_KEY=django-insecure-local-dev-key
DJANGO_DEBUG=True
DJANGO_ADMIN_URL=admin/

POSTGRES_DB=portfolio_db
POSTGRES_USER=portfolio_user
POSTGRES_PASSWORD=portfolio_password
DB_HOST=db
DB_PORT=5432

DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=adminpass

ALLOWED_HOST=localhost
EXTRA_ALLOWED_HOSTS=127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8000
CORS_ALLOWED_ORIGINS=http://localhost:3000

TURNSTILE_SECRET=your-turnstile-secret
FRONTEND_BASE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:8000

EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
NOTIFY_EMAILS=your_email@gmail.com
DISPLAY_TZ=Europe/Berlin

# Optional analytics email alerts.
ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=False
ANALYTICS_NOTIFY_DIRECT_VISITORS=False
TRUST_ANALYTICS_GEO_HEADERS=False
ANALYTICS_GEOIP_LOOKUP_ENABLED=False

# Optional. If omitted, Django uses local memory cache.
REDIS_URL=
```

### 3. Create frontend environment file

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_TURNSTILE_SITEKEY=your-turnstile-site-key
VITE_SNOW=auto
```

### 4. Build frontend assets

The Docker Compose frontend service serves `frontend/dist` through Nginx, so the frontend build must exist before starting the Nginx container.

```bash
cd frontend
npm ci
npm run build
cd ..
```

### 5. Start the stack

```bash
docker compose up -d --build
```

### 6. Apply fixtures, if needed

```bash
docker compose exec web poetry run python manage.py loaddata api/fixtures/backup_db.json
```

---

## Backend API

### Projects

```http
GET /api/projects/
```

Returns portfolio projects ordered by `sort_order`, then `pk`.

Each project includes a `screenshots` array. Current production data uses
absolute Cloudinary delivery URLs stored in `ProjectScreenshot.image_url`.

Absolute URLs are returned unchanged:

- `https://res.cloudinary.com/.../image/upload/.../example.png`

The serializer also keeps legacy local path support:

- `img/screenshots/example.png` -> `/screenshots/example.png`
- `screenshots/example.png` -> `/screenshots/example.png`
- `example.png` -> `/screenshots/example.png`

### Contact form

```http
POST /api/contact/
Content-Type: application/json
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I would like to get in touch.",
  "cf_turnstile_token": "turnstile-token",
  "hp": ""
}
```

The `hp` field is a honeypot. Normal users should leave it empty. Bots that fill it receive a fake successful response and the message is dropped.

Successful response:

```json
{
  "message": "Thank you for your message!"
}
```

Captcha failure response:

```json
{
  "detail": "captcha_failed"
}
```

---

## Django Admin

The admin URL is configured through:

```env
DJANGO_ADMIN_URL=admin/
```

For production, use a non-obvious path and keep the trailing slash:

```env
DJANGO_ADMIN_URL=your-random-admin-path/
```

Admin capabilities:

- create, edit, delete, and reorder projects
- manage project screenshots
- reorder project screenshots from the screenshots admin list
- edit screenshot captions and URLs from the screenshots admin list
- preview screenshots from the admin panel
- review contact messages
- set message status
- add internal notes
- bulk mark messages as `In progress`, `Done`, or `Spam`

Superuser auto-creation is handled in `backend/entrypoint.sh` when these variables exist:

```env
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=adminpass
```

---

## Tests

The backend has a pytest-based test suite for critical API and business logic.

Covered areas:

* contact form validation;
* Cloudflare Turnstile flow;
* honeypot spam protection;
* contact message saving;
* email notification fail-safe behavior;
* analytics event validation and saving;
* project ordering;
* screenshot URL normalization;
* contact message admin status actions.

Tests use a dedicated Django test settings module:

```text
config.test_settings
```

The test settings use SQLite and disabled migrations for fast local test execution.

Run tests from the `backend` directory:

```bash
poetry run pytest --ds=config.test_settings --nomigrations -vv -ra --tb=short
```

Expected result:

```text
-- passed in -.--s
```


---

### Analytics

```http
POST /api/analytics/
Content-Type: application/json
```

The project includes simple self-hosted analytics for basic portfolio usage insights.

Analytics are optional and only run after the user accepts analytics storage in the cookie consent banner. If analytics consent is not given, no analytics request is sent and no anonymous analytics ID or session ID is created.

Request body:

```json
{
  "event_type": "project_github_click",
  "path": "/projects",
  "referrer": "",
  "language": "en-US",
  "source_type": "linkedin",
  "utm_source": "linkedin",
  "utm_medium": "profile",
  "utm_campaign": "job_search",
  "os": "Linux",
  "browser": "Chrome",
  "device_type": "desktop",
  "anonymous_id": "client-generated-random-id",
  "session_id": "session-generated-random-id",
  "metadata": {
    "project_id": "jobapply",
    "project_title": "JobApply",
    "target": "project_github",
    "url_host": "github.com"
  }
}
```

Supported event types:

* `page_view`
* `project_view`
* `project_github_click`
* `contact_submit`
* `outbound_link_click`
* `credential_view`
* `credential_link_click`

Tracked event examples:

* `page_view` — when a page is opened
* `project_view` — when a project preview/screenshot is opened
* `project_github_click` — when a project GitHub link is clicked
* `contact_submit` — when the contact form is successfully submitted
* `outbound_link_click` — when an external link is clicked, for example GitHub, LinkedIn, Telegram, email or live demo
* `credential_view` — when a credential preview is opened.
* `credential_link_click` — when an original credential file or verification URL is opened.

Stored backend fields:

* event type
* normalized path without query parameters
* external referrer, if available
* browser language
* country code from trusted proxy/CDN request headers, when explicitly enabled
* normalized source type, for example `direct`, `linkedin`, `github`, `search`, `social` or `referral`
* UTM parameters: `utm_source`, `utm_medium`, `utm_campaign`
* detected operating system
* detected browser
* device type: `mobile`, `tablet`, `desktop` or `unknown`
* browser timezone and UTC offset
* client-side anonymous ID
* session-level anonymous ID
* event metadata
* creation timestamp

The `path` field is stored without query parameters. UTM values are stored separately in dedicated fields.

Trusted-header country detection is disabled by default. Set
`TRUST_ANALYTICS_GEO_HEADERS=True` only when the request reaches Django through a
trusted CDN/proxy path that prevents clients from spoofing geo headers.

When trusted geo headers are unavailable, `ANALYTICS_GEOIP_LOOKUP_ENABLED=True`
enables a country-only lookup for the first page view of a new anonymous visitor.
The default provider is `api.country.is`; the client IP is not stored in the
portfolio database and lookup failures do not reject analytics events.

The analytics endpoint is throttled through DRF throttling:

```text
analytics: 30/minute
analytics_global: 1000/hour
```

Analytics data is stored in the `AnalyticsEvent` model and can be reviewed in Django Admin.

The Django Admin list view shows only key fields:

* created at
* event type
* path
* source type
* country
* device type
* browser
* event details summary

Additional data such as referrer, UTM parameters, anonymous identifiers and raw metadata is available in the analytics event detail view.

Frontend storage used for consent and analytics:

```text
cookie-consent-v1
analytics-anonymous-id-v1
analytics-session-id-v1
analytics-source-context-v1
```

No external analytics provider such as Google Analytics is used.


---

## Screenshots Storage

Project screenshots are stored as URL strings in `ProjectScreenshot.image_url`.

Current production data uses Cloudinary delivery URLs:

```text
https://res.cloudinary.com/<cloud-name>/image/upload/.../example.png
```

Recommended format for new screenshots:

```text
https://res.cloudinary.com/<cloud-name>/image/upload/f_auto,q_auto,c_limit,w_1400/.../example.png
```

Absolute `http://` and `https://` values are rendered directly by the frontend
and the Django Admin preview.

Legacy relative paths such as `/screenshots/example.png` are still supported by
the backend serializer. If relative paths are used, the admin preview resolves
them using:

```env
FRONTEND_BASE_URL=http://localhost:3000
```

The current `api/fixtures/backup_db.json` fixture mirrors the Cloudinary-based
project data and does not require local files under `frontend/public/screenshots`.

---

## Email Notifications

When a contact message passes validation and is saved, the backend sends an SMTP notification email to recipients from:

```env
NOTIFY_EMAILS=owner@example.com,backup@example.com
```

Fallback behavior:

- if `NOTIFY_EMAILS` is empty, `NOTIFY_EMAIL` is used
- if both are empty and `EMAIL_HOST_USER` exists, `EMAIL_HOST_USER` is used

The notification includes:

- message ID
- date in `DISPLAY_TZ`
- sender name
- sender email
- message text

SMTP configuration:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
NOTIFY_EMAILS=your_email@gmail.com
DISPLAY_TZ=Europe/Berlin
```

Current code uses:

```text
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_SUBJECT_PREFIX=[Portfolio]
```

These values are configured in `settings.py`, not through environment variables.

---

### Analytics Visitor Notifications

The backend can optionally send an email when a new first-time analytics visitor is detected.

This feature is disabled by default and controlled through:

```env
ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=False
ANALYTICS_NOTIFY_DIRECT_VISITORS=False
BACKEND_BASE_URL=https://your-backend-domain.example.com
```

Behavior:
-only page_view events can trigger a new visitor notification;
-visitors without anonymous_id are ignored;
-direct visitors are ignored unless ANALYTICS_NOTIFY_DIRECT_VISITORS=True;
-duplicate notifications for the same anonymous visitor are suppressed through cache;
-notification recipients use the same NOTIFY_EMAILS fallback chain as contact form emails. 

---

## Security Notes

Implemented:

- server-side Cloudflare Turnstile verification
- honeypot field on the contact form
- DRF throttling for contact submissions
- Redis-backed throttling when `REDIS_URL` is configured
- local-memory throttling fallback for development
- DRF proxy hop count via `DRF_NUM_PROXIES` / `NUM_PROXIES`
- opt-in analytics geo header trust through `TRUST_ANALYTICS_GEO_HEADERS`
- production-only secure cookies
- production-only SSL redirect
- production-only HSTS
- production-only `X_FRAME_OPTIONS = DENY`
- production-only content type sniffing protection
- CORS restricted by `CORS_ALLOWED_ORIGINS` when `DJANGO_DEBUG=False`

Operational notes:

- Do not commit real `.env.dev` or `.env` files.
- Keep `DJANGO_DEBUG=False` in production.
- Use a strong `DJANGO_SECRET_KEY` in production.
- Use a non-obvious `DJANGO_ADMIN_URL` in production.
- Configure `CSRF_TRUSTED_ORIGINS` and `CORS_ALLOWED_ORIGINS` explicitly in production.
- Use Redis in production if contact throttling must survive process restarts and scale across instances.
- Leave `TRUST_ANALYTICS_GEO_HEADERS=False` unless the origin only receives trusted CDN/proxy headers.

---

## Docker Compose Notes

The active Nginx config mounted by Docker Compose is:

```text
nginx/default.conf
```

It serves:

- React build from `/usr/share/nginx/html`
- legacy `/screenshots/` assets if local files are present
- backend API proxy under `/api/`

Current Compose service layout:

- `db`: PostgreSQL
- `web`: Django backend
- `frontend`: Nginx static frontend

PostgreSQL is exposed to the host as:

```yaml
ports:
  - "5440:5432"
```

This means:
- inside Docker Compose, Django connects to PostgreSQL through DB_HOST=db and DB_PORT=5432;
- from the host machine, PostgreSQL is available on localhost:5440.

Do not set DB_PORT=5440 for the Django container unless the database service itself is also configured to listen on 5440 internally.

---

## Render Deployment Notes

Backend service:

- root directory: `backend`
- build command: `./build.sh`
- runtime command: Gunicorn
- required backend environment variables:
  - `DJANGO_SECRET_KEY`
  - `DJANGO_DEBUG=False`
  - `DJANGO_ADMIN_URL`
  - `ALLOWED_HOST`
  - `EXTRA_ALLOWED_HOSTS`
  - `CSRF_TRUSTED_ORIGINS`
  - `CORS_ALLOWED_ORIGINS`
  - `TURNSTILE_SECRET`
  - `FRONTEND_BASE_URL`
  - `REDIS_URL`, recommended for production throttling
  - `DRF_NUM_PROXIES=0`
  - `EMAIL_HOST_USER`
  - `EMAIL_HOST_PASSWORD`
  - `NOTIFY_EMAILS`
  Optional backend environment variables:
  - `ANALYTICS_NEW_VISITOR_EMAIL_ENABLED`
  - `ANALYTICS_NOTIFY_DIRECT_VISITORS`
  - `TRUST_ANALYTICS_GEO_HEADERS`
  - `MEMORY_LIMIT`

Frontend static service:

- root directory: `frontend`
- build command: `npm ci && npm run build`
- publish path: `dist`
- frontend build-time environment variables:
  - `VITE_API_URL`, optional when using same-origin `/api/*` rewrites
  - `VITE_TURNSTILE_SITEKEY`
  - `VITE_SNOW`, optional

Important: variables without the `VITE_` prefix are not available to the Vite frontend bundle. Backend secrets must not be placed in the frontend static service environment.

---

## Useful Commands

### Backend

```bash
docker compose exec web poetry run python manage.py migrate
docker compose exec web poetry run python manage.py createsuperuser
docker compose exec web poetry run python manage.py loaddata api/fixtures/backup_db.json
docker compose exec web poetry run python manage.py dumpdata api.Project api.ProjectScreenshot --indent 2 > backend/api/fixtures/backup_db.json
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
npm run build
npm run preview
npm run lint
```

### Docker

```bash
docker compose up -d --build
docker compose down
docker compose down -v
```

---

## License

MIT

---

## Contacts

Author: Maksym Petrykin  
Email: [m.petrykin@gmx.de](mailto:m.petrykin@gmx.de)  
Telegram: [@max_p95](https://t.me/max_p95)
