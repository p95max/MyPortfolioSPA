# Portfolio SPA Project

[![CI](https://github.com/p95max/MyPortfolioSPA/actions/workflows/ci.yml/badge.svg?branch=prod)](https://github.com/p95max/MyPortfolioSPA/actions/workflows/ci.yml)
[![CodeQL](https://github.com/p95max/MyPortfolioSPA/actions/workflows/codeql-analysis.yml/badge.svg?branch=prod)](https://github.com/p95max/MyPortfolioSPA/actions/workflows/codeql-analysis.yml)
[![Coverage](https://codecov.io/gh/p95max/MyPortfolioSPA/branch/prod/graph/badge.svg)](https://codecov.io/gh/p95max/MyPortfolioSPA)

Production portfolio SPA built with **React 19 + TypeScript + Vite** and **Django REST Framework**.

Public content, projects, certificates, contact details and legal texts are managed through Django Admin and exposed through REST endpoints. The frontend keeps safe built-in fallback text for singleton content, so temporary API failures do not make the main pages unusable.

Public site: `https://p95max.dev`

## Stack

### Backend

- Python 3.12
- Django 5.2
- Django REST Framework
- PostgreSQL
- Redis-compatible cache for shared throttling
- Gunicorn and WhiteNoise
- Jazzmin admin theme
- django-admin-sortable2
- drf-yasg
- Cloudflare Turnstile
- SMTP notifications

### Frontend

- React 19
- TypeScript
- Vite 7
- React Router
- Nginx static serving
- Cloudflare Turnstile widget
- consent-based self-hosted analytics

## Main features

- Project and screenshot management through Django Admin.
- Certificate management with ordering, publication flags and previews.
- Contact form with validation, Turnstile, honeypot protection and layered DRF throttling.
- Contact-message workflow: `New`, `In progress`, `Done`, `Spam`.
- Consent-based self-hosted analytics.
- German legal pages at `/impressum` and `/datenschutz`.
- English and German UI localization.
- Admin-managed public singleton content with direct form navigation.

## Admin-managed singleton content

The following sections contain only one record. Clicking them in the Jazzmin sidebar opens the edit form directly instead of showing a one-row changelist.

### Homepage content

Controls the homepage hero/About block:

- availability text in English and German
- greeting in English and German
- role in English and German
- description in English and German
- displayed name
- ordered technology stack

API:

```http
GET /api/homepage-content/
```

### Contact details

Controls the public contact links:

- email
- GitHub
- LinkedIn
- Telegram

API:

```http
GET /api/contact-details/
```

### Legal content

Controls:

- trusted HTML for the Impressum page
- trusted HTML for the privacy-policy page
- all cookie-consent dialog labels and descriptions in English and German

The cookie-consent logic itself remains in frontend code. Admin users can change visible wording but cannot change consent storage, analytics activation or analytics-storage cleanup behavior.

API:

```http
GET /api/legal-content/
```

`impressum_html` and `privacy_html` are rendered as trusted administrator-provided HTML. Access to this admin section must therefore remain restricted to trusted staff.

## Content fallback behavior

The frontend requests singleton content from the backend. If the request fails or the response is incomplete:

- the homepage uses its built-in i18n content;
- the legal pages use built-in legal fallback text;
- the cookie dialog uses the existing i18n strings.

This keeps the public site functional during a backend restart or temporary API outage.

## Main API endpoints

```text
GET  /api/projects/
GET  /api/credentials/
GET  /api/homepage-content/
GET  /api/contact-details/
GET  /api/legal-content/
POST /api/contact/
POST /api/analytics/
GET  /api/health/
```

Swagger and ReDoc are available from the backend service:

```text
/swagger/
/redoc/
```

## Local development

### Backend environment

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

EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
NOTIFY_EMAILS=your_email@gmail.com
DISPLAY_TZ=Europe/Berlin

REDIS_URL=
```

### Frontend environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_TURNSTILE_SITEKEY=your-turnstile-site-key
VITE_SNOW=auto
```

### Run with Docker Compose

```bash
cd frontend
npm ci
npm run build
cd ..
docker compose up -d --build
```

Apply migrations:

```bash
docker compose exec web poetry run python manage.py migrate
```

## Tests and checks

Backend:

```bash
cd backend
poetry run python manage.py check
poetry run python manage.py makemigrations --check --dry-run
poetry run pytest --ds=config.test_settings --nomigrations -vv -ra --tb=short
```

Frontend:

```bash
cd frontend
npm ci
npm run lint
npm run test -- --run
npm run build
```

## Security notes

- Analytics are disabled until explicit consent.
- Rejecting analytics removes the client analytics identifiers.
- Cloudflare Turnstile protects the contact form.
- Contact and analytics endpoints use DRF throttling.
- Production uses secure cookies, HTTPS redirect, HSTS and restricted CORS.
- Keep `DJANGO_DEBUG=False` and use a non-obvious `DJANGO_ADMIN_URL` in production.
- Use Redis in production when throttling must be shared across workers.
- Only trusted administrators should edit HTML fields in `Legal content`.

## Deployment

Render configuration is stored in `render.yaml`.

Backend build:

```text
root: backend
build: ./build.sh
runtime: Gunicorn
```

Frontend build:

```text
root: frontend
build: npm ci && npm run build
publish: dist
```

Frontend variables must use the `VITE_` prefix. Backend secrets must never be exposed through frontend environment variables.

## License

MIT

## Contact

Maksym Petrykin  
Email: [m.petrykin@gmx.de](mailto:m.petrykin@gmx.de)  
Telegram: [@max_p95](https://t.me/max_p95)
