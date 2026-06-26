# Backend - Django REST API

Backend service for the Portfolio SPA project.

The backend provides a read-only portfolio API, a contact form API, Django Admin-based content management, Cloudflare Turnstile verification, throttling, and SMTP notifications.

---

## Stack

- Python 3.12
- Django 5.2
- Django REST Framework
- PostgreSQL
- Redis cache support for throttling
- Gunicorn
- WhiteNoise
- drf-yasg
- Jazzmin
- django-admin-sortable2
- psycopg 3
- requests

---

## Main Capabilities

- Read-only API for portfolio projects.
- Project and screenshot management through Django Admin.
- Drag-and-drop project ordering through `sort_order`.
- Screenshot preview in Django Admin.
- Contact message API.
- Cloudflare Turnstile server-side verification.
- Honeypot protection.
- DRF throttling:
  - by email
  - by IP
  - by subnet
  - global
  - by message fingerprint
- Contact message workflow in Django Admin:
  - `New`
  - `In progress`
  - `Done`
  - `Spam`
- SMTP email notifications for new contact messages.
- Swagger UI and ReDoc API documentation.

---

## Environment File

For Docker-based local development, create:

```text
backend/.env.dev
```

The Django settings load `backend/.env.dev` automatically when the file exists.

Example:

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

EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
NOTIFY_EMAILS=your_email@gmail.com
DISPLAY_TZ=Europe/Berlin

REDIS_URL=
```

---

## Environment Variables

### Core Django

| Variable | Required | Description |
|---|---:|---|
| `DJANGO_SECRET_KEY` | yes | Django secret key. Use a generated value in production. |
| `DJANGO_DEBUG` | yes | `True` for local development, `False` for production. |
| `DJANGO_ADMIN_URL` | recommended | Custom admin path. Use trailing slash, for example `admin/`. |

### Database

The backend supports two database modes.

#### Production / Render-style

| Variable | Required | Description |
|---|---:|---|
| `DATABASE_URL` | yes in hosted DB mode | Full PostgreSQL URL. Parsed with `dj-database-url`. |

#### Docker / local explicit settings

| Variable | Required | Description |
|---|---:|---|
| `POSTGRES_DB` | yes | Database name. |
| `POSTGRES_USER` | yes | Database user. |
| `POSTGRES_PASSWORD` | yes | Database password. |
| `DB_HOST` | yes | Database host, usually `db` inside Docker Compose. |
| `DB_PORT` | yes | Database port, normally `5432`. |

### Hosts, CORS, CSRF

| Variable | Required | Description |
|---|---:|---|
| `ALLOWED_HOST` | production | Primary backend host. |
| `EXTRA_ALLOWED_HOSTS` | optional | Comma-separated additional hosts. |
| `CSRF_TRUSTED_ORIGINS` | production | Comma-separated trusted origins, including scheme. |
| `CORS_ALLOWED_ORIGINS` | production | Comma-separated frontend origins, including scheme. |

When `DJANGO_DEBUG=True`, CORS is open for local development.

When `DJANGO_DEBUG=False`, CORS is restricted to `CORS_ALLOWED_ORIGINS`.

### Superuser auto-creation

Used by `entrypoint.sh`:

| Variable | Required | Description |
|---|---:|---|
| `DJANGO_SUPERUSER_USERNAME` | optional | Username for automatic superuser creation. |
| `DJANGO_SUPERUSER_EMAIL` | optional | Superuser email. |
| `DJANGO_SUPERUSER_PASSWORD` | optional | Superuser password. |

If the username is missing, no superuser is created automatically.

### Contact form and anti-spam

| Variable | Required | Description |
|---|---:|---|
| `TURNSTILE_SECRET` | yes | Cloudflare Turnstile secret key for server-side verification. |
| `REDIS_URL` | recommended in production | Redis cache URL for DRF throttling. Falls back to local memory cache if empty. |

### Frontend integration

| Variable | Required | Description |
|---|---:|---|
| `FRONTEND_BASE_URL` | recommended | Used by admin screenshot preview for relative `/screenshots/...` paths. |

### Email

| Variable | Required | Description |
|---|---:|---|
| `EMAIL_HOST` | optional | SMTP host. Defaults to `smtp.gmail.com`. |
| `EMAIL_HOST_USER` | yes for notifications | SMTP username and default sender. |
| `EMAIL_HOST_PASSWORD` | yes for notifications | SMTP password or Gmail app password. |
| `NOTIFY_EMAILS` | recommended | Comma-separated recipient list. |
| `NOTIFY_EMAIL` | optional fallback | Single recipient fallback. |
| `DISPLAY_TZ` | optional | Timezone used in email notification timestamps. Defaults to `Europe/Berlin`. |

Current code hardcodes:

```text
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_SUBJECT_PREFIX=[Portfolio]
```

---

## API Endpoints

### Projects

```http
GET /api/projects/
```

Returns projects ordered by:

```python
sort_order, pk
```

The serializer normalizes screenshot paths for frontend usage.

### Contact

```http
POST /api/contact/
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello",
  "cf_turnstile_token": "token",
  "hp": ""
}
```

Behavior:

1. Honeypot is checked first.
2. Turnstile token is verified against Cloudflare.
3. Serializer validates `name`, `email`, and `message`.
4. Message is saved to `ContactMessage`.
5. Email notification is attempted if recipients are configured.
6. API returns success even if email notification fails after DB save.

Successful response:

```json
{
  "message": "Thank you for your message!"
}
```

Captcha failure:

```json
{
  "detail": "captcha_failed"
}
```

---

### Analytics

```http
POST /api/analytics/
```

Self-hosted analytics endpoint for basic portfolio usage insights.

Analytics are optional and are only sent by the frontend after the user accepts analytics storage in the cookie consent banner. If analytics consent is not given, the frontend does not send analytics requests and does not create analytics identifiers.

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

Event semantics:

* `page_view` — sent when a page is opened.
* `project_view` — sent when a project screenshot preview is opened.
* `project_github_click` — sent when a project GitHub link is clicked.
* `contact_submit` — sent after a successful contact form submission.
* `outbound_link_click` — sent when an external link is clicked, for example GitHub, LinkedIn, Telegram, email, or live demo.

Stored backend fields:

* event type
* normalized path without query parameters
* external referrer, if available
* browser language
* country code from proxy/CDN request headers, when available
* normalized source type, for example `direct`, `linkedin`, `github`, `search`, `social`, or `referral`
* UTM parameters:

  * `utm_source`
  * `utm_medium`
  * `utm_campaign`
* detected operating system
* detected browser
* device type:

  * `mobile`
  * `tablet`
  * `desktop`
  * `unknown`
* client-side anonymous ID
* session-level anonymous ID
* event metadata
* creation timestamp

The `path` field is stored without query parameters. UTM values are stored separately in dedicated fields.

Country detection is handled server-side from request headers when available. The frontend does not send the country manually.

The analytics endpoint is throttled through DRF throttling:

```text
analytics: 120/minute
```

Analytics data is stored in the `AnalyticsEvent` model and can be reviewed in Django Admin.

The Django Admin list view intentionally shows only key fields:

* created at
* event type
* path
* source type
* country
* device type
* browser
* event details summary

Additional data such as referrer, UTM parameters, anonymous identifiers, legacy screen fields, and raw metadata is available in the analytics event detail view.

No external analytics provider such as Google Analytics is used.

---

## API Documentation

Swagger UI:

```text
/swagger/
```

ReDoc:

```text
/redoc/
```

---

## Models

### Project

Fields:

- `title`
- `description`
- `tech_stack`
- `github_url`
- `demo_url`
- `sort_order`

New projects automatically receive the next `sort_order` value if no explicit order is provided.

### ProjectScreenshot

Fields:

- `project`
- `image_url`
- `caption`

`image_url` accepts:

- relative paths like `/screenshots/example.png`
- absolute `http://` URLs
- absolute `https://` URLs

### ContactMessage

Fields:

- `name`
- `email`
- `message`
- `created_at`
- `status`
- `internal_note`
- `processed_at`
- `processed_by`
- `updated_at`

Default ordering:

```python
-created_at
```

---

## Admin

Admin URL:

```text
/<DJANGO_ADMIN_URL>
```

Default:

```text
/admin/
```

Admin features:

- Jazzmin theme.
- Project list with sortable order.
- Inline screenshot management.
- Screenshot preview.
- Contact message status badges.
- Contact message bulk actions:
  - mark as in progress
  - mark as done
  - mark as spam

---

## Local Commands

Run from project root unless stated otherwise.

```bash
docker compose up -d --build
docker compose down
docker compose down -v
```

Migrations:

```bash
docker compose exec web poetry run python manage.py makemigrations api
docker compose exec web poetry run python manage.py migrate
```

Load fixtures:

```bash
docker compose exec web poetry run python manage.py loaddata api/fixtures/backup_db.json
```

Dump project data:

```bash
docker compose exec web poetry run python manage.py dumpdata api.Project api.ProjectScreenshot --indent 2 > backend/api/fixtures/backup_db.json
```

Create superuser manually:

```bash
docker compose exec web poetry run python manage.py createsuperuser
```

---

## Production Behavior

When `DJANGO_DEBUG=False`, the following production security settings are enabled:

- SSL redirect
- secure session cookie
- secure CSRF cookie
- HSTS
- `X_FRAME_OPTIONS = DENY`
- content type sniffing protection
- strict referrer policy
- proxy SSL header support for hosted reverse proxy deployments

---

## Build and Runtime

### Dockerfile

The backend image:

1. Uses `python:3.12-slim`.
2. Installs system build dependencies.
3. Installs Poetry 1.7.1.
4. Installs dependencies from `pyproject.toml`.
5. Copies the app.
6. Runs `collectstatic`.
7. Starts through `entrypoint.sh`.

### Entrypoint

`entrypoint.sh` performs:

1. `migrate --noinput`
2. optional superuser creation
3. Gunicorn startup

### Render build

`build.sh` performs:

1. Poetry installation
2. dependency installation
3. migrations
4. `collectstatic`

---

## Known Operational Checks

- Keep `DJANGO_ADMIN_URL` with a trailing slash.
- Ensure `DATABASE_URL` or local DB variables are configured, not both accidentally with conflicting values.
- Use Redis in production if throttling must be consistent across multiple workers or restarts.
- Current Docker Compose PostgreSQL port mapping should be checked. PostgreSQL normally listens on `5432` inside the container.
- Do not put backend secrets into frontend build-time environment variables.
