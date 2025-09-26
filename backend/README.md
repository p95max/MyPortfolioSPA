# Backend - Django API

This is the backend service for the portfolio SPA project, built with Django and Django REST Framework.

## Features

- REST API for portfolio data (Projects, Contact, etc.)
- PostgreSQL database integration
- Environment variables support via `.env`
- Dependency management with Poetry
- Automatic migrations and superuser creation via Docker
- Configurable Django Admin URL
- Database backup/restore using Django fixtures

## API Documentation

Interactive API docs are available through **Swagger UI** at the `/swagger/` endpoint.

## Database Backup & Restore

This project includes a **fixtures backup** of the database that can be used to restore sample data.

Fixture file path:

```
backend/api/fixtures/backup_db.json
```

### Load fixture data into the database:

```bash
docker-compose exec web poetry run python manage.py loaddata api/fixtures/backup_db.json
```

This will populate the PostgreSQL database with the default projects and related data.

### Create a new backup:

```bash
docker-compose exec web poetry run python manage.py dumpdata api.Project --indent 2 > backend/api/fixtures/backup_db.json
```

This exports your current data back into the fixtures file (`backup_db.json`).

## Environment Variables

The backend uses environment variables defined in the `.env` file(check **backend/.env.example**)

## Usage

1. Build and start the services:

```bash
docker-compose up -d --build
```

2. Run migrations (handled automatically on startup):

```bash
docker-compose exec web poetry run python manage.py migrate
```

3. Access Django Admin:

```
http://localhost:8000/<your-admin-url>/
```

(Default: `http://localhost:8000/admin/`)
