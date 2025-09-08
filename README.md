# Portfolio SPA Project

This project is a Single Page Application portfolio consisting of a React frontend and a Django backend, containerized with Docker.

## Architecture

- **Backend:** Django REST API with PostgreSQL database
- **Frontend:** React SPA served by Nginx
- **Database:** PostgreSQL
- **Containerization:** Docker Compose orchestrates all services

## Getting Started

1. Clone the repository:

```bash
    git clone https://github.com/yourusername/yourrepo.git
    cd yourrepo
```

2. Create `.env` file with database credentials.

3. Build and start all services:

```bash
    docker-compose up --build
```

4. Access frontend at `http://localhost:3000` and backend API at `http://localhost:8000`.

## Development

- Backend code is in `/backend`
- Frontend code is in `/frontend`

## License

MIT License