# Portfolio Backend

This is the backend for the Portfolio SPA project. It is built with **Django 5** and **Django REST Framework** and provides APIs for projects, blog posts, and contact messages. The backend uses **PostgreSQL** as the database and **Gunicorn** as the WSGI server. Static and media files are served via **Nginx** in Docker.

---

## Features

* REST API endpoints for:

  * Projects
  * Blog posts
  * Contacts
* CORS enabled via `django-cors-headers`
* API schema and documentation with `drf-spectacular`
* PostgreSQL database integration
* Dockerized setup with separate containers for backend, database, and Nginx
* Gunicorn for production-ready WSGI server

---

## Requirements

* Python 3.12
* Poetry
* Docker & Docker Compose
* PostgreSQL (for local development if not using Docker)

---

## Installation

1. Clone the repository:

```bash
    git clone https://github.com/yourusername/portfolio-backend.git
    cd portfolio-backend
```

2. Install dependencies with Poetry:

```bash
    poetry install
```

3. Set up environment variables:

Create a `.env` file with the following content:

```env
POSTGRES_DB=portfolio_db
POSTGRES_USER=youruser
POSTGRES_PASSWORD=yourpassword
DB_PORT=5432
SECRET_KEY=your_django_secret_key
DEBUG=True
```

---

## Running with Docker

1. Build and start the containers:

```bash
    docker compose up --build
```

2. Access the services:

* Backend API: `http://localhost:8000/api/`
* Swagger docs: `http://localhost:8000/api/docs/`

---

## Running Locally (Without Docker)

1. Apply migrations:

```bash
    python manage.py migrate
```

2. Create a superuser (optional, for admin panel):

```bash
    python manage.py createsuperuser
```

3. Run the development server:

```bash
    python manage.py runserver
```

---

## API Documentation

API schema is available at:

```
http://localhost:8000/api/schema/
```

Swagger UI:

```
http://localhost:8000/api/docs/
```

---

## Project Structure

```
portfolio_backend/
├── apps/
│   ├── projects/
│   ├── blog/
│   └── contacts/
├── portfolio_backend/
│   ├── settings.py
│   └── urls.py
├── staticfiles/
├── media/
├── Dockerfile
├── docker-compose.yml
└── pyproject.toml
```

---

## License

This project is licensed under the MIT License.
