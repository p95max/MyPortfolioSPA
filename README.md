# Portfolio SPA Project

This project is a Single Page Application portfolio consisting of a React frontend and a Django backend, containerized with Docker.

## Architecture

- **Backend:** Django REST API
- **Frontend:** React + VITE, served by Nginx
- **Database:** PostgreSQL 17
- **Containerization:** Docker Compose orchestrates all services


## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/p95max/MyPortfolioSPA.git
cd MyPortfolioSPA
```

2. Create `.env` file with database credentials.

3. Build and start all services:

```bash
docker-compose up --build
```

4. Access frontend at `http://localhost:3000` and backend API at `http://localhost:8000`.


## Django Admin Guide

The Django Admin interface provides a powerful and easy-to-use way to manage your application's data. You can create, read, update, and delete (CRUD) records for your models without writing any additional frontend code.

### 1. Register Your Models

For your models to appear in the Django Admin, you need to register them in the `admin.py` file of your Django application.

**Example:**

In `backend/MyPortfolioSPA/admin.py`:

```python
from django.contrib import admin
from .models import Project, Skill, Contact  # Replace with your actual models

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'created_at')  # Customize displayed fields

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'level')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject')
```

### 3. Automated Superuser Creation

A Django superuser account is essential for accessing the Admin interface. In this setup, the superuser is **automatically created by a script** (`backend/create_superuser.py`) during the `web` service startup, but only if it doesn't already exist.
Superuser credentials are provided via your `.env` file (check **backend/env.example**) in backend:


### 4. Manage Your Data

- On the admin dashboard, you will see your registered models listed under your application name.
- Click on a model (e.g., "Projects") to view, add, edit, or delete records.
- Use the "Add [Model Name]" button to create new entries.
- Click on existing entries to edit them.

This guide should help you get started with managing your portfolio data through the Django Admin.

## Development

- Backend code is in `/backend`
- Frontend code is in `/frontend`

## License

MIT License