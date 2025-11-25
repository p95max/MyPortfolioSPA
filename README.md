# Portfolio SPA Project

Single Page Application portfolio with **React (Vite)** frontend and **Django REST** backend, containerized via **Docker Compose**.

## Features

- Project/skills content managed via Django Admin
- Admin panel URL address is protected by .env
- Contact form with:
  - **CAPTCHA** validation (server-side token verify)
  - **Anti-spam safeguards** (rate limits per IP/email, minimal payload checks, optional honeypot)
  - **Email notifications** to a configurable list
  - Optional deep-link to the admin detail page of the created message

## Architecture

- **Backend:** Django REST API
- **Frontend:** React + Vite, served by Nginx
- **Database:** PostgreSQL 17
- **Orchestration:** Docker Compose

## Getting Started

```bash
git clone https://github.com/p95max/MyPortfolioSPA.git
cd MyPortfolioSPA
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## Environment Variables

### Backend (`backend/.env`)

```
#Django
DEBUG=True
SECRET_KEY=django-

#DB
DB_NAME=dbname
DB_USER=user
DB_PASSWORD=pass
DB_HOST=localhost
DB_PORT=5432

# superuser
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@admin.com
DJANGO_SUPERUSER_PASSWORD=adminpass

# django admin
DJANGO_ADMIN_URL=admin

# local dev db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=S3cur3P@ss
POSTGRES_DB=mydb

# email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

NOTIFY_EMAIL=your_email@gmail.com

TURNSTILE_SECRET=your-capcha-secret-key
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE=http://localhost:8000
VITE_CAPTCHA_SITE_KEY=your-site-key
```

## Django Admin

- Superuser auto-created if missing.
- Custom admin URL via `DJANGO_ADMIN_URL`.
- URL address is protected by .env

## Contact Form — End-to-End Flow

### 1) Frontend

Disables submit until CAPTCHA verification. Sends:

```
POST /contact-message/
{
  "name": "John",
  "email": "john@example.com",
  "message": "Hello",
  "captcha_token": "<token>",
  "company": "Acme"
}
```

### 2) Backend validation

- CAPTCHA verify using `CAPTCHA_SECRET`
- Throttles
- Honeypot check
- Persists ContactMessage
- Sends notification email

### 3) Responses

- 201 Created
- 400 Invalid
- 429 Throttled

## Testing

```bash
curl -X POST http://localhost:8000/contact-message/   -H 'Content-Type: application/json'   -d '{"name":"Test","email":"a@a.com","message":"hi","captcha_token":"x"}'
```

## Security Notes

- Server-side CAPTCHA validation
- Throttling
- Escape user input

## Development

- Backend: `/backend`
- Frontend: `/frontend`

## Troubleshooting

- CAPTCHA fails → check domain + keys
- 429 → throttling
- Emails → SMTP creds

## License

MIT

## Contacts

Author: Maksym Petrykin  
Email: [m.petrykin@gmx.de](mailto:m.petrykin@gmx.de)  
Telegram: [@max_p95](https://t.me/max_p95)