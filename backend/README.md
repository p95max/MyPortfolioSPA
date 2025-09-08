# Backend - Django API

This is the backend service for the portfolio SPA project, built with Django and Django REST Framework.

## Features

- REST API for portfolio data
- PostgreSQL database integration
- Environment variables support via `.env`
- Dependency management with Poetry

## Setup

1. Install dependencies:

```bash
  poetry install
```

2. Configure environment variables in `.env` file:

```env
POSTGRES_DB=your_db_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
DATABASE_URL=postgres://user:password@db:5432/your_db_name
```

3. Run migrations:

```bash
  poetry run python manage.py migrate
```

4. Start the development server:

```bash
  poetry run python manage.py runserver 0.0.0.0:8000
```

## Docker

Build and run with Docker Compose:

```bash
  docker-compose up --build
```

## API Documentation

Swagger UI is available at `/swagger/` endpoint.